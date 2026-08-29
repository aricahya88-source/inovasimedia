'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import { getStaticRpp, type StaticRpp } from '@/lib/staticContent';
import {
  ScrollText, CalendarDays, Clock3, BookOpenText, Target, BookMarked,
  UsersRound, CheckCircle2, ArrowRight, ChevronDown, ChevronUp, Flag,
  MessagesSquare, CircleHelp, FolderKanban, Sparkles, Route, TimerReset
} from 'lucide-react';

const checkpointIcon=(type:string)=>type==='discussion'?MessagesSquare:type==='quiz'?CircleHelp:FolderKanban;

export default function RencanaPembelajaranPage(){
  const [data,setData]=useState<StaticRpp|null>(null);
  const [error,setError]=useState('');
  const [expanded,setExpanded]=useState<number|null>(1);
  useEffect(()=>{getStaticRpp().then(setData).catch(e=>setError(e instanceof Error?e.message:String(e)));},[]);

  return <AuthGate><AppShell title="Rencana Pelaksanaan Pembelajaran">
    {error&&<div className="error-box">{error}</div>}
    {!data&&!error?<div className="screen-center small"><div className="spinner"/>Memuat rencana pembelajaran...</div>:null}
    {data&&<div className="stack rpp-page">
      <section className="rpp-hero glass-panel">
        <div className="rpp-hero-copy">
          <span className="rpp-icon"><ScrollText/></span>
          <div><span className="eyebrow">RENCANA PELAKSANAAN PEMBELAJARAN</span><h2>{data.course}</h2><p>{data.design_note}</p></div>
        </div>
        <div className="rpp-hero-stats">
          <div><CalendarDays/><strong>{data.meeting_count}</strong><span>Pertemuan</span></div>
          <div><BookOpenText/><strong>{data.material_count}</strong><span>Materi</span></div>
          <div><Clock3/><strong>{data.duration_per_meeting}</strong><span>Per pertemuan</span></div>
        </div>
      </section>

      <div className="rpp-summary-grid">
        <GlassCard className="rpp-summary-card"><div className="icon-bubble teal"><CalendarDays/></div><div><span className="eyebrow">MULAI KULIAH</span><strong>{data.meeting_day}, {data.semester_start_label}</strong><small>14 pertemuan berurutan setiap Senin</small></div></GlassCard>
        {data.milestones.map(m=><GlassCard className="rpp-summary-card" key={m.block}><div className={`icon-bubble ${m.block===1?'amber':'coral'}`}><Flag/></div><div><span className="eyebrow">BLOK {m.block}</span><strong>Materi {m.material_range}</strong><small>Batas: {m.deadline_label}</small></div></GlassCard>)}
      </div>

      <div className="section-title"><div><span className="eyebrow">TIMELINE SEMESTER</span><h2>14 Pertemuan, Satu Alur yang Jelas</h2><p className="muted">Klik detail untuk melihat tujuan, kegiatan sebelum–saat–sesudah pertemuan, output, dan checkpoint.</p></div><span className="badge success"><Route/> Rencana statis</span></div>

      <div className="rpp-timeline">
        {data.meetings.map(meeting=>{
          const isOpen=expanded===meeting.meeting_no;
          return <article className={`rpp-meeting glass-card ${isOpen?'open':''}`} key={meeting.week_id}>
            <span className="rpp-timeline-dot">{String(meeting.meeting_no).padStart(2,'0')}</span>
            <div className="rpp-meeting-head">
              <div className="grow"><div className="row wrap gap"><span className="eyebrow">PERTEMUAN {meeting.meeting_no} • BLOK {meeting.block}</span>{meeting.milestone&&<span className="badge warning"><Flag/>{meeting.milestone}</span>}</div><h3>{meeting.title}</h3><p className="muted tiny"><CalendarDays/> {meeting.date_label} &nbsp;•&nbsp; <TimerReset/> {meeting.duration}</p></div>
              <button className="button soft compact" onClick={()=>setExpanded(isOpen?null:meeting.meeting_no)}>{isOpen?<ChevronUp/>:<ChevronDown/>}{isOpen?'Ringkas':'Lihat detail'}</button>
            </div>

            <div className="rpp-material-pills">
              {meeting.materials.map(m=><Link href={`/weeks/${meeting.meeting_no}#mat-${m.material_no}-overview`} key={m.material_no} className="rpp-material-pill"><BookMarked/><span><small>Materi {m.material_no}</small><strong>{m.title}</strong></span></Link>)}
            </div>

            {!!meeting.checkpoints.length&&<div className="rpp-checkpoints">{meeting.checkpoints.map(c=>{const Icon=checkpointIcon(c.type);return <Link href={c.href} key={c.activity_id} className={`checkpoint-chip checkpoint-${c.type}`}><Icon/>{c.title}</Link>})}</div>}

            {isOpen&&<div className="rpp-detail">
              <div className="rpp-objectives">
                <div className="rpp-detail-title"><Target/><div><span className="eyebrow">TUJUAN PERTEMUAN</span><h4>{meeting.sub_cpmk.length?`Sub-CPMK ${meeting.sub_cpmk.join(' & ')}`:'Capaian pembelajaran'}</h4></div></div>
                <ul>{meeting.objectives.map((o,i)=><li key={i}><CheckCircle2/>{o}</li>)}</ul>
              </div>

              <div className="rpp-phases">
                <div className="rpp-phase before"><div className="phase-icon"><BookOpenText/></div><span className="eyebrow">SEBELUM PERTEMUAN</span><ul>{meeting.before.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
                <div className="rpp-phase during"><div className="phase-icon"><UsersRound/></div><span className="eyebrow">SAAT PERTEMUAN</span><ul>{meeting.during.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
                <div className="rpp-phase after"><div className="phase-icon"><Sparkles/></div><span className="eyebrow">SETELAH PERTEMUAN</span><ul>{meeting.after.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
              </div>

              <div className="rpp-output-box"><div className="icon-bubble amber"><CheckCircle2/></div><div className="grow"><span className="eyebrow">OUTPUT / BUKTI BELAJAR</span>{meeting.outputs.map((x,i)=><p key={i}>{x}</p>)}</div><Link href={`/weeks/${meeting.meeting_no}`} className="button primary compact">Buka Pertemuan <ArrowRight/></Link></div>
            </div>}
          </article>;
        })}
      </div>
    </div>}
  </AppShell></AuthGate>;
}
