# LMS Inovasi Media Pembelajaran Bahasa Arab — Next.js + Apps Script

Aplikasi LMS ringan untuk ±80 mahasiswa dengan arsitektur:

```text
Browser / PWA
   │
   ▼
Next.js + React di Vercel
   │  /api/gas (proxy tipis)
   ▼
Google Apps Script Web App (backend-only)
   ├── Google Sheets = database
   └── Google Drive  = file
```

Tidak memakai PostgreSQL, Vercel Blob, Firebase, Supabase, atau database Vercel.

## Fitur utama

### Mahasiswa
- Login NIM/email + PIN.
- Dashboard dan progress.
- 14 minggu, masing-masing menggabungkan 2 materi:
  - Minggu 1 = Materi 1 & 2
  - ...
  - Minggu 14 = Materi 27 & 28
- 28 materi lengkap dari DOCX sumber.
- Materi berupa HTML responsif dan menarik.
- Tabel otomatis berubah menjadi blok/baris pada HP; tidak perlu scroll horizontal.
- Text-to-Speech gratis dari Web Speech API:
  - otomatis memilih bahasa Indonesia / Arab per segmen;
  - play, pause/resume, stop;
  - kontrol kecepatan.
- Media player untuk YouTube, Google Drive preview, MP3/WAV/OGG/M4A, dan MP4/WebM.
- 28 kuis formatif dari DOCX; kunci jawaban hanya disimpan server-side untuk koreksi otomatis.
- 28 forum diskusi dari DOCX.
- Submission/revisi tugas dengan WYSIWYG, URL, dan file kecil.
- Nilai + feedback.
- 5 proyek: Website, PWA, Audio, Visual, Audiovisual.
- Perencanaan proyek: draft → diajukan → review → revisi → approved.
- Panduan tema 5 proyek tersedia di LMS.
- PWA installable.

### Admin / Dosen
- Responsive navigation:
  - laptop/desktop = sidebar kiri;
  - HP = bottom navigation.
- Kelola materi dengan WYSIWYG lengkap.
- Kelola kuis, soal A–D, kunci, poin, feedback.
- Kelola diskusi.
- Kelola tugas/checkpoint/refleksi/peer review/testing/presentasi.
- Pengumuman.
- Pengguna, role, kelas, reset PIN.
- Kelompok.
- Review perencanaan proyek.
- Gradebook untuk tugas, diskusi, kuis, dan aktivitas lain.
- Import/export Excel seluruh database.
- Tombol **Pasang Semua Konten DOCX** untuk mengisi 28 materi + 28 kuis + 28 diskusi.

## WYSIWYG

Editor memakai TipTap dan dimuat hanya pada halaman yang memerlukan editor. Toolbar mencakup:
- heading/paragraf;
- bold, italic, underline, strike;
- highlight;
- bullet, numbered, task list;
- blockquote, inline code;
- alignment;
- RTL/LTR;
- link;
- upload gambar ke Google Drive;
- tabel + tambah baris/kolom/hapus;
- clear formatting;
- undo/redo.

## Prinsip ringan

- Tidak ada polling realtime.
- Tidak ada library chart.
- Tidak ada database di Vercel.
- Ikon memakai `lucide-react`.
- TTS memakai API browser, tidak memakai layanan berbayar.
- File besar (audio/video proyek) sebaiknya memakai URL Drive/YouTube agar tidak melewati batas payload Vercel.
- Upload langsung LMS dibatasi 3 MB.
- Konten DOCX hanya ±300 KB HTML setelah dikonversi.
- Seed quiz disimpan server-side di Next.js sehingga kunci jawaban tidak dikirim sebagai file publik.

Lihat `PETUNJUK_PEMASANGAN.md`.

## Catatan keamanan konten kuis

Kunci jawaban kuis tidak ditempatkan pada folder `public`. Seed kuis lengkap berada pada `src/server-seed` dan hanya dikirim oleh route admin setelah admin terautentikasi. Lampiran kunci jawaban pada akhir DOCX sumber juga tidak ditampilkan pada HTML materi mahasiswa.

## Komentar dosen pada submission

Dosen/admin dapat mengirim komentar WYSIWYG pada submission tanpa harus memberi nilai, atau memberikan feedback sekaligus saat menyimpan nilai melalui Gradebook.
