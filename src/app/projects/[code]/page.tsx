'use client';
import { use } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import ProjectPlanForm from '@/components/ProjectPlanForm';
import { ArrowLeft } from 'lucide-react';

export default function ProjectPage({params}:{params:Promise<{code:string}>}){
  const {code}=use(params);
  return <AuthGate><AppShell title={`Proyek ${code}`}><Link href="/projects" className="button soft compact"><ArrowLeft/>Kembali</Link><ProjectPlanForm code={code.toUpperCase()}/></AppShell></AuthGate>
}
