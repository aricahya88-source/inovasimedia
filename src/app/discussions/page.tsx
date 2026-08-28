'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import { api } from '@/lib/api';
import type { DiscussionSummary } from '@/lib/types';
import { MessagesSquare, ArrowRight } from 'lucide-react';

export default function DiscussionsPage(){
  const [rows,setRows]=useState<DiscussionSummary[]>([]); const [error,setError]=useState('');
  useEffect(()=>{api<DiscussionSummary[]>('listDiscussions').then(setRows).catch(e=>setError(e.message));},[]);
  return <AuthGate><AppShell title="Diskusi">
    <div className="section-title"><div><span className="eyebrow">FORUM LMS</span><h2>Diskusi Pembelajaran</h2><p className="muted">Berargumentasi, menanggapi teman, dan memperoleh feedback.</p></div></div>
    {error&&<div className="error-box">{error}</div>}
    <div className="stack small-gap">{rows.map(d=><Link className="glass-card list-card" key={d.discussion_id} href={`/discussions/${d.activity_id}`}>
      <div className="icon-bubble teal"><MessagesSquare/></div><div className="grow"><span className="eyebrow">{d.week_id}</span><h3>{d.title}</h3><small>{d.post_count||0} respons • Maks. {d.max_score} poin</small></div><ArrowRight/>
    </Link>)}</div>
  </AppShell></AuthGate>
}
