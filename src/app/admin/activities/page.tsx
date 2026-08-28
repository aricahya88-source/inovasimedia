'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichTextEditor from '@/components/RichTextEditor';
import { api } from '@/lib/api';
import { Plus, Save } from 'lucide-react';

type A={activity_id?:string;week_id:string;type:string;title:string;description_html:string;mode:string;max_score:number;due_at:string;visible:boolean;allow_comments:boolean;project_code?:string};
const empty:A={week_id:'W01',type:'assignment',title:'',description_html:'',mode:'individual',max_score:100,due_at:'',visible:true,allow_comments:true};
export default function AdminActivities(){
  const[rows,setRows]=useState<A[]>([]);const[a,setA]=useState<A>(empty);const[msg,setMsg]=useState('');
  const load=()=>api<A[]>('adminListActivities').then(setRows);
  useEffect(()=>{load().catch(e=>setMsg(e.message));},[]);
  const save=async()=>{try{const r=await api<{activity:A}>('adminSaveActivity',{activity:a});setA(r.activity);setMsg('Aktivitas tersimpan.');await load();}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  return <AuthGate adminOnly><AppShell title="Kelola Tugas">
    <div className="admin-split"><GlassCard className="admin-list"><div className="row between"><div><span className="eyebrow">AKTIVITAS</span><h3>Tugas & Checkpoint</h3></div><button className="icon-button" onClick={()=>setA({...empty})}><Plus/></button></div><div className="scroll-list">{rows.map(x=><button key={x.activity_id} className={a.activity_id===x.activity_id?'select-row active':'select-row'} onClick={()=>setA(x)}><strong>{x.title}</strong><small>{x.week_id} • {x.type}</small></button>)}</div></GlassCard>
    <GlassCard>
      <div className="form-grid two">
        <label className="field"><span>Minggu</span><select value={a.week_id} onChange={e=>setA({...a,week_id:e.target.value})}>{Array.from({length:14},(_,i)=><option key={i} value={`W${String(i+1).padStart(2,'0')}`}>Minggu {i+1}</option>)}</select></label>
        <label className="field"><span>Jenis</span><select value={a.type} onChange={e=>setA({...a,type:e.target.value})}><option value="assignment">Tugas</option><option value="checkpoint">Checkpoint</option><option value="reflection">Refleksi</option><option value="peer_review">Peer Review</option><option value="test">Testing</option><option value="presentation">Presentasi</option></select></label>
        <label className="field"><span>Judul</span><input value={a.title} onChange={e=>setA({...a,title:e.target.value})}/></label>
        <label className="field"><span>Mode</span><select value={a.mode} onChange={e=>setA({...a,mode:e.target.value})}><option value="individual">Individu</option><option value="group">Kelompok</option></select></label>
        <label className="field"><span>Maks. nilai</span><input type="number" value={a.max_score} onChange={e=>setA({...a,max_score:Number(e.target.value)})}/></label>
        <label className="field"><span>Deadline</span><input type="datetime-local" value={a.due_at||''} onChange={e=>setA({...a,due_at:e.target.value})}/></label>
      </div>
      <label className="field"><span>Instruksi</span><RichTextEditor value={a.description_html} onChange={v=>setA({...a,description_html:v})} minHeight={280}/></label>
      <div className="row wrap gap"><label className="switch-row"><input type="checkbox" checked={a.visible} onChange={e=>setA({...a,visible:e.target.checked})}/>Visible</label><label className="switch-row"><input type="checkbox" checked={a.allow_comments} onChange={e=>setA({...a,allow_comments:e.target.checked})}/>Izinkan komentar</label></div>
      <div className="right-actions"><button className="button primary" onClick={save}><Save/>Simpan Aktivitas</button></div>
    </GlassCard></div>{msg&&<div className="notice">{msg}</div>}
  </AppShell></AuthGate>
}
