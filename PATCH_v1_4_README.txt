LMS INOVASI MEDIA — PATCH v1.4
Fix: stale 28 aktivitas/diskusi + client-side error Pertemuan
Tanggal: 28 Agustus 2026

PENYEBAB YANG DIPERBAIKI
1) Service worker versi lama memakai cache-first untuk /content/*.
   Akibatnya JSON v1.2 yang berisi 28 kuis/diskusi dapat tetap tampil walau source v1.3 sudah diganti.
2) Spreadsheet masih menyimpan metadata legacy QUIZ_M01..QUIZ_M28 dan DISC_M01..DISC_M28.
   Data tersebut sebelumnya hanya disembunyikan, tetapi beberapa endpoint/admin list masih bisa menghitung/menampilkannya.
3) Halaman dynamic Pertemuan diperkeras agar kegagalan parameter/konten statis tidak menjatuhkan seluruh client page.

ISI PATCH — HANYA FILE BERUBAH/BARU
public/sw.js
src/components/PwaRegister.tsx
src/lib/staticContent.ts
src/app/weeks/[week]/page.tsx
apps-script/Setup.gs
apps-script/Services.gs
PATCH_v1_4_README.txt

CARA PASANG FRONTEND
1. Extract ZIP.
2. Copy folder public/ dan src/ ke repository GitHub dengan struktur yang sama.
3. Replace file lama ketika diminta.
4. Commit + push ke branch main.
5. Tunggu Vercel selesai deploy.

Catatan cache:
- staticContent.ts sekarang menambahkan revision query pada semua /content/*.json.
- sw.js sekarang menggunakan cache lms-inovasi-shell-v1.4 dan network-first untuk /content/.
- PwaRegister meminta update service worker dengan updateViaCache=none dan melakukan reload satu kali saat worker baru mengambil alih.
- Karena revision query baru, browser yang masih dikontrol service worker lama pun tidak akan menemukan cache JSON 28-item lama.

CARA PASANG APPS SCRIPT
1. Replace apps-script/Setup.gs dan apps-script/Services.gs.
2. Save.
3. Run SATU KALI: repairLms()
4. Log yang diharapkan menyebut Patch v1.4 dan 14 pertemuan, 7 kuis, 7 diskusi.
5. Deploy > Manage deployments > Edit > New version > Deploy.

JANGAN menjalankan setupLms() untuk upgrade ini.

PERILAKU SETELAH PATCH
- Materi tetap 28 static HTML + TTS.
- Kuis static aktif: 7 checkpoint.
- Diskusi static aktif: 7 checkpoint.
- Legacy QUIZ_M01..28 dan DISC_M01..28 diabaikan oleh dashboard, list minggu, list tugas, list diskusi, gradebook, dan admin list.
- Row lama tidak dihapus agar attempt/nilai/post uji lama tidak hilang.
- Pertemuan membaca JSON versi baru dan menampilkan pesan retry jika konten gagal dimuat, bukan blank Application error.
