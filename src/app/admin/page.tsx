'use client';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import { ClipboardCheck, FolderKanban, Megaphone, Users, Award, Database, UsersRound, ArrowRight, Zap, HardDrive } from 'lucide-react';

const cards=[
  ['/admin/activities','Kelola Tugas','Assignment, refleksi, testing, peer review, dan aktivitas tambahan.',ClipboardCheck],
  ['/admin/projects','Kelola Proyek','Review perencanaan dan feedback dosen.',FolderKanban],
  ['/admin/announcements','Pengumuman','Informasi kelas yang tampil di dashboard.',Megaphone],
  ['/admin/users','Pengguna','Mahasiswa, dosen, PIN, dan kelas.',Users],
  ['/admin/groups','Kelompok','Kelompok proyek dan anggota.',UsersRound],
  ['/admin/gradebook','Gradebook','Nilai tugas, diskusi, kuis, dan feedback.',Award],
  ['/admin/data','Import / Export','Excel data dinamis: users, post, submission, nilai, kelompok, proyek, dan log.',Database]
] as const;
export default function AdminPage(){return <AuthGate adminOnly><AppShell title="Kelola"><GlassCard className="admin-welcome"><div><span className="eyebrow">ARSITEKTUR RINGAN</span><h2>Konten inti sekarang statis</h2><p className="muted">28 materi HTML, 28 kuis, dan 28 prompt diskusi dikirim oleh Vercel/CDN. Google Sheets hanya menyimpan data yang berubah: pengguna, respons forum, attempt kuis, submission, nilai, perencanaan proyek, dan log.</p><div className="row wrap gap"><span className="badge success"><Zap/> Lebih cepat</span><span className="badge"><HardDrive/> Drive untuk file</span></div></div></GlassCard><div className="admin-grid">{cards.map(([href,title,desc,Icon])=><Link href={href} className="glass-card admin-card" key={href}><div className="icon-bubble teal"><Icon/></div><div className="grow"><h3>{title}</h3><p>{desc}</p></div><ArrowRight/></Link>)}</div></AppShell></AuthGate>}
