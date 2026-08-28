'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import MaterialView from '@/components/MaterialView';
import { getStaticWeek, type StaticWeekData } from '@/lib/staticContent';
import type { Activity } from '@/lib/types';
import { ArrowLeft, MessagesSquare, CircleHelp, ClipboardCheck, FolderKanban, ArrowRight, Zap, CalendarDays, Flag } from 'lucide-react';

export default function WeekPage({params}:{params:Promise<{week:string}>}){
  const {week}=use(params); const [d,setD]=useState<StaticWeekData|null>(null); const [error,setError]=useState('');
  useEffect(()=>{getStaticWeek(Number(week)).then(setD).catch(e=>setError(e.message));},[week]);
  const icon=(type:string)=>type==='discussion'?<MessagesSquare/>:type==='quiz'?<CircleHelp/>:type==='project'?<FolderKanban/>:<ClipboardCheck/>;
  const href=(a:Activity)=>a.type==='discussion'?`/discussions/${a.activity_id}`:a.type==='quiz'?`/tasks/${a.activity_id}`:a.type==='project'?`/projects/${a.project_code}`:`/tasks/${a.activity_id}`;
  return <AuthGate><AppShell title={`Pertemuan ${week}`}>
    <Link href="/weeks" className="button soft compact"><ArrowLeft/>Kembali</Link>
    {error&&<div className="error-box">{error}</div>}
    {!d?<div className="screen-center small"><div className="spinner"/>Memuat materi lokal...</div>:<div className="stack">
      <section className="hero-panel glass-panel"><div><span className="eyebrow">PERTEMUAN {d.week.week_no} • {d.week.block_label}</span><h2>{d.week.title}</h2><div className="row wrap gap"><span className="badge"><CalendarDays/> {d.week.meeting_date_label}</span><span className="badge"><Flag/> Batas blok: {d.week.block_deadline_label}</span></div><p>Dua materi HTML lengkap dengan Text-to-Speech. Kuis dan diskusi hanya muncul pada checkpoint tertentu agar aktivitas tetap ringkas.</p></div><div className="static-pill"><Zap/> CDN statis</div></section>
      {d.materials.map(m=><MaterialView key={m.material_id} material={m}/>) }
      <div className="section-title"><div><span className="eyebrow">AKTIVITAS</span><h3>{d.activities.length?'Checkpoint & proyek':'Tidak ada checkpoint minggu ini'}</h3></div></div>
      {d.activities.length?<div className="activity-grid">{d.activities.map(a=><Link key={a.activity_id} href={href(a)} className="glass-card activity-card">
        <div className={`icon-bubble ${a.type==='quiz'?'amber':a.type==='discussion'?'teal':'coral'}`}>{icon(a.type)}</div>
        <div className="grow"><span className="eyebrow">{a.type.toUpperCase()}</span><h3>{a.title}</h3>{a.max_score?<small>Maks. {a.max_score} poin</small>:null}{a.due_at&&<small> • Batas blok tercantum di halaman aktivitas</small>}</div><ArrowRight/>
      </Link>)}</div>:<div className="notice">Fokus pertemuan ini adalah mempelajari dua materi dan mengerjakan aktivitas kelas yang tercantum di dalam materi.</div>}
    </div>}
  </AppShell></AuthGate>
}
