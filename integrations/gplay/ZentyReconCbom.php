<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ZentyReconCbom
 * Eloquent Model for zentyrecon_cboms table (CycloneDX Cryptographic Bill of Materials)
 */
class ZentyReconCbom extends Model
{
    use HasFactory;

    protected $table = 'zentyrecon_cboms';

    protected $fillable = [
        'report_id',
        'api_key',
        'domain',
        'spec_version',
        'bom_format',
        'readiness',
        'raw_json',
    ];

    protected $casts = [
        'readiness' => 'integer',
        'raw_json'  => 'array',
    ];
}
