<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for ZentyRecon Extension ecosystem inside GPlay DataBank
     */
    public function up(): void
    {
        // 1. ZentyRecon License Pool & Machine Binding Table
        if (!Schema::hasTable('zentyrecon_licenses')) {
            Schema::create('zentyrecon_licenses', function (Blueprint $table) {
                $table->id();
                $table->string('license_key')->unique()->index();
                $table->string('machine_id')->nullable()->index(); // 1 license = 1 machine binding
                $table->string('email')->nullable();
                $table->string('tier')->default('Pro'); // Pro, Enterprise
                $table->enum('status', ['active', 'inactive', 'revoked'])->default('inactive');
                $table->timestamp('activated_at')->nullable();
                $table->timestamp('last_check_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }

        // 2. Cryptographic Bill of Materials (CBOM) DataBank Table
        if (!Schema::hasTable('zentyrecon_cboms')) {
            Schema::create('zentyrecon_cboms', function (Blueprint $table) {
                $table->id();
                $table->string('report_id')->unique()->index();
                $table->string('api_key')->nullable()->index();
                $table->string('domain')->index();
                $table->string('spec_version')->default('1.6');
                $table->string('bom_format')->default('CycloneDX-CBOM');
                $table->integer('readiness')->default(0);
                $table->longText('raw_json');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zentyrecon_cboms');
        Schema::dropIfExists('zentyrecon_licenses');
    }
};
