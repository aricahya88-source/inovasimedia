# Arsitektur

```text
Next.js / React / PWA (Vercel)
│
├── UI Liquid Glass
├── Client auth state
├── WYSIWYG TipTap (lazy pada halaman editor)
├── Web Speech API / TTS
├── PWA service worker
├── Project guides (static HTML JSON)
│
└── /api/gas
     │ server-side proxy
     ▼
Google Apps Script Web App
│
├── HMAC signed session token
├── PIN hash + salt + pepper
├── role enforcement
├── validation/business logic
├── batch seed DOCX
│
├── Google Sheets
│   ├── USERS
│   ├── WEEKS
│   ├── MATERIALS
│   ├── ACTIVITIES
│   ├── DISCUSSIONS / POSTS
│   ├── SUBMISSIONS / COMMENTS
│   ├── GRADES
│   ├── QUIZZES / QUESTIONS / ATTEMPTS
│   ├── GROUPS / MEMBERS
│   ├── PROJECT_PLANS
│   └── ACTIVITY_LOG
│
└── Google Drive
    ├── 01_Submissions
    ├── 02_Assets
    ├── 03_Exports
    └── 99_Temp
```

## Kenapa proxy Next.js?

Browser tidak berkomunikasi langsung dengan URL Apps Script. Next.js menjadi gateway tipis sehingga:
- struktur frontend lebih bersih;
- masalah CORS Apps Script dihindari;
- URL backend hanya berada pada server bundle;
- frontend dapat tetap memakai endpoint `/api/gas`.

Spreadsheet ID dan Folder ID hanya berada di Apps Script.
