# Petunjuk Pemasangan

## A. Siapkan Google

1. Buat **Google Spreadsheet kosong**.
2. Buat **folder Google Drive khusus LMS**.
3. Buat project **Google Apps Script standalone**.
4. Salin semua file dari folder `apps-script/` ke project Apps Script.

Buka `StorageConfig.gs`:

```javascript
var LMS_STORAGE_CONFIG = {
  SPREADSHEET_ID: 'ID_SPREADSHEET_ANDA',
  ROOT_FOLDER_ID: 'ID_FOLDER_DRIVE_ANDA'
};
```

5. Save.
6. Pilih fungsi `setupLms`.
7. Klik **Run**.
8. Berikan izin Google.
9. Lihat **Execution log**. Akan muncul:
   - Login admin: `ADMIN`
   - PIN sementara: 6 digit.

`setupLms()` membuat seluruh database, Minggu 1–14, Material placeholder 1–28, 5 proyek utama, folder Drive, secret autentikasi, dan admin awal.

## B. Deploy Apps Script

1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. Deploy.
6. Salin URL yang berakhir `/exec`.

Uji:

```text
https://script.google.com/macros/s/DEPLOYMENT_ID/exec?health=1
```

Harus mengandung:

```json
{"ok":true,"data":{"mode":"BACKEND_ONLY","storageReady":true}}
```

## C. Sambungkan Next.js

Buka:

```text
src/lib/server-config.ts
```

Ganti:

```typescript
APPS_SCRIPT_URL: 'PASTE_APPS_SCRIPT_WEB_APP_URL_HERE'
```

menjadi URL `/exec` Anda.

**Tidak perlu `.env`.**

## D. Jalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Login:
- ID: `ADMIN`
- PIN: dari Execution Log.

## E. Pasang materi DOCX bawaan

Setelah login admin:

**Kelola → Pasang Semua Konten DOCX**

Tombol ini mengirim dan menyimpan:
- 28 materi;
- 28 kuis formatif;
- 28 diskusi.

Materi berasal dari:
`Materi_LMS_Lengkap_Minggu_1_28_Inovasi_Media_Pembelajaran_Bahasa_Arab(1).docx`

Susunan tidak diubah. LMS hanya memasangkan:
- Materi 1 + 2 → Minggu 1
- Materi 3 + 4 → Minggu 2
- ...
- Materi 27 + 28 → Minggu 14.

## F. Deploy ke Vercel

Push folder project ini ke GitHub, lalu Import repository ke Vercel.

Tidak perlu:
- PostgreSQL
- Vercel Blob
- Environment Variable
- server/database tambahan.

Build:

```text
npm install
npm run build
```

## G. Upload file

LMS membatasi upload melalui API menjadi 3 MB.

Untuk:
- video;
- rekaman audio besar;
- project final besar;

gunakan Google Drive / YouTube / GitHub/Vercel lalu masukkan URL ke submission.

Ini mencegah file besar melewati Vercel Function dan menjaga aplikasi ringan.

## H. PWA

PWA sudah aktif melalui:
- `public/manifest.webmanifest`
- `public/sw.js`
- icon 192/512.

Setelah HTTPS/Vercel, browser yang mendukung dapat menginstal LMS.

## I. Text-to-Speech

Tidak memerlukan API key.

Menggunakan `window.speechSynthesis` dari browser. Mode Auto memecah teks menjadi segmen dan memilih:
- `id-ID` untuk teks Indonesia;
- `ar-SA` untuk segmen dominan aksara Arab.

Kualitas suara tergantung voice yang tersedia di perangkat/browser.
