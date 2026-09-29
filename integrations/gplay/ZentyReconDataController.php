<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * ZentyReconDataController
 * Ingests CBOM (CycloneDX) and Threat Recon reports into GPlay AI DataBank
 */
class ZentyReconDataController extends Controller
{
    /**
     * Push Cryptographic Bill of Materials (CBOM) to Cloud DataBank
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
     * Retrieve CBOM audit history for a user
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
}
