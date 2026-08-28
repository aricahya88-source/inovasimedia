import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import { PROJECTS } from '@/lib/projectThemes';
import { BookOpenCheck, ArrowRight } from 'lucide-react';

export default function GuidesPage(){
  return <AuthGate><AppShell title="Panduan Proyek"><div className="section-title"><div><span className="eyebrow">PANDUAN TEMA</span><h2>Referensi Proyek</h2><p className="muted">Panduan lima tema untuk setiap jenis proyek.</p></div></div><div className="project-grid">{PROJECTS.map(p=><Link href={`/guides/${p.code.toLowerCase()}`} className="glass-card project-tile" key={p.code}><div className="icon-bubble teal"><BookOpenCheck/></div><div className="grow"><h3>{p.name}</h3><p>{p.themes.map(t=>t.name).join(' • ')}</p></div><ArrowRight/></Link>)}</div></AppShell></AuthGate>
}
