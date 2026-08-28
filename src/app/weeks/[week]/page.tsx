'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import MaterialView from '@/components/MaterialView';
import { getStaticWeek, type StaticWeekData } from '@/lib/staticContent';
import type { Activity } from '@/lib/types';
import { ArrowLeft, MessagesSquare, CircleHelp, ClipboardCheck, FolderKanban, ArrowRight, Zap } from 'lucide-react';

export default function WeekPage({params}:{params:Promise<{week:string}>}){
  const {week}=use(params); const [d,setD]=useState<StaticWeekData|null>(null); const [error,setError]=useState('');
  useEffect(()=>{getStaticWeek(Number(week)).then(setD).catch(e=>setError(e.message));},[week]);
  const icon=(type:string)=>type==='discussion'?<MessagesSquare/>:type==='quiz'?<CircleHelp/>:type==='project'?<FolderKanban/>:<ClipboardCheck/>;
  const href=(a:Activity)=>a.type==='discussion'?`/discussions/${a.activity_id}`:a.type==='quiz'?`/tasks/${a.activity_id}`:a.type==='project'?`/projects/${a.project_code}`:`/tasks/${a.activity_id}`;
  return <AuthGate><AppShell title={`Minggu ${week}`}>
    <Link href="/weeks" className="button soft compact"><ArrowLeft/>Kembali</Link>
    {error&&<div className="error-box">{error}</div>}
    {!d?<div className="screen-center small"><div className="spinner"/>Memuat materi lokal...</div>:<div className="stack">
      <section className="hero-panel glass-panel"><div><span className="eyebrow">MINGGU {d.week.week_no}</span><h2>{d.week.title}</h2><p>Dua materi teks HTML lengkap, Text-to-Speech per materi/bagian, kuis, forum, dan proyek dalam satu alur.</p></div><div className="static-pill"><Zap/> CDN statis</div></section>
      {d.materials.map(m=><MaterialView key={m.material_id} material={m}/>)}
      <div className="section-title"><div><span className="eyebrow">AKTIVITAS</span><h3>Kuis, diskusi, dan proyek</h3></div></div>
      <div className="activity-grid">{d.activities.map(a=><Link key={a.activity_id} href={href(a)} className="glass-card activity-card">
        <div className={`icon-bubble ${a.type==='quiz'?'amber':a.type==='discussion'?'teal':'coral'}`}>{icon(a.type)}</div>
        <div className="grow"><span className="eyebrow">{a.type.toUpperCase()}</span><h3>{a.title}</h3>{a.max_score?<small>Maks. {a.max_score} poin</small>:null}</div><ArrowRight/>
      </Link>)}</div>
    </div>}
  </AppShell></AuthGate>
}
