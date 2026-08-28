'use client';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import { PROJECTS } from '@/lib/projectThemes';
import { FolderKanban, ArrowRight, UsersRound } from 'lucide-react';

export default function ProjectsPage(){
  return <AuthGate><AppShell title="Proyek">
    <div className="section-title"><div><span className="eyebrow">5 OUTPUT UTAMA</span><h2>Proyek Inovasi Media</h2><p className="muted">Setiap proyek memiliki perencanaan, produksi, uji, revisi, dan finalisasi.</p></div></div>
    <div className="project-grid large">{PROJECTS.map(p=><Link className="glass-card project-tile" href={`/projects/${p.code}`} key={p.code}><div className="icon-bubble coral"><FolderKanban/></div><div className="grow"><h3>{p.name}</h3><p>{p.themes.length} pilihan tema</p>{p.group&&<span className="badge"><UsersRound/>Kelompok</span>}</div><ArrowRight/></Link>)}</div>
  </AppShell></AuthGate>
}
