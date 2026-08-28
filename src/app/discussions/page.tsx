'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import { getStaticDiscussions } from '@/lib/staticContent';
import type { DiscussionSummary } from '@/lib/types';
import { MessagesSquare, ArrowRight, Zap, CalendarClock } from 'lucide-react';

export default function DiscussionsPage(){
  const[rows,setRows]=useState<DiscussionSummary[]>([]);const[error,setError]=useState('');
  useEffect(()=>{getStaticDiscussions().then(setRows).catch(e=>setError(e.message));},[]);
  return <AuthGate><AppShell title="Diskusi"><div className="section-title"><div><span className="eyebrow">FORUM LMS • 7 CHECKPOINT</span><h2>Diskusi Pembelajaran</h2><p className="muted">Tujuh diskusi sintesis mewakili rangkaian Materi 1–28. Prompt dimuat statis; posting dan balasan tetap tersimpan di Google Sheets.</p></div><span className="badge success"><Zap/> Static prompt</span></div>{error&&<div className="error-box">{error}</div>}<div className="stack small-gap">{rows.map(d=><Link className="glass-card list-card" key={d.discussion_id} href={`/discussions/${d.activity_id}`}><div className="icon-bubble teal"><MessagesSquare/></div><div className="grow"><span className="eyebrow">CHECKPOINT {d.checkpoint_no} • MATERI {d.material_range}</span><h3>{d.title}</h3><div className="row wrap gap"><small>Maks. {d.max_score} poin • respons tersimpan di Sheets</small>{d.due_label&&<span className="badge"><CalendarClock/> {d.due_label}</span>}</div></div><ArrowRight/></Link>)}</div></AppShell></AuthGate>
}
