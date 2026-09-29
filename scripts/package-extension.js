// ============================================================
// ZentyRecon — Extension Release Packager
// Builds, tests, and packages dist/ into release ZIP bundle
// ready for Chrome Web Store & Edge Add-ons submission.
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const RELEASE_DIR = path.resolve(ROOT_DIR, 'release');

console.log('='.repeat(65));
console.log('📦 ZentyRecon — Store Release Packaging Suite');
console.log('='.repeat(65));

// 1. Read manifest version
const manifestPath = path.join(DIST_DIR, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ Error: dist/manifest.json not found! Run npm run build first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Firefox AMO compatibility: inject background.scripts fallback
if (manifest.background && manifest.background.service_worker) {
  manifest.background.scripts = [manifest.background.service_worker];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log('🦊 Injected Firefox-compatible background.scripts fallback');
}

const version = manifest.version || '1.0.0';
const zipName = `zentyrecon-v${version}.zip`;
const zipPath = path.join(RELEASE_DIR, zipName);

// 2. Ensure release directory exists
if (!fs.existsSync(RELEASE_DIR)) {
  fs.mkdirSync(RELEASE_DIR, { recursive: true });
}

// Remove old zip if exists
if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

console.log(`\nTarget Package : ${zipName}`);
console.log(`Source Folder  : ${DIST_DIR}`);
console.log(`Output Path    : ${zipPath}`);

// 3. Create ZIP using native tar/bsdtar
try {
  console.log('\nCompressing dist bundle...');
  execSync(`tar -a -c -f "${zipPath}" -C "${DIST_DIR}" .`, { stdio: 'inherit' });

  if (fs.existsSync(zipPath)) {
    const stat = fs.statSync(zipPath);
    const sizeKb = (stat.size / 1024).toFixed(2);
    console.log(`\n✅ Package created successfully!`);
    console.log(`  • File: release/${zipName}`);
    console.log(`  • Size: ${sizeKb} KB`);
    console.log(`\n🎉 Ready for upload to Chrome Web Store Developer Dashboard!`);
  } else {
    throw new Error('ZIP file was not created.');
  }
} catch (err) {
  console.error(`❌ Packaging failed: ${err.message}`);
  process.exit(1);
}
