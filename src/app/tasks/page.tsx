'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/api';
import { getStaticActivities } from '@/lib/staticContent';
import { ClipboardCheck, CircleHelp, FolderKanban, ArrowRight, Zap } from 'lucide-react';

type StaticRow={activity_id:string;week_id:string;type:string;title:string;max_score?:number;project_code?:string;quiz_id?:string};
type Progress={quizAttempts:Record<string,number>;projectStatus:Record<string,string>};
export default function TasksPage(){
  const[rows,setRows]=useState<StaticRow[]>([]);const[progress,setProgress]=useState<Progress>({quizAttempts:{},projectStatus:{}});const[error,setError]=useState('');
  useEffect(()=>{Promise.all([getStaticActivities(),api<Progress>('getStaticActivityProgress')]).then(([a,p])=>{setRows(a.filter(x=>x.type==='quiz'||x.type==='project'));setProgress(p)}).catch(e=>setError(e.message));},[]);
  const href=(r:StaticRow)=>r.type==='project'?`/projects/${r.project_code}`:`/tasks/${r.activity_id}`;
  return <AuthGate><AppShell title="Tugas & Kuis"><div className="section-title"><div><span className="eyebrow">AKTIVITAS INTI</span><h2>Kuis & Proyek</h2><p className="muted">Definisi aktivitas berasal dari static bundle; hanya progress dan hasil yang dibaca dari Sheets.</p></div><span className="badge success"><Zap/> CDN + Sheets</span></div>{error&&<div className="error-box">{error}</div>}<div className="stack small-gap">{rows.map(r=><Link href={href(r)} key={r.activity_id} className="glass-card list-card"><div className={`icon-bubble ${r.type==='quiz'?'amber':r.type==='project'?'coral':'teal'}`}>{r.type==='quiz'?<CircleHelp/>:r.type==='project'?<FolderKanban/>:<ClipboardCheck/>}</div><div className="grow"><span className="eyebrow">{r.week_id} • {r.type.toUpperCase()}</span><h3>{r.title}</h3><div className="row wrap gap"><small>Maks. {r.max_score||0} poin</small>{r.type==='quiz'&&<span className="badge">{progress.quizAttempts[r.quiz_id||'']||0} attempt</span>}{r.type==='project'&&<span className="badge success">{progress.projectStatus[r.project_code||'']||'Belum direncanakan'}</span>}</div></div><ArrowRight/></Link>)}</div></AppShell></AuthGate>
}
