'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import { getStaticCourse } from '@/lib/staticContent';
import type { WeekSummary } from '@/lib/types';
import { CalendarDays, ArrowRight, BookOpenText, ClipboardCheck, CloudOff } from 'lucide-react';

export default function WeeksPage(){
  const [rows,setRows]=useState<WeekSummary[]>([]); const [error,setError]=useState('');
  useEffect(()=>{getStaticCourse().then(x=>setRows(x.weeks)).catch(e=>setError(e.message));},[]);
  return <AuthGate><AppShell title="Minggu Pembelajaran">
    <div className="section-title"><div><span className="eyebrow">14 MINGGU • 28 MATERI</span><h2>Alur Pembelajaran</h2><p className="muted">Konten inti dikirim sebagai file statis dari Vercel/CDN. Spreadsheet hanya dipakai untuk data belajar yang berubah.</p></div><span className="badge success"><CloudOff/> Ringan</span></div>
    {error&&<div className="error-box">{error}</div>}
    <div className="week-grid">{rows.map(w=><Link key={w.week_id} href={`/weeks/${w.week_no}`} className="glass-card week-tile">
      <div className="week-number"><CalendarDays/><strong>{String(w.week_no).padStart(2,'0')}</strong></div>
      <div className="grow"><span className="eyebrow">MINGGU {w.week_no}</span><h3>{w.title}</h3><div className="row wrap gap"><span className="badge"><BookOpenText/> {w.material_count} materi</span><span className="badge"><ClipboardCheck/> {w.activity_count} aktivitas</span></div></div><ArrowRight/>
    </Link>)}</div>
    {!rows.length&&!error&&<div className="screen-center small"><div className="spinner"/>Memuat konten lokal...</div>}
  </AppShell></AuthGate>
}
