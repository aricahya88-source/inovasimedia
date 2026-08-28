export type ProjectField = { key: string; label: string; hint?: string };
export type ProjectTheme = { code: string; name: string; description: string; fields: ProjectField[] };
export type ProjectDefinition = { code: string; name: string; group: boolean; themes: ProjectTheme[] };

const f = (key:string,label:string,hint=''):ProjectField => ({key,label,hint});

export const PROJECTS: ProjectDefinition[] = [
  {
    code:'WEBSITE', name:'Website', group:false, themes:[
      {code:'GAME',name:'Game-Based & Gamification',description:'Belajar melalui misi, tantangan, skor, level, dan pencapaian.',fields:[f('mission','Konsep misi/permainan'),f('levels','Level/tahap yang direncanakan'),f('progress','Mekanisme skor/progres'),f('challenge','Jenis tantangan'),f('feedback','Mekanisme feedback')]},
      {code:'AI',name:'AI-Based Learning',description:'AI sebagai tutor, mitra percakapan, generator latihan, atau feedback.',fields:[f('aiFunction','Fungsi AI utama'),f('prompt','Contoh prompt/konteks AI'),f('validation','Cara validasi output'),f('limits','Batasan, privasi, dan etika')]},
      {code:'MULTIMEDIA',name:'Interactive Multimedia Learning',description:'Menggabungkan teks, visual, audio/video, dan interaksi.',fields:[f('mediaMix','Kombinasi media'),f('interaction1','Aktivitas interaktif 1'),f('interaction2','Aktivitas interaktif 2'),f('navigation','Navigasi & feedback')]},
      {code:'ADAPTIVE',name:'Adaptive & Personalized Learning',description:'Jalur belajar menyesuaikan level atau performa pengguna.',fields:[f('diagnostic','Pre-test/diagnostic'),f('paths','Minimal dua jalur belajar'),f('rule','Aturan adaptasi'),f('recommendation','Rekomendasi setelah evaluasi')]},
      {code:'IMMERSIVE',name:'Immersive / AR Learning',description:'Eksplorasi objek, ruang, QR, virtual tour, atau WebAR.',fields:[f('scenario','Skenario/lokasi eksplorasi'),f('hotspots','Hotspot/objek'),f('implementation','QR / Virtual Tour / 360 / WebAR'),f('mission','Misi/evaluasi akhir')]}
    ]
  },
  {
    code:'PWA', name:'PWA', group:false, themes:[
      {code:'OFFLINE',name:'Offline Microlearning PWA',description:'Unit belajar singkat yang tetap berguna saat koneksi lemah.',fields:[f('offline','Konten/fungsi offline'),f('cache','Strategi caching'),f('micro','Struktur microlearning')]},
      {code:'QUIZ',name:'Mobile Practice & Quiz PWA',description:'Latihan singkat dan kuis berulang yang mobile-first.',fields:[f('practice','Jenis latihan'),f('feedback','Feedback'),f('progress','Progres lokal')]},
      {code:'SPEAKING',name:'Audio & Speaking Mobile PWA',description:'Audio, shadowing, atau latihan berbicara di perangkat mobile.',fields:[f('audio','Skenario audio'),f('recording','Rencana recording'),f('privacy','Izin/perlindungan data suara')]},
      {code:'PERSONAL',name:'Progress & Personalized PWA',description:'Progres, bookmark, rekomendasi, dan jalur belajar.',fields:[f('profile','Profil/level'),f('progress','Model progres'),f('recommendation','Aturan rekomendasi')]},
      {code:'QR',name:'Contextual / QR Learning PWA',description:'Belajar kontekstual melalui QR atau lokasi/objek.',fields:[f('context','Konteks penggunaan'),f('qr','Rencana QR/objek'),f('fallback','Fallback saat offline')]}
    ]
  },
  {
    code:'AUDIO', name:'Media Audio', group:false, themes:[
      {code:'DIALOG',name:'Dialog Situasional & Muhadatsah',description:'Dialog kontekstual untuk istimāʿ/kalām.',fields:[f('speakers','Tokoh/pembicara'),f('situation','Situasi komunikasi'),f('duration','Durasi target')]},
      {code:'LISTEN',name:'Listening Comprehension Challenge',description:'Audio dengan tugas pemahaman bertahap.',fields:[f('input','Jenis input audio'),f('questions','Bentuk pertanyaan'),f('scaffold','Replay/transkrip/scaffolding')]},
      {code:'SHADOW',name:'Pronunciation & Shadowing Audio',description:'Model pelafalan, makhārij, ritme, dan shadowing.',fields:[f('targetSound','Target bunyi/pola'),f('model','Model audio'),f('practice','Tahapan shadowing')]},
      {code:'PODCAST',name:'Audio Story / Podcast Edukatif',description:'Narasi atau podcast pembelajaran.',fields:[f('story','Premis/topik'),f('segments','Segmen'),f('host','Narator/pembicara')]},
      {code:'DRILL',name:'Mufradat & Qawaid Audio Drill',description:'Drill audio untuk kosakata atau pola bahasa.',fields:[f('items','Materi/item target'),f('pattern','Pola drill'),f('response','Bentuk respons peserta')]}
    ]
  },
  {
    code:'VISUAL', name:'Media Visual', group:false, themes:[
      {code:'INFOGRAPHIC',name:'Infografik Konsep / Qawaid',description:'Visualisasi konsep, pola, atau relasi.',fields:[f('concept','Konsep utama'),f('hierarchy','Hierarki informasi'),f('format','Ukuran/orientasi')]},
      {code:'FLASHCARD',name:'Flashcard Mufradat & Retrieval',description:'Kartu visual untuk retrieval practice.',fields:[f('cards','Jumlah/kelompok kartu'),f('frontback','Isi sisi depan-belakang'),f('visualRule','Aturan visual')]},
      {code:'POSTER',name:'Poster Komunikatif / Situasional',description:'Pesan bahasa dalam konteks situasional.',fields:[f('message','Pesan utama'),f('context','Situasi'),f('cta','Aktivitas/CTA')]},
      {code:'DIAGRAM',name:'Diagram / Flowchart Pembelajaran',description:'Menjelaskan proses, aturan, atau hubungan.',fields:[f('process','Proses/relasi'),f('nodes','Elemen utama'),f('direction','Arah baca RTL/bilingual')]},
      {code:'STORY',name:'Visual Story / Comic Sequence',description:'Cerita visual berurutan.',fields:[f('story','Alur cerita'),f('panels','Jumlah panel'),f('dialogue','Dialog/teks Arab')]}
    ]
  },
  {
    code:'AUDIOVISUAL', name:'Media Audiovisual', group:true, themes:[
      {code:'MICRO',name:'Microlearning Explainer Video',description:'Video singkat menjelaskan satu konsep.',fields:[f('message','Pesan utama'),f('duration','Durasi'),f('visualPlan','Visual pendukung')]},
      {code:'ROLEPLAY',name:'Dialog / Role-Play Situasional',description:'Percakapan Bahasa Arab dalam konteks nyata.',fields:[f('scene','Situasi'),f('cast','Pemeran'),f('dialogue','Struktur dialog')]},
      {code:'TUTORIAL',name:'Tutorial / Demonstration Video',description:'Demonstrasi langkah atau performa bahasa.',fields:[f('steps','Langkah demonstrasi'),f('shots','Shot utama'),f('voiceover','Narasi/voice-over')]},
      {code:'STORY',name:'Digital Storytelling / Short Narrative',description:'Cerita pendek dengan visual, narasi, dan dialog.',fields:[f('synopsis','Sinopsis'),f('characters','Tokoh'),f('storyboard','Storyboard')]},
      {code:'DOC',name:'Mini Documentary / Contextual Video',description:'Video kontekstual berbasis observasi/wawancara.',fields:[f('topic','Topik/lokasi'),f('sources','Sumber/narasumber'),f('broll','Rencana B-roll')]}
    ]
  }
];

export function projectByCode(code:string) {
  return PROJECTS.find(p => p.code === code.toUpperCase());
}
