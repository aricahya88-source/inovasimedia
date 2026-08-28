'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichTextEditor from '@/components/RichTextEditor';
import { api } from '@/lib/api';
import { Plus, Save } from 'lucide-react';

type D={discussion_id?:string;activity_id?:string;week_id:string;title:string;prompt_html:string;max_score:number;min_posts:number;due_at?:string;visible?:boolean};

const empty:D={week_id:'W01',title:'',prompt_html:'',max_score:10,min_posts:1,due_at:'',visible:true};

export default function AdminDiscussions(){
  const[rows,setRows]=useState<D[]>([]);const[d,setD]=useState<D>(empty);const[msg,setMsg]=useState('');
  const load=()=>api<D[]>('adminListDiscussions').then(setRows);
  useEffect(()=>{load().catch(e=>setMsg(e.message));},[]);
  const save=async()=>{try{const r=await api<{discussion:D}>('adminSaveDiscussion',{discussion:d});setD(r.discussion);setMsg('Diskusi tersimpan.');await load();}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  return <AuthGate adminOnly><AppShell title="Kelola Diskusi">
    <div className="admin-split">
      <GlassCard className="admin-list"><div className="row between"><div><span className="eyebrow">FORUM</span><h3>Diskusi</h3></div><button className="icon-button" onClick={()=>setD({...empty})}><Plus/></button></div><div className="scroll-list">{rows.map(x=><button key={x.discussion_id} className={d.discussion_id===x.discussion_id?'select-row active':'select-row'} onClick={()=>setD(x)}><strong>{x.title}</strong><small>{x.week_id}</small></button>)}</div></GlassCard>
      <GlassCard>
        <div className="form-grid two"><label className="field"><span>Minggu</span><select value={d.week_id} onChange={e=>setD({...d,week_id:e.target.value})}>{Array.from({length:14},(_,i)=><option key={i} value={`W${String(i+1).padStart(2,'0')}`}>Minggu {i+1}</option>)}</select></label><label className="field"><span>Judul</span><input value={d.title} onChange={e=>setD({...d,title:e.target.value})}/></label><label className="field"><span>Maks. nilai</span><input type="number" value={d.max_score} onChange={e=>setD({...d,max_score:Number(e.target.value)})}/></label><label className="field"><span>Minimal post</span><input type="number" value={d.min_posts} onChange={e=>setD({...d,min_posts:Number(e.target.value)})}/></label></div>
        <label className="field"><span>Prompt diskusi</span><RichTextEditor value={d.prompt_html} onChange={v=>setD({...d,prompt_html:v})} minHeight={240}/></label>
        <div className="right-actions"><button className="button primary" onClick={save}><Save/>Simpan Diskusi</button></div>
      </GlassCard>
    </div>{msg&&<div className="notice">{msg}</div>}
  </AppShell></AuthGate>
}
