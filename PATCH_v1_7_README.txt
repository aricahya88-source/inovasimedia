LMS PATCH v1.7 — Gradebook Excel + Skala Nilai 100
====================================================

PATCH INI HANYA BERISI FILE YANG BERUBAH / BARU DARI v1.6.
Jangan menghapus file project lain.

FITUR BARU
1. Gradebook: Export Belum Dinilai ke Excel per aktivitas.
   - Hanya hasil yang BELUM punya nilai DAN BELUM punya komentar dosen.
   - Kuis tidak diekspor karena dinilai otomatis.
   - Untuk proyek kelompok, satu submission kelompok hanya muncul satu baris.

2. Gradebook: Import Nilai & Komentar dari Excel.
   - Isi kolom Nilai (0–100) dan Komentar.
   - Preview dan validasi sebelum import.
   - Diproses batch 50 baris agar ringan.
   - Untuk submission kelompok, satu nilai/komentar diterapkan ke semua anggota.

3. Seluruh nilai akhir memakai skala 100.
   - Diskusi: maks. 100.
   - Tugas/checkpoint/refleksi/peer review/testing/presentasi: maks. 100.
   - Proyek: maks. 100.
   - Kuis: skor jawaban dinormalisasi menjadi 0–100.
   - Nilai lama dapat dimigrasikan tanpa mengubah schema Spreadsheet.

PEMASANGAN NEXT.JS / VERCEL
1. Extract ZIP.
2. Copy isi folder patch ke root repository.
3. Replace file dengan path yang sama.
4. Commit + Push ke branch main.
5. Tunggu Vercel selesai redeploy.

PEMASANGAN APPS SCRIPT
Replace file berikut:
- Api.gs
- Services.gs
- StaticCourseBank.gs
- Setup.gs

Setelah semua file disimpan, jalankan SATU KALI dari Apps Script editor:

  upgradeScoreScale100()

Fungsi ini aman/idempotent dan TIDAK mengubah header/schema sheet. Fungsinya:
- menjadikan max_score semua ACTIVITIES = 100;
- mengonversi nilai GRADES lama (mis. 8/10 -> 80/100);
- mengonversi QUIZ_ATTEMPTS lama ke skor 0–100.

Setelah fungsi selesai:
Deploy -> Manage deployments -> Edit -> New version -> Deploy.

JANGAN jalankan setupLms().
Tidak perlu repairLms() untuk patch ini.

ALUR EXCEL GRADEBOOK
Admin -> Gradebook -> pilih aktivitas -> Export Belum Dinilai.
File berisi sheet:
- PENILAIAN
- PETUNJUK

Kolom teknis activity_id/user_id/submission_id/group_id disembunyikan dan jangan diubah.
Dosen cukup mengisi:
- Nilai
- Komentar

Kemudian Admin -> Gradebook -> Import Nilai & Komentar -> preview -> Import.
