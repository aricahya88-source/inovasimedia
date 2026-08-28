'use client';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { BookOpenCheck, LogIn, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const {login}=useAuth();
  const [identity,setIdentity]=useState('');
  const [pin,setPin]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  const submit=async(e:FormEvent)=>{
    e.preventDefault(); setBusy(true); setError('');
    try { await login(identity,pin); }
    catch(err){ setError(err instanceof Error?err.message:String(err)); }
    finally { setBusy(false); }
  };

  return <div className="login-screen">
    <div className="liquid-orb orb-a"/><div className="liquid-orb orb-b"/><div className="liquid-orb orb-c"/>
    <div className="login-shell">
      <section className="login-copy">
        <div className="brand-icon large"><BookOpenCheck/></div>
        <span className="eyebrow">PWA • NEXT.JS • APPS SCRIPT • DRIVE</span>
        <h1>LMS Inovasi Media Pembelajaran Bahasa Arab</h1>
        <p>Belajar, berdiskusi, membuat proyek, menguji, merevisi, dan merefleksikan media pembelajaran dalam satu alur yang ringan.</p>
        <div className="login-pills"><span>14 Minggu</span><span>28 Materi</span><span>5 Proyek</span><span>Text-to-Speech</span></div>
      </section>
      <form onSubmit={submit} className="glass-panel login-card">
        <div className="row gap"><div className="icon-bubble teal"><ShieldCheck/></div><div><span className="eyebrow">AKSES LMS</span><h2>Masuk</h2></div></div>
        <label className="field"><span>Email / NIM</span><input autoFocus value={identity} onChange={e=>setIdentity(e.target.value)} placeholder="NIM atau email" autoComplete="username"/></label>
        <label className="field"><span>PIN</span><input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN minimal 6 karakter" autoComplete="current-password"/></label>
        {error&&<div className="error-box">{error}</div>}
        <button disabled={busy||!identity||!pin} className="button primary large" type="submit"><LogIn/>{busy?'Memeriksa...':'Masuk ke LMS'}</button>
        <p className="tiny muted">Database: Google Sheets • File: Google Drive • Frontend: Vercel</p>
      </form>
    </div>
  </div>;
}
