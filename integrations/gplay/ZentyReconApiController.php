<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * ZentyReconApiController
 * Follows GPlay naming convention (matching ZentyDatabankController & ZentyElastisApiController)
 * Handles PQC CBOM telemetry ingestion, Threat Recon, and License Authority
 */
class ZentyReconApiController extends Controller
{
    /**
     * Push Cryptographic Bill of Materials (CycloneDX CBOM)
     * POST /api/v1/zentyrecon/cbom/push
     */
    public function pushCbom(Request $request): JsonResponse
    {
        $payload = $request->all();
        $apiKey = $request->header('X-ZentyRecon-Key', 'anonymous');

        if (empty($payload)) {
            return response()->json(['success' => false, 'message' => 'Empty CBOM payload'], 400);
        }

        $domain = $payload['metadata']['component']['name'] ?? 'unknown-target';
        $reportId = 'cbom-' . Str::random(12);

        DB::table('zentyrecon_cboms')->insert([
            'report_id'   => $reportId,
            'api_key'     => $apiKey,
            'domain'      => $domain,
            'spec_version'=> $payload['specVersion'] ?? '1.6',
            'bom_format'  => $payload['bomFormat'] ?? 'CycloneDX-CBOM',
            'readiness'   => $payload['readinessScore'] ?? 0,
            'raw_json'    => json_encode($payload),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return response()->json([
            'success'   => true,
            'message'   => "CBOM for {$domain} indexed in GPlay DataBank",
            'report_id' => $reportId,
            'synced_at' => now()->toIso8601String(),
        ], 201);
    }

    /**
     * Retrieve CBOM audit history
     * GET /api/v1/zentyrecon/cbom/history
     */
    public function getCbomHistory(Request $request): JsonResponse
    {
        $apiKey = $request->header('X-ZentyRecon-Key');

        $reports = DB::table('zentyrecon_cboms')
            ->where('api_key', $apiKey)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get(['report_id', 'domain', 'readiness', 'created_at']);

        return response()->json([
            'success' => true,
            'count'   => count($reports),
            'history' => $reports,
        ]);
    }

    /**
     * Activate a Pro license with 1-machine binding
     * POST /api/v1/zentyrecon/license/activate
     */
    public function activateLicense(Request $request): JsonResponse
    {
        $request->validate([
            'license_key' => 'required|string',
            'machine_id'  => 'required|string',
        ]);

        $key = trim($request->input('license_key'));
        $machineId = trim($request->input('machine_id'));

        $license = DB::table('zentyrecon_licenses')->where('license_key', $key)->first();

        if (!$license) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid license key. Please check your purchase confirmation.',
            ], 404);
        }

        if ($license->status === 'revoked') {
            return response()->json([
                'success' => false,
                'message' => 'This license has been revoked.',
            ], 403);
        }

        if ($license->machine_id && $license->machine_id !== $machineId) {
            return response()->json([
                'success' => false,
                'message' => 'License is already bound to another PC. Deactivate it first before moving to a new machine.',
            ], 409);
        }

        DB::table('zentyrecon_licenses')->where('id', $license->id)->update([
            'machine_id'    => $machineId,
            'status'        => 'active',
            'activated_at'  => now(),
            'last_check_at' => now(),
            'updated_at'    => now(),
        ]);

        return response()->json([
            'success'      => true,
            'message'      => 'ZentyRecon Pro activated successfully!',
            'tier'         => $license->tier ?? 'Pro',
            'machine_id'   => $machineId,
            'expires_at'   => $license->expires_at,
        ]);
    }

    /**
     * Validate an active license heartbeat
     * POST /api/v1/zentyrecon/license/validate
     */
    public function validateLicense(Request $request): JsonResponse
    {
        $key = $request->input('license_key');

        if (!$key) {
            return response()->json(['valid' => false, 'message' => 'No key provided'], 400);
        }

        $license = DB::table('zentyrecon_licenses')->where('license_key', $key)->first();

        if (!$license || $license->status !== 'active') {
            return response()->json(['valid' => false, 'tier' => 'Community']);
        }

        DB::table('zentyrecon_licenses')->where('id', $license->id)->update([
            'last_check_at' => now(),
        ]);

        return response()->json([
            'valid'      => true,
            'tier'       => $license->tier,
            'expires_at' => $license->expires_at,
        ]);
    }

    /**
     * Deactivate a license to transfer to another PC
     * POST /api/v1/zentyrecon/license/deactivate
     */
    public function deactivateLicense(Request $request): JsonResponse
    {
        $key = $request->input('license_key');
        $machineId = $request->input('machine_id');

        $license = DB::table('zentyrecon_licenses')
            ->where('license_key', $key)
            ->where('machine_id', $machineId)
            ->first();

        if (!$license) {
            return response()->json(['success' => false, 'message' => 'License and machine pair not found'], 404);
        }

        DB::table('zentyrecon_licenses')->where('id', $license->id)->update([
            'machine_id' => null,
            'status'     => 'inactive',
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'message' => 'License unbound successfully.']);
    }

    /**
     * Health check ping
     * GET /api/v1/zentyrecon/ping
     */
    public function ping(): JsonResponse
    {
        return response()->json([
            'status'  => 'online',
            'service' => 'ZentyRecon GPlay API Gateway',
            'version' => '1.0.0',
            'time'    => now()->toIso8601String(),
        ]);
    }
}
