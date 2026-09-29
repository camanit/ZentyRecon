<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * ZentyReconLicenseController
 * Central License Authority for ZentyRecon Extension inside GPlay DataBank (gplay.ctar.tech)
 */
class ZentyReconLicenseController extends Controller
{
    /**
     * Activate a new Pro license for a specific machine fingerprint
     * POST /api/v1/zentyrecon/license/activate
     */
    public function activate(Request $request): JsonResponse
    {
        $request->validate([
            'license_key' => 'required|string',
            'machine_id'  => 'required|string',
            'email'       => 'nullable|email',
        ]);

        $key = trim($request->input('license_key'));
        $machineId = trim($request->input('machine_id'));

        // Check license pool in database
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
                'message' => 'This license has been revoked or refunded.',
            ], 403);
        }

        // Machine binding check: 1 license = 1 machine
        if ($license->machine_id && $license->machine_id !== $machineId) {
            return response()->json([
                'success' => false,
                'message' => 'License is already bound to another machine. Please deactivate it first.',
            ], 409);
        }

        // Activate and bind machine
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
    public function validate(Request $request): JsonResponse
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
     * Deactivate / Unbind a machine for license migration
     * POST /api/v1/zentyrecon/license/deactivate
     */
    public function deactivate(Request $request): JsonResponse
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
}
