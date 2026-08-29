PATCH v1.6 — Import Batch User + Import Kelompok 5 Proyek + Laporan Kelompok + Logout Mobile
==========================================================================================

Basis patch: v1.5 (Materi Seragam + RPP + Pilihan Suara TTS).
Patch ini hanya berisi file yang berubah/baru. package.json TIDAK diubah.

PERUBAHAN UTAMA
1. Import User Excel lebih tahan timeout
   - frontend membagi import menjadi batch 50 user;
   - backend memproses satu batch dengan satu read + satu write ke sheet USERS;
   - progress batch ditampilkan;
   - pesan timeout dibuat lebih jelas;
   - PIN otomatis dapat di-download ke Excel setelah import.

2. Import Kelompok Excel untuk 5 proyek
   - Website, PWA, Media Audio, Media Visual, Media Audiovisual;
   - pilih proyek terlebih dahulu, lalu import file XLSX;
   - format template: group_name | nim | role;
   - role = LEADER atau MEMBER;
   - tepat satu LEADER per kelompok;
   - satu mahasiswa hanya boleh berada pada satu kelompok untuk proyek yang sama;
   - tersedia Preview, validasi, Export kelompok per proyek;
   - template baru: public/templates/import-groups.xlsx.

3. Perencanaan proyek kelompok hanya satu
   - bila mahasiswa memiliki kelompok pada proyek tersebut, PROJECT_PLAN menjadi milik group_id;
   - hanya ketua/LEADER yang dapat membuat, mengedit, dan mengajukan;
   - semua anggota kelompok dapat melihat perencanaan yang sama;
   - untuk data kelompok lama tanpa LEADER, anggota pertama diperlakukan sebagai ketua sementara sampai admin menetapkan ketua.

4. Laporan Hasil Akhir proyek
   - ditambahkan pada halaman masing-masing proyek;
   - untuk proyek kelompok: hanya ketua yang mengirim, semua anggota melihat submission yang sama;
   - untuk mahasiswa tanpa kelompok: laporan tetap individual;
   - mendukung WYSIWYG, URL produk final, serta file kecil maksimal 3 MB;
   - menggunakan sheet SUBMISSIONS yang sudah ada, jadi TIDAK ada schema/sheet baru;
   - nilai proyek kelompok yang disimpan dosen diterapkan ke seluruh anggota kelompok.

5. Logout pada HP
   - avatar akun muncul di kanan atas;
   - tap avatar -> informasi akun + tombol "Keluar dari LMS";
   - tombol Keluar juga tersedia di drawer mobile;
   - ada konfirmasi sebelum logout.

6. Optimasi Apps Script
   - Spreadsheet dan Sheet object di-cache selama execution;
   - helper rewriteRows_ untuk batch rewrite data kelompok;
   - tidak perlu setupLms()/repairLms() karena tidak ada perubahan schema.

CARA PASANG — NEXT.JS / GITHUB
1. Extract ZIP patch.
2. Copy isi folder patch ke root repository yang sekarang.
3. Replace file yang sama.
4. Commit + Push ke main.
5. Vercel akan redeploy otomatis.

CARA PASANG — APPS SCRIPT
Replace hanya file berikut:
- Api.gs
- Db.gs
- Services.gs

Lalu:
1. Save.
2. JANGAN jalankan setupLms().
3. JANGAN jalankan repairLms().
4. Deploy > Manage deployments > Edit > New version > Deploy.

CATATAN IMPORT KELOMPOK
Admin > Kelompok:
- pilih proyek;
- Download Template;
- isi group_name, nim, role;
- setiap kelompok tepat satu LEADER;
- import dan cek preview sebelum menyimpan.

CATATAN PROYEK KELOMPOK
Kelompok bersifat per proyek. Contoh seorang mahasiswa dapat berada di:
- Website: Kelompok 1
- PWA: Kelompok 3
- Audio: Kelompok 2
- Visual: Kelompok 5
- Audiovisual: Kelompok 4

Jika tidak ada kelompok untuk suatu proyek, alur proyek mahasiswa tetap individual (kecuali proyek backend yang memang diwajibkan group).
