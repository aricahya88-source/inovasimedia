'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichHtml from '@/components/RichHtml';
import { api } from '@/lib/api';
import type { Grade } from '@/lib/types';
import { Award } from 'lucide-react';

export default function GradesPage(){
  const [rows,setRows]=useState<Grade[]>([]);const [error,setError]=useState('');
  useEffect(()=>{api<Grade[]>('listGrades').then(setRows).catch(e=>setError(e.message));},[]);
  const total=rows.reduce((a,g)=>a+(Number(g.score)||0),0), max=rows.reduce((a,g)=>a+(Number(g.max_score)||0),0);
  return <AuthGate><AppShell title="Nilai">
    <section className="hero-panel glass-panel"><div><span className="eyebrow">GRADEBOOK</span><h2>Nilai & Feedback</h2><p>Nilai yang sudah dipublikasikan dosen.</p></div><div className="progress-orb"><strong>{max?Math.round(total/max*100):0}%</strong><small>rata-rata poin</small></div></section>
    {error&&<div className="error-box">{error}</div>}
    <div className="stack small-gap">{rows.length?rows.map(g=><GlassCard key={g.grade_id} className="list-card"><div className="icon-bubble amber"><Award/></div><div className="grow"><h3>{g.activity_title||g.activity_id}</h3><div className="score-large">{g.score} <small>/ {g.max_score}</small></div><RichHtml html={g.feedback_html||''}/></div></GlassCard>):<GlassCard><p className="muted">Belum ada nilai yang dipublikasikan.</p></GlassCard>}</div>
  </AppShell></AuthGate>
}
