'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ClipboardCheck, CircleHelp, FolderKanban, ArrowRight } from 'lucide-react';

type Row={activity_id:string;week_id:string;type:string;title:string;max_score:number;due_at:string;project_code?:string;submitted?:boolean;attempts?:number};

export default function TasksPage(){
  const [rows,setRows]=useState<Row[]>([]);const [error,setError]=useState('');
  useEffect(()=>{api<Row[]>('listTasks').then(setRows).catch(e=>setError(e.message));},[]);
  const href=(r:Row)=>r.type==='project'?`/projects/${r.project_code}`:`/tasks/${r.activity_id}`;
  return <AuthGate><AppShell title="Tugas & Kuis">
    <div className="section-title"><div><span className="eyebrow">AKTIVITAS</span><h2>Tugas, Kuis & Proyek</h2></div></div>
    {error&&<div className="error-box">{error}</div>}
    <div className="stack small-gap">{rows.map(r=><Link href={href(r)} key={r.activity_id} className="glass-card list-card">
      <div className={`icon-bubble ${r.type==='quiz'?'amber':r.type==='project'?'coral':'teal'}`}>{r.type==='quiz'?<CircleHelp/>:r.type==='project'?<FolderKanban/>:<ClipboardCheck/>}</div>
      <div className="grow"><span className="eyebrow">{r.week_id} • {r.type.toUpperCase()}</span><h3>{r.title}</h3><div className="row wrap gap"><small>Maks. {r.max_score||0} poin</small>{r.due_at&&<small>{formatDate(r.due_at)}</small>}<span className={r.submitted?'badge success':'badge'}>{r.type==='quiz'?`${r.attempts||0} attempt`:r.submitted?'Sudah dikumpulkan':'Belum dikumpulkan'}</span></div></div><ArrowRight/>
    </Link>)}</div>
  </AppShell></AuthGate>
}
