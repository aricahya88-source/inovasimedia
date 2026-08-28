PATCH v1.3 — 7 Diskusi + 7 Kuis + Jadwal 2026 + Import User Excel
=================================================================

Patch ini dibuat DI ATAS v1.2 Static Content + TTS.
Patch dependency TipTap v1.1 tetap dipakai; package.json TIDAK diubah oleh patch ini.

PERUBAHAN UTAMA
1. Materi tetap 28, dua materi per pertemuan, tetap HTML + Text-to-Speech dari Vercel/CDN.
2. Diskusi diringkas dari 28 menjadi 7 checkpoint.
3. Kuis diringkas dari 28 menjadi 7 checkpoint, masing-masing 10 soal yang dipilih dari soal formatif materi sumber. Kunci koreksi backend mengikuti Lampiran A/C dokumen materi.
4. Jadwal 14 pertemuan dimulai Senin, 7 September 2026.
5. Blok I: Materi 1–14, batas akhir 19 Oktober 2026 pukul 23.59 WIB.
6. Blok II: Materi 15–28, batas akhir 7 Desember 2026 pukul 23.59 WIB.
7. Dashboard menentukan pertemuan berjalan otomatis dari tanggal pada sheet WEEKS.
8. Menu Admin > Pengguna mempunyai Import User Excel + preview + opsi skip/update duplikat.
9. Template Excel tersedia di /public/templates/import-users.xlsx.
10. XLSX dimuat secara dynamic import hanya saat admin memilih file, sehingga halaman mahasiswa tetap ringan.

7 CHECKPOINT
- Checkpoint 1: Materi 1–4, ditempatkan pada Pertemuan 2, deadline Blok I.
- Checkpoint 2: Materi 5–8, ditempatkan pada Pertemuan 4, deadline Blok I.
- Checkpoint 3: Materi 9–14, ditempatkan pada Pertemuan 7, deadline Blok I.
- Checkpoint 4: Materi 15–18, ditempatkan pada Pertemuan 9, deadline Blok II.
- Checkpoint 5: Materi 19–22, ditempatkan pada Pertemuan 11, deadline Blok II.
- Checkpoint 6: Materi 23–26, ditempatkan pada Pertemuan 13, deadline Blok II.
- Checkpoint 7: Materi 27–28, ditempatkan pada Pertemuan 14, deadline Blok II.

CARA MEMASANG FRONTEND
1. Extract ZIP patch.
2. Salin isi folder patch ke root repository LMS dan replace file dengan path yang sama.
3. Tambahkan file baru Q_C01.json s.d. Q_C07.json dan public/templates/import-users.xlsx.
4. Commit + push ke GitHub. Vercel akan redeploy otomatis.
5. File lama public/content/quizzes/Q_M01.json s.d. Q_M28.json boleh dibiarkan; aplikasi tidak lagi mereferensikannya. Jika ingin repo lebih bersih, boleh dihapus manual setelah patch berhasil.

CARA MEMASANG APPS SCRIPT
Replace file berikut dari patch:
- Api.gs
- Config.gs
- Services.gs
- Setup.gs
- StaticCourseBank.gs

Lalu:
1. Save Apps Script.
2. Jalankan repairLms() SATU KALI. Jangan jalankan setupLms() jika database sudah terpasang.
3. Metadata 28 kuis/diskusi v1.2 akan disembunyikan, bukan menghapus nilai/attempt/post lama.
4. Metadata 7 kuis + 7 diskusi baru akan disinkronkan ke ACTIVITIES/DISCUSSIONS.
5. Deploy > Manage deployments > Edit > New version > Deploy.

IMPORT USER EXCEL
Menu: Admin > Pengguna > Import User dari Excel.
Kolom template:
- nim (wajib)
- name (wajib)
- email
- class_name
- initial_pin (opsional, minimal 6 karakter; kosong = dibuat otomatis)
- active (TRUE/FALSE)

Role import selalu mahasiswa. Akun admin/dosen tidak dapat ditimpa lewat import mahasiswa.
Untuk duplikat NIM, admin dapat memilih Lewati atau Perbarui.
PIN hanya disimpan dalam bentuk salt + hash pada Google Sheets.

CATATAN ARSITEKTUR RINGAN
Vercel/CDN: materi, 7 soal kuis publik tanpa kunci, 7 prompt diskusi, jadwal.
Apps Script: autentikasi, koreksi kuis, validasi deadline, import user, business logic.
Google Sheets: user, post, reply, attempt, nilai, submission, project plan, kelompok, log.
Google Drive: file/asset/submission.
