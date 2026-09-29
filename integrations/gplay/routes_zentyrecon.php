<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ZentyReconApiController;

/*
|--------------------------------------------------------------------------
| ZentyRecon Extension Ecosystem Routes (GPlay DataBank)
| File: routes/zentyrecon.php (Include in routes/api.php)
|--------------------------------------------------------------------------
*/

Route::prefix('v1/zentyrecon')->group(function () {

    // 1. License Authority & Machine Binding (1 License = 1 PC)
    Route::post('/license/activate',   [ZentyReconApiController::class, 'activateLicense']);
    Route::post('/license/validate',   [ZentyReconApiController::class, 'validateLicense']);
    Route::post('/license/deactivate', [ZentyReconApiController::class, 'deactivateLicense']);

    // 2. Cryptographic Bill of Materials (CBOM) & Threat Ingestion
    Route::post('/cbom/push',          [ZentyReconApiController::class, 'pushCbom']);
    Route::get('/cbom/history',        [ZentyReconApiController::class, 'getCbomHistory']);

    // 3. Health check ping
    Route::get('/ping',                [ZentyReconApiController::class, 'ping']);
});
