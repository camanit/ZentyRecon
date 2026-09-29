# 🌐 ZentyRecon — Panduan Integrasi Ekosistem CTAR.tech

Dokumen ini menjelaskan cara menghubungkan **ZentyRecon Browser Extension** dengan dua aplikasi yang sudah ada di komputer Anda:
1. **GPlay AI DataBank** (`C:\Users\UseR\Herd\gplay`) — Backend Laravel
2. **ZentyQuetry Sovereign Desktop** (`C:\Users\UseR\Documents\ZentyQuetry`) — Aplikasi Desktop Lokal

---

## ☁️ 1. Integrasi GPlay DataBank (`C:\Users\UseR\Herd\gplay`)

> ℹ️ **Catatan:** GPlay DataBank saat ini telah memiliki **118 API endpoints** untuk berbagai produk ekosistem CTAR.tech. ZentyRecon **TIDAK** mengubah atau mengganggu 118 API yang sudah ada, melainkan hanya menambahkan endpoint khusus di prefix `/api/v1/zentyrecon/*`.

### Langkah Pemasangan ke Herd\gplay:

1. **Salin Controller ke folder Controller GPlay:**
   - Salin file `integrations/gplay/ZentyReconLicenseController.php` ke `C:\Users\UseR\Herd\gplay\app\Http\Controllers\`
   - Salin file `integrations/gplay/ZentyReconDataController.php` ke `C:\Users\UseR\Herd\gplay\app\Http\Controllers\`

2. **Salin Migration Database:**
   - Salin `integrations/gplay/2026_09_29_000001_create_zentyrecon_tables.php` ke `C:\Users\UseR\Herd\gplay\database\migrations\`
   - Jalankan migration di terminal `Herd\gplay`:
     ```bash
     php artisan migrate
     ```
   - Ini akan membuat tabel `zentyrecon_licenses` dan `zentyrecon_cboms`.

3. **Daftarkan Route Baru di `Herd\gplay\routes\api.php`:**
   Tambahkan baris berikut di file `routes/api.php` Anda:
   ```php
   use App\Http\Controllers\ZentyReconLicenseController;
   use App\Http\Controllers\ZentyReconDataController;

   Route::prefix('v1/zentyrecon')->group(function () {
       // License validation & machine binding (1 license = 1 PC)
       Route::post('/license/activate',   [ZentyReconLicenseController::class, 'activate']);
       Route::post('/license/validate',   [ZentyReconLicenseController::class, 'validate']);
       Route::post('/license/deactivate', [ZentyReconLicenseController::class, 'deactivate']);

       // CBOM & Scan ingestion
       Route::post('/cbom/push',          [ZentyReconDataController::class, 'pushCbom']);
       Route::get('/cbom/history',        [ZentyReconDataController::class, 'getCbomHistory']);
   });
   ```

---

## 🖥️ 2. Integrasi ZentyQuetry Desktop (`C:\Users\UseR\Documents\ZentyQuetry`)

Ekstensi ZentyRecon dapat berkomunikasi langsung dengan ZentyQuetry Desktop melalui dua jalur:

### Jalur A: Native Messaging Host (Rekomendasi - Otomatis & Aman)
1. Buka folder `c:\Users\UseR\Documents\zentyrecon\native-host\`
2. Klik kanan file `install-host.bat` ➔ Pilih **Run as administrator** (atau jalankan normal).
3. Script otomatis mendaftarkan manifest `com.ctar.zentyquetry.host` ke Windows Registry untuk Chrome, Edge, dan Brave.
4. Ketika tombol **"☁️ Sync"** di ekstensi ZentyRecon diklik, laporan CBOM otomatis diteruskan ke ZentyQuetry Desktop (`~/Documents/ZentyQuetry/cbom_inbox`).

### Jalur B: Direct HTTP Loopback (`127.0.0.1:9527`)
- Jika ZentyQuetry Desktop sedang berjalan (running pada port 9527), ekstensi ZentyRecon otomatis mendeteksi status online dan mengirimkan hasil scan ke endpoint `http://127.0.0.1:9527/api/cbom`.

---

## 🛡️ Ringkasan Alur Data

```text
[ Browser (ZentyRecon) ]
        │
        ├── 1. 1-Klik "☁️ Sync" CBOM ──► GPlay DataBank (Herd\gplay)
        │                                 └── Tersimpan di tabel zentyrecon_cboms
        │
        └── 2. Native Messaging / 9527 ─► ZentyQuetry Desktop (Documents\ZentyQuetry)
                                          └── Disimpan ke folder inbox Desktop
```
