<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ZentyReconLicense
 * Eloquent Model for zentyrecon_licenses table
 */
class ZentyReconLicense extends Model
{
    use HasFactory;

    protected $table = 'zentyrecon_licenses';

    protected $fillable = [
        'license_key',
        'machine_id',
        'email',
        'tier',
        'status',
        'activated_at',
        'last_check_at',
        'expires_at',
    ];

    protected $casts = [
        'activated_at'  => 'datetime',
        'last_check_at' => 'datetime',
        'expires_at'    => 'datetime',
    ];

    /**
     * Check if license is currently active and not expired
     */
    public function isValid(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Scope query for active licenses
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
