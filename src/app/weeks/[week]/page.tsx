'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import MaterialView from '@/components/MaterialView';
import { getStaticWeek, type StaticWeekData } from '@/lib/staticContent';
import type { Activity } from '@/lib/types';
import { ArrowLeft, MessagesSquare, CircleHelp, ClipboardCheck, FolderKanban, ArrowRight, Zap, CalendarDays, Flag, RefreshCw } from 'lucide-react';

export default function WeekPage(){
  const params=useParams<{week:string}>();
  const weekValue=Array.isArray(params?.week)?params.week[0]:params?.week;
  const weekNo=useMemo(()=>Number(weekValue),[weekValue]);
  const [d,setD]=useState<StaticWeekData|null>(null);
  const [error,setError]=useState('');
  const [reloadKey,setReloadKey]=useState(0);

  useEffect(()=>{
    let alive=true;
    setD(null);setError('');
    if(!Number.isFinite(weekNo)||weekNo<1||weekNo>14){setError('Nomor pertemuan tidak valid.');return()=>{alive=false};}
    getStaticWeek(weekNo)
      .then(x=>{if(alive)setD(x)})
      .catch(e=>{if(alive)setError(e instanceof Error?e.message:String(e))});
    return()=>{alive=false};
  },[weekNo,reloadKey]);

  const icon=(type:string)=>type==='discussion'?<MessagesSquare/>:type==='quiz'?<CircleHelp/>:type==='project'?<FolderKanban/>:<ClipboardCheck/>;
  const href=(a:Activity)=>a.type==='discussion'?`/discussions/${a.activity_id}`:a.type==='quiz'?`/tasks/${a.activity_id}`:a.type==='project'&&a.project_code?`/projects/${a.project_code}`:`/tasks/${a.activity_id}`;

  return <AuthGate><AppShell title={Number.isFinite(weekNo)?`Pertemuan ${weekNo}`:'Pertemuan'}>
    <Link href="/weeks" className="button soft compact"><ArrowLeft/>Kembali</Link>

    {error&&<div className="error-box">
      <strong>Materi pertemuan belum dapat ditampilkan.</strong><br/>{error}
      <div style={{marginTop:10}}><button className="button soft compact" onClick={()=>setReloadKey(v=>v+1)}><RefreshCw/>Coba lagi</button></div>
    </div>}

    {!error&&!d?<div className="screen-center small"><div className="spinner"/>Memuat materi lokal...</div>:null}

    {d?<div className="stack">
      <section className="hero-panel glass-panel"><div><span className="eyebrow">PERTEMUAN {d.week.week_no} • {d.week.block_label||`Blok ${d.week.block||1}`}</span><h2>{d.week.title}</h2><div className="row wrap gap"><span className="badge"><CalendarDays/> {d.week.meeting_date_label||d.week.meeting_date||'-'}</span><span className="badge"><Flag/> Batas blok: {d.week.block_deadline_label||'-'}</span></div><p>Dua materi HTML lengkap dengan Text-to-Speech. Kuis dan diskusi hanya muncul pada tujuh checkpoint semester.</p></div><div className="static-pill"><Zap/> CDN statis</div></section>

      {(Array.isArray(d.materials)?d.materials:[]).map(m=><MaterialView key={m.material_id} material={m}/>)}

      <div className="section-title"><div><span className="eyebrow">AKTIVITAS</span><h3>{d.activities.length?'Checkpoint & proyek':'Tidak ada checkpoint minggu ini'}</h3></div></div>
      {d.activities.length?<div className="activity-grid">{d.activities.map(a=><Link key={a.activity_id} href={href(a)} className="glass-card activity-card">
        <div className={`icon-bubble ${a.type==='quiz'?'amber':a.type==='discussion'?'teal':'coral'}`}>{icon(a.type)}</div>
        <div className="grow"><span className="eyebrow">{String(a.type||'aktivitas').toUpperCase()}</span><h3>{a.title}</h3>{a.max_score?<small>Maks. {a.max_score} poin</small>:null}{a.due_at&&<small> • Batas blok tercantum di halaman aktivitas</small>}</div><ArrowRight/>
      </Link>)}</div>:<div className="notice">Fokus pertemuan ini adalah mempelajari dua materi dan mengerjakan aktivitas kelas yang tercantum di dalam materi.</div>}
    </div>:null}
  </AppShell></AuthGate>;
}
