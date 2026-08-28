'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichHtml from '@/components/RichHtml';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { BookOpenText, CalendarDays, MessagesSquare, FolderKanban, Award, ArrowRight, Megaphone } from 'lucide-react';
import Link from 'next/link';

type Dash = {
  stats:{progress:number;activities:number;completed:number;graded:number;posts?:number};
  currentWeek?:{week_id:string;week_no:number;title:string};
  upcoming:Array<{activity_id:string;title:string;type:string;due_at:string}>;
  announcements:Array<{announcement_id:string;title:string;content_html:string;published_at:string}>;
  projects:Array<{activity_id:string;title:string;project_code:string;status?:string}>;
};

export default function DashboardPage(){
  const {user}=useAuth();
  const [d,setD]=useState<Dash|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{api<Dash>('getDashboard').then(setD).catch(e=>setError(e.message));},[]);
  return <AuthGate><AppShell title="Beranda">
    {error&&<div className="error-box">{error}</div>}
    {!d?<div className="screen-center small"><div className="spinner"/>Memuat dashboard...</div>:<div className="stack">
      <section className="hero-panel glass-panel">
        <div><span className="eyebrow">HALO, {user?.name?.toUpperCase()}</span><h2>{user?.role==='mahasiswa'?'Lanjutkan perjalanan belajar Anda.':'Kelola pembelajaran dengan ringkas.'}</h2><p>Materi, diskusi, kuis, proyek, feedback, dan nilai dalam alur yang terstruktur.</p></div>
        <div className="progress-orb"><strong>{d.stats.progress}%</strong><small>progress</small></div>
      </section>
      <div className="stats-grid">
        <GlassCard className="stat-card"><div className="icon-bubble teal"><BookOpenText/></div><div><strong>{d.stats.activities}</strong><span>Aktivitas</span></div></GlassCard>
        <GlassCard className="stat-card"><div className="icon-bubble amber"><CalendarDays/></div><div><strong>{d.currentWeek?.week_no||1}</strong><span>Minggu aktif</span></div></GlassCard>
        <GlassCard className="stat-card"><div className="icon-bubble coral"><MessagesSquare/></div><div><strong>{d.stats.completed}</strong><span>Selesai</span></div></GlassCard>
        <GlassCard className="stat-card"><div className="icon-bubble teal"><Award/></div><div><strong>{d.stats.graded}</strong><span>Dinilai</span></div></GlassCard>
      </div>

      {d.currentWeek&&<GlassCard className="feature-card">
        <div className="icon-bubble teal"><CalendarDays/></div><div className="grow"><span className="eyebrow">MINGGU BERJALAN</span><h3>{d.currentWeek.title}</h3><p className="muted">Dua materi dalam satu minggu, lengkap dengan kuis dan forum.</p></div>
        <Link className="circle-link" href={`/weeks/${d.currentWeek.week_no}`}><ArrowRight/></Link>
      </GlassCard>}

      <div className="two-column">
        <div>
          <div className="section-title"><div><span className="eyebrow">DEADLINE</span><h3>Tugas Mendatang</h3></div><Link href="/tasks">Lihat semua</Link></div>
          <div className="stack small-gap">{d.upcoming.length?d.upcoming.map(a=><GlassCard key={a.activity_id} className="list-card"><div className="icon-bubble amber"><BookOpenText/></div><div className="grow"><strong>{a.title}</strong><small>{a.type} • {formatDate(a.due_at)}</small></div></GlassCard>):<GlassCard><p className="muted">Belum ada deadline.</p></GlassCard>}</div>
        </div>
        <div>
          <div className="section-title"><div><span className="eyebrow">INFO</span><h3>Pengumuman Terbaru</h3></div></div>
          <div className="stack small-gap">{d.announcements.length?d.announcements.map(a=><GlassCard key={a.announcement_id} className="list-card"><div className="icon-bubble coral"><Megaphone/></div><div className="grow"><strong>{a.title}</strong><RichHtml html={a.content_html}/><small>{formatDate(a.published_at)}</small></div></GlassCard>):<GlassCard><p className="muted">Belum ada pengumuman.</p></GlassCard>}</div>
        </div>
      </div>

      <div className="section-title"><div><span className="eyebrow">PROJECT-BASED</span><h3>Proyek Utama</h3></div><Link href="/projects">Semua proyek</Link></div>
      <div className="project-grid">{d.projects.map(p=><Link href={`/projects/${p.project_code}`} key={p.activity_id} className="glass-card project-tile"><FolderKanban/><strong>{p.title}</strong><small>{p.status||'Belum direncanakan'}</small><ArrowRight/></Link>)}</div>
    </div>}
  </AppShell></AuthGate>;
}
