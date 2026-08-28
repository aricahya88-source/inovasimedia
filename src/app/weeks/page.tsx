'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import { getStaticCourse, type StaticMilestone } from '@/lib/staticContent';
import type { WeekSummary } from '@/lib/types';
import { CalendarDays, ArrowRight, BookOpenText, ClipboardCheck, CloudOff, Flag } from 'lucide-react';

type CourseData={weeks:WeekSummary[];milestones:StaticMilestone[];semester_start_label:string;discussion_count:number;quiz_count:number};

export default function WeeksPage(){
  const [course,setCourse]=useState<CourseData|null>(null); const [error,setError]=useState('');
  useEffect(()=>{getStaticCourse().then(x=>setCourse(x)).catch(e=>setError(e.message));},[]);
  const rows=course?.weeks||[];
  return <AuthGate><AppShell title="Pertemuan Pembelajaran">
    <div className="section-title"><div><span className="eyebrow">14 PERTEMUAN • 28 MATERI</span><h2>Alur Semester</h2><p className="muted">Mulai 7 September 2026. Materi dibaca langsung dari Vercel/CDN; Google Sheets hanya menyimpan aktivitas dan hasil mahasiswa.</p></div><span className="badge success"><CloudOff/> Ringan</span></div>
    {course&&<div className="two-column">
      {course.milestones.map(m=><GlassCard key={m.block} className="feature-card"><div className="icon-bubble amber"><Flag/></div><div className="grow"><span className="eyebrow">BLOK {m.block}</span><h3>{m.title}</h3><p className="muted">Batas pengumpulan: <strong>{m.deadline_label}</strong></p></div></GlassCard>)}
    </div>}
    {error&&<div className="error-box">{error}</div>}
    <div className="week-grid">{rows.map(w=><Link key={w.week_id} href={`/weeks/${w.week_no}`} className="glass-card week-tile">
      <div className="week-number"><CalendarDays/><strong>{String(w.week_no).padStart(2,'0')}</strong></div>
      <div className="grow"><span className="eyebrow">PERTEMUAN {w.week_no} • BLOK {w.block||1}</span><h3>{w.title}</h3><p className="muted tiny">{w.meeting_date_label}</p><div className="row wrap gap"><span className="badge"><BookOpenText/> {w.material_count} materi</span><span className="badge"><ClipboardCheck/> {w.activity_count} aktivitas</span></div></div><ArrowRight/>
    </Link>)}</div>
    {!rows.length&&!error&&<div className="screen-center small"><div className="spinner"/>Memuat konten lokal...</div>}
  </AppShell></AuthGate>
}
