-- ============================================================
-- ZentyRecon Ecosystem Tables for GPlay AI DataBank
-- Database: MySQL / MariaDB (Import via phpMyAdmin)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. Table: zentyrecon_licenses
-- Stores Pro & Enterprise license keys and machine bindings (1 PC = 1 License)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `zentyrecon_licenses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `license_key` VARCHAR(255) NOT NULL,
  `machine_id` VARCHAR(255) DEFAULT NULL COMMENT 'Machine hardware fingerprint binding',
  `email` VARCHAR(255) DEFAULT NULL,
  `tier` VARCHAR(50) NOT NULL DEFAULT 'Pro' COMMENT 'Pro, Enterprise',
  `status` ENUM('active', 'inactive', 'revoked') NOT NULL DEFAULT 'inactive',
  `activated_at` TIMESTAMP NULL DEFAULT NULL,
  `last_check_at` TIMESTAMP NULL DEFAULT NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_license_key` (`license_key`),
  KEY `idx_machine_id` (`machine_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Table: zentyrecon_cboms
-- Stores Cryptographic Bill of Materials (CycloneDX) reports from extensions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `zentyrecon_cboms` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` VARCHAR(64) NOT NULL,
  `api_key` VARCHAR(255) DEFAULT NULL,
  `domain` VARCHAR(255) NOT NULL,
  `spec_version` VARCHAR(16) NOT NULL DEFAULT '1.6',
  `bom_format` VARCHAR(64) NOT NULL DEFAULT 'CycloneDX-CBOM',
  `readiness` INT NOT NULL DEFAULT 0 COMMENT 'PQC Readiness Score 0-100',
  `raw_json` LONGTEXT NOT NULL COMMENT 'Full CycloneDX JSON payload',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_report_id` (`report_id`),
  KEY `idx_domain` (`domain`),
  KEY `idx_api_key` (`api_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Sample initial Pro license for testing (Optional)
-- ------------------------------------------------------------
INSERT IGNORE INTO `zentyrecon_licenses` (`license_key`, `tier`, `status`, `expires_at`)
VALUES ('ZR-PRO-CTAR-2026-TESTKEY', 'Pro', 'inactive', '2027-12-31 23:59:59');

SET FOREIGN_KEY_CHECKS = 1;
