<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ZentyReconLicenseController;
use App\Http\Controllers\ZentyReconDataController;

/*
|--------------------------------------------------------------------------
| ZentyRecon Extension Ecosystem Routes
| File: routes/zentyrecon.php (Include in routes/api.php)
|--------------------------------------------------------------------------
*/

Route::prefix('v1/zentyrecon')->group(function () {

    // 1. License Management & 1-PC Machine Binding
    Route::post('/license/activate',   [ZentyReconLicenseController::class, 'activate']);
    Route::post('/license/validate',   [ZentyReconLicenseController::class, 'validate']);
    Route::post('/license/deactivate', [ZentyReconLicenseController::class, 'deactivate']);

    // 2. Cryptographic Bill of Materials (CBOM) & Threat Recon Ingestion
    Route::post('/cbom/push',          [ZentyReconDataController::class, 'pushCbom']);
    Route::get('/cbom/history',        [ZentyReconDataController::class, 'getCbomHistory']);

    // 3. Health check ping
    Route::get('/ping', fn() => response()->json([
        'status'  => 'online',
        'service' => 'ZentyRecon GPlay API Gateway',
        'version' => '1.0.0',
        'time'    => now()->toIso8601String(),
    ]));
});
