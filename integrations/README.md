# 🌐 ZentyRecon — Panduan Integrasi Ekosistem CTAR.tech

Dokumen ini menjelaskan cara menghubungkan **ZentyRecon Browser Extension** dengan dua aplikasi yang sudah ada di komputer Anda:
1. **GPlay AI DataBank** (`C:\Users\UseR\Herd\gplay`) — Backend Laravel (sudah memiliki 118 API endpoints)
2. **ZentyQuetry Sovereign Desktop** (`C:\Users\UseR\Documents\ZentyQuetry`) — Aplikasi Desktop Lokal

---

## ☁️ 1. Integrasi GPlay DataBank (`C:\Users\UseR\Herd\gplay`)

> ⚠️ **PENTING: JANGAN TIMPA FILE `routes/api.php`!**  
> Jika file `routes/api.php` ditimpa, seluruh 118 API yang sudah ada akan terhapus. Cukup tambahkan (*append*) 1 baris kode pemanggil atau gunakan rincian di bawah ini.

### 📋 Daftar Lengkap File Integrasi GPlay:

| No | File Asal di `zentyrecon/integrations/gplay/` | Folder Tujuan di `C:\Users\UseR\Herd\gplay\` | Keterangan |
|:---:|---|---|---|
| **1** | `ZentyReconLicenseController.php` | `app/Http/Controllers/` | Controller lisensi (Aktivasi, Validasi, 1 PC = 1 Lisensi) |
| **2** | `ZentyReconDataController.php` | `app/Http/Controllers/` | Controller data CBOM & riwayat scan |
| **3** | `ZentyReconLicense.php` | `app/Models/` | Eloquent Model lisensi |
| **4** | `ZentyReconCbom.php` | `app/Models/` | Eloquent Model CBOM |
| **5** | `VerifyZentyReconApiKey.php` | `app/Http/Middleware/` | Middleware autentikasi header `X-ZentyRecon-Key` |
| **6** | `routes_zentyrecon.php` | `routes/` (Rename jadi `zentyrecon.php`) | File rute terpisah agar rapi |
| **7** | `zentyrecon_tables.sql` | *Import via phpMyAdmin* | Script database siap import jika tidak pakai `artisan migrate` |

---

### 🚀 Cara Pemasangan di GPlay:

#### Langkah A: Database (Pilih Salah Satu)
- **Opsi 1 (phpMyAdmin):**
  Buka phpMyAdmin ➔ Pilih database GPlay ➔ Klik tab **Import** ➔ Pilih file `integrations/gplay/zentyrecon_tables.sql` ➔ Klik **Go**.
- **Opsi 2 (Laravel Migration):**
  Salin file `2026_09_29_000001_create_zentyrecon_tables.php` ke `database/migrations/` lalu jalankan `php artisan migrate`.

#### Langkah B: Daftarkan Rute di `routes/api.php`
Salin file `routes_zentyrecon.php` ke `Herd\gplay\routes\zentyrecon.php`.
Lalu di file `Herd\gplay\routes\api.php`, **cukup tambahkan 1 baris di baris paling bawah**:
```php
// Tambahkan di baris paling bawah routes/api.php
require __DIR__ . '/zentyrecon.php';
```
*(Dengan cara ini, file `routes/api.php` asli Anda tetap 100% aman dan seluruh 118 API tidak terganggu).*

---

## 🖥️ 2. Integrasi ZentyQuetry Desktop (`C:\Users\UseR\Documents\ZentyQuetry`)

Ekstensi ZentyRecon dapat berkomunikasi langsung dengan ZentyQuetry Desktop melalui dua jalur:

### Jalur A: Native Messaging Host (Rekomendasi - Otomatis)
1. Buka folder `c:\Users\UseR\Documents\zentyrecon\native-host\`
2. Klik kanan file `install-host.bat` ➔ Pilih **Run as administrator** (atau klik 2x).
3. Host otomatis terdaftar di Windows Registry untuk Chrome, Edge, dan Brave.
4. Ketika tombol **"☁️ Sync"** di ekstensi ZentyRecon diklik, laporan CBOM otomatis diteruskan ke ZentyQuetry Desktop (`~/Documents/ZentyQuetry/cbom_inbox`).

### Jalur B: Direct HTTP Loopback (`127.0.0.1:9527`)
- Jika ZentyQuetry Desktop sedang aktif berjalan pada port 9527, ekstensi otomatis mendeteksi status online dan mengirimkan hasil scan ke endpoint `http://127.0.0.1:9527/api/cbom`.

---

## 🛡️ Ringkasan Alur Data

```text
[ Browser (ZentyRecon Extension) ]
        │
        ├── 1. 1-Klik "☁️ Sync" CBOM ──► GPlay DataBank (Herd\gplay)
        │                                 └── Tersimpan di tabel zentyrecon_cboms
        │
        └── 2. Native Messaging / 9527 ─► ZentyQuetry Desktop (Documents\ZentyQuetry)
                                          └── Disimpan ke folder inbox Desktop
```
