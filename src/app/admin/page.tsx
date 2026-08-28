'use client';
import Link from 'next/link';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import { getToken } from '@/lib/api';
import {
  BookOpenText, CircleHelp, MessagesSquare, ClipboardCheck, FolderKanban, Megaphone,
  Users, Award, Database, UsersRound, Sparkles, ArrowRight
} from 'lucide-react';

const cards=[
  ['/admin/materials','Kelola Materi','Edit 28 materi dan sumber media.',BookOpenText],
  ['/admin/quizzes','Kelola Kuis','Buat kuis, soal A–D, kunci dan feedback.',CircleHelp],
  ['/admin/discussions','Kelola Diskusi','Topik forum, prompt, poin, dan periode.',MessagesSquare],
  ['/admin/activities','Kelola Tugas','Assignment, refleksi, testing, peer review.',ClipboardCheck],
  ['/admin/projects','Kelola Proyek','Review perencanaan dan feedback dosen.',FolderKanban],
  ['/admin/announcements','Pengumuman','Informasi kelas yang tampil di dashboard.',Megaphone],
  ['/admin/users','Pengguna','Mahasiswa, dosen, PIN, dan kelas.',Users],
  ['/admin/groups','Kelompok','Kelompok proyek dan anggota.',UsersRound],
  ['/admin/gradebook','Gradebook','Nilai tugas, diskusi, kuis, dan feedback.',Award],
  ['/admin/data','Import / Export','Excel seluruh database dan aktivitas.',Database]
] as const;

export default function AdminPage(){
  const [busy,setBusy]=useState(false);const[msg,setMsg]=useState('');
  const seed=async()=>{
    if(!confirm('Pasang/refresh materi 1–28, 28 kuis, dan 28 diskusi dari DOCX bawaan? Data dengan ID yang sama akan diperbarui.'))return;
    setBusy(true);setMsg('');
    try{
      const r=await fetch('/api/admin/seed',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:getToken(),scope:'all'})});
      const j=await r.json();
      if(!j.ok)throw new Error(j.error?.message||'Seed gagal');
      setMsg(`Konten bawaan terpasang: ${j.data?.materials||28} materi, ${j.data?.quizzes||28} kuis, ${j.data?.discussions||28} diskusi.`);
    }catch(e){setMsg(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  };
  return <AuthGate adminOnly><AppShell title="Kelola">
    <GlassCard className="admin-welcome">
      <div><span className="eyebrow">ADMIN / DOSEN</span><h2>Pusat Pengelolaan LMS</h2><p className="muted">Semua pengelolaan konten, aktivitas, proyek, pengguna, dan nilai berada di sini.</p></div>
      <button className="button accent" onClick={seed} disabled={busy}><Sparkles/>{busy?'Memasang...':'Pasang Semua Konten DOCX'}</button>
    </GlassCard>
    {msg&&<div className="notice">{msg}</div>}
    <div className="admin-grid">{cards.map(([href,title,desc,Icon])=><Link href={href} className="glass-card admin-card" key={href}><div className="icon-bubble teal"><Icon/></div><div className="grow"><h3>{title}</h3><p>{desc}</p></div><ArrowRight/></Link>)}</div>
  </AppShell></AuthGate>
}
