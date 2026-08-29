LMS PATCH v1.5 — Materi Seragam + RPP + Pilihan Suara TTS
Tanggal: 29 Agustus 2026

PATCH INI HANYA BERISI FILE YANG BERUBAH / BARU.
Tidak ada perubahan Apps Script dan tidak ada perubahan package.json.

PERUBAHAN UTAMA
1. Materi 1–28 diseragamkan menjadi blok belajar:
   - Orientasi & Keterkaitan RPS
   - Tujuan Belajar
   - Pertanyaan Pemantik
   - Materi Inti
   - Aktivitas Belajar
   - Lembar Kerja / Praktik (jika tersedia)
   - Refleksi
2. Kuis Formatif lama di dalam masing-masing materi dihapus.
3. Forum LMS lama di dalam masing-masing materi dihapus agar tidak bertabrakan dengan 7 Diskusi checkpoint.
4. Rubrik/admin-only text lama pada badan materi dibersihkan agar halaman mahasiswa fokus belajar.
5. TTS tetap tersedia untuk seluruh materi dan setiap bagian materi.
6. Suara Bahasa Indonesia sekarang dapat dipilih dari voice yang tersedia di browser/perangkat.
   - Pilihan disimpan di browser (localStorage).
   - Teks Arab tetap mencoba memakai voice Arab secara otomatis.
   - Nama voice berbeda-beda menurut perangkat/browser, misalnya Google/Microsoft/Apple voice bila tersedia.
7. Menu baru "Rencana Pembelajaran" setelah Dashboard pada sidebar desktop.
   Di mobile, Rencana Pembelajaran tersedia pada menu hamburger agar bottom navigation tetap ringan.
8. Halaman Rencana Pelaksanaan Pembelajaran berisi timeline 14 pertemuan, tanggal, materi,
   Sub-CPMK, tujuan, sebelum/saat/setelah pertemuan, output, checkpoint, dan milestone.
9. Dashboard mendapat tombol "Lihat Rencana" dan "Mulai Belajar".
10. Ikon menggunakan lucide-react yang sudah ada di project, sehingga tidak perlu CDN/dependency baru.
11. Cache PWA dinaikkan ke v1.5 agar materi lama tidak tersangkut di browser.

CARA PASANG
1. Ekstrak ZIP patch.
2. Copy seluruh isi folder patch ke root repository GitHub Anda.
3. Pilih Replace/Overwrite untuk file dengan path yang sama.
4. Commit dan push ke branch main.
5. Tunggu Vercel redeploy.
6. Apps Script TIDAK perlu diubah dan repairLms() TIDAK perlu dijalankan untuk patch ini.

CATATAN TTS
Web Speech API menggunakan voice yang terpasang/tersedia pada browser dan sistem operasi pengguna.
Karena itu daftar "Suara Indonesia" dapat berbeda antara Chrome, Edge, Safari, Android, macOS, dan Windows.
Jika perangkat hanya memiliki satu voice Indonesia, hanya voice tersebut yang tampil.
Jika tidak ada voice Indonesia, LMS akan memakai fallback browser dan menampilkan keterangan bahwa voice Indonesia tidak ditemukan.

VALIDASI YANG DILAKUKAN
- 28 materi ditemukan.
- Semua 28 materi memiliki Tujuan, Materi Inti, dan Refleksi.
- Tidak ada lagi section "Kuis Formatif" di 28 materi.
- Tidak ada lagi section "Forum LMS" di 28 materi.
- RPP berisi tepat 14 pertemuan.
- JSON patch berhasil diparse.
- File TS/TSX yang berubah lulus pemeriksaan sintaks TypeScript.
- Full npm/Next production build tidak dapat dijalankan di environment pembuatan patch karena npm registry timeout.
