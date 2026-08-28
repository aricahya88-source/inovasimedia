'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichHtml from '@/components/RichHtml';
import SpeechPlayer from '@/components/SpeechPlayer';
import { ArrowLeft } from 'lucide-react';

type Guide={code:string;title:string;html:string};
export default function GuidePage({params}:{params:Promise<{code:string}>}){
  const {code}=use(params);const[d,setD]=useState<Guide|null>(null);const[error,setError]=useState('');
  useEffect(()=>{fetch(`/content/guides/${code}.json`).then(r=>{if(!r.ok)throw new Error('Panduan tidak ditemukan');return r.json()}).then(setD).catch(e=>setError(e.message));},[code]);
  return <AuthGate><AppShell title="Panduan Proyek"><Link href="/guides" className="button soft compact"><ArrowLeft/>Kembali</Link>{error&&<div className="error-box">{error}</div>}{d&&<GlassCard className="material-card"><span className="eyebrow">PANDUAN TEMA PROYEK</span><h2>{d.title}</h2><SpeechPlayer html={d.html}/><RichHtml html={d.html} className="rich-html material-html"/></GlassCard>}</AppShell></AuthGate>
}
