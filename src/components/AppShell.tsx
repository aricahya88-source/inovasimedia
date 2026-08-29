'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House, CalendarDays, MessagesSquare, ClipboardCheck, Star, Settings2,
  Users, BookOpenCheck, FolderKanban, LogOut, Menu, X, LibraryBig, ScrollText
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

const studentDesktop = [
  ['/dashboard','Home',House],
  ['/rencana-pembelajaran','Rencana Pembelajaran',ScrollText],
  ['/weeks','Pertemuan',CalendarDays],
  ['/discussions','Diskusi',MessagesSquare],
  ['/tasks','Tugas',ClipboardCheck],
  ['/grades','Nilai',Star]
] as const;

const studentMobile = [
  ['/dashboard','Home',House],
  ['/weeks','Pertemuan',CalendarDays],
  ['/discussions','Diskusi',MessagesSquare],
  ['/tasks','Tugas',ClipboardCheck],
  ['/grades','Nilai',Star]
] as const;

const desktopExtra = [
  ['/projects','Proyek',FolderKanban],
  ['/guides','Panduan',LibraryBig]
] as const;

export default function AppShell({children,title='LMS Inovasi Media'}:{children:React.ReactNode;title?:string}) {
  const {user,logout}=useAuth();
  const path=usePathname();
  const [open,setOpen]=useState(false);
  const isAdmin=!!user && ['admin','dosen'].includes(user.role);
  const mobileNav=isAdmin
    ? [['/dashboard','Home',House],['/weeks','Pertemuan',CalendarDays],['/admin','Kelola',Settings2],['/grades','Nilai',Star],['/admin/users','Pengguna',Users]] as const
    : studentMobile;

  const nav=[...studentDesktop,...desktopExtra,...(isAdmin ? [
    ['/admin','Kelola',Settings2],
    ['/admin/users','Pengguna',Users],
    ['/admin/gradebook','Gradebook',BookOpenCheck]
  ] as const : [])];

  const drawerNav=[['/rencana-pembelajaran','Rencana Pembelajaran',ScrollText] as const,...desktopExtra,...(isAdmin?[['/admin','Kelola',Settings2],['/admin/users','Pengguna',Users]] as const:[])];

  return <div className="app-bg">
    <div className="liquid-orb orb-a"/><div className="liquid-orb orb-b"/><div className="liquid-orb orb-c"/>
    <aside className="desktop-sidebar glass-panel">
      <div className="brand">
        <div className="brand-icon"><BookOpenCheck size={23}/></div>
        <div><strong>LMS Inovasi Media</strong><small>Bahasa Arab</small></div>
      </div>
      <nav className="side-nav">
        {nav.map(([href,label,Icon])=><Link key={href} href={href} className={cn('side-link',path.startsWith(href) && (href!='/dashboard'||path==='/dashboard') && 'active')}>
          <Icon size={19}/><span>{label}</span>
        </Link>)}
      </nav>
      <div className="sidebar-user">
        <div className="avatar">{(user?.name||'U').slice(0,1).toUpperCase()}</div>
        <div className="grow"><strong>{user?.name}</strong><small>{user?.role}</small></div>
        <button className="icon-button" onClick={logout} title="Keluar"><LogOut size={17}/></button>
      </div>
    </aside>

    <div className="app-stage">
      <header className="topbar glass-panel">
        <div>
          <span className="eyebrow">INOVASI MEDIA PEMBELAJARAN BAHASA ARAB</span>
          <h1>{title}</h1>
        </div>
        <div className="topbar-actions">
          <span className="user-chip"><span className="dot"/>{user?.name}</span>
          <button className="icon-button mobile-only" onClick={()=>setOpen(v=>!v)}>{open?<X/>:<Menu/>}</button>
        </div>
      </header>
      {open && <div className="mobile-drawer glass-panel mobile-only">
        {drawerNav.map(([href,label,Icon])=>
          <Link key={href} href={href} onClick={()=>setOpen(false)} className="drawer-link"><Icon size={18}/>{label}</Link>)}
      </div>}
      <main className="page-content">{children}</main>
    </div>

    <nav className="bottom-nav glass-panel">
      {mobileNav.map(([href,label,Icon])=><Link key={href} href={href} className={cn('bottom-link',path.startsWith(href) && (href!='/dashboard'||path==='/dashboard') && 'active')}>
        <Icon size={20}/><span>{label}</span>
      </Link>)}
    </nav>
  </div>;
}
