LMS INOVASI MEDIA — PATCH v1.2 STATIC CONTENT + TEXT-TO-SPEECH

TUJUAN
- Materi utama tampil sebagai teks/HTML menarik, BUKAN audio-only.
- Tombol Play membacakan teks dengan Web Speech API (Indonesia/Arab).
- Materi, pertanyaan kuis, prompt diskusi, dan struktur minggu TIDAK dibaca dari Spreadsheet.
- Static assets dilayani Vercel/CDN dan cache browser.
- Google Sheets hanya menyimpan data yang berubah: user, post/balasan, attempt kuis, nilai, submission, perencanaan proyek, pengumuman, log, dll.
- Google Drive tetap untuk file.

ISI ZIP INI HANYA FILE BARU/BERUBAH.
Jangan hapus file project lain. Copy/replace sesuai path.

LANGKAH GITHUB / NEXT.JS
1. Extract ZIP.
2. Copy folder/file di dalamnya ke root project yang sama dengan package.json.
3. Commit + push ke GitHub. Vercel akan redeploy otomatis.
4. package.json TIDAK ikut patch ini, jadi patch Tiptap v1.1 Anda tetap aman.

LANGKAH APPS SCRIPT
1. Tambahkan file baru apps-script/StaticCourseBank.gs ke Apps Script.
2. Replace: Api.gs, Services.gs, Setup.gs, Config.gs.
3. Save.
4. Run repairLms() SATU KALI. Ini tidak menghapus data; hanya sinkron metadata activity/discussion agar gradebook tetap mengenali 28 kuis + 28 forum + proyek.
5. Deploy > Manage deployments > Edit > New version > Deploy.

PENTING
- Jangan jalankan lagi menu lama “Pasang Semua Konten DOCX”; menu tersebut sudah dihapus dari landing admin pada patch ini.
- Sheet MATERIALS/QUIZZES/QUIZ_QUESTIONS lama boleh tetap ada. Student UI v1.2 tidak membaca konten inti dari sheet tersebut. Jangan dihapus bila ada data lama yang ingin dipertahankan.
- Kunci jawaban kuis tidak berada di public JSON. Kunci disimpan dalam StaticCourseBank.gs dan koreksi dilakukan Apps Script sebelum hasil ditulis ke QUIZ_ATTEMPTS/GRADES.
- Prompt forum berasal dari static JSON; post dan reply tetap disimpan ke POSTS.
- Text-to-Speech tidak mengunggah audio dan tidak memakai API berbayar. Voice mengikuti browser/perangkat.

FILE UTAMA YANG BERUBAH
Frontend:
- src/app/weeks/page.tsx
- src/app/weeks/[week]/page.tsx
- src/components/MaterialView.tsx
- src/components/SpeechPlayer.tsx
- src/components/QuizPlayer.tsx
- src/app/discussions/page.tsx
- src/app/discussions/[id]/page.tsx
- src/app/tasks/page.tsx
- src/app/admin/page.tsx
- src/app/globals.css
- src/lib/staticContent.ts
- public/content/course.json
- public/content/activity-index.json
- public/content/discussions.json
- public/content/weeks/* (14 file)
- public/content/quizzes/* (28 file)

Apps Script:
- StaticCourseBank.gs (baru)
- Api.gs
- Services.gs
- Setup.gs
- Config.gs
- src/app/tasks/[id]/page.tsx (kuis statis langsung dibuka tanpa getTask ke Sheets)
