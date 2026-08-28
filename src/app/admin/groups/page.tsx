'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { Plus, Save } from 'lucide-react';

type Group={group_id?:string;project_code:string;name:string;member_ids:string[]};
const empty:Group={project_code:'AUDIOVISUAL',name:'',member_ids:[]};

export default function AdminGroups(){
  const[groups,setGroups]=useState<Group[]>([]);const[users,setUsers]=useState<User[]>([]);const[g,setG]=useState<Group>({...empty});const[msg,setMsg]=useState('');
  const load=async()=>{const [a,b]=await Promise.all([api<Group[]>('adminListGroups'),api<User[]>('adminListUsers')]);setGroups(a);setUsers(b.filter(x=>x.role==='mahasiswa'))};
  useEffect(()=>{load().catch(e=>setMsg(e.message));},[]);
  const save=async()=>{try{const d=await api<{group:Group}>('adminSaveGroup',{group:g});setG(d.group);setMsg('Kelompok tersimpan.');await load()}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  const toggle=(id:string)=>setG(x=>({...x,member_ids:x.member_ids.includes(id)?x.member_ids.filter(v=>v!==id):[...x.member_ids,id]}));
  return <AuthGate adminOnly><AppShell title="Kelompok"><div className="admin-split">
    <GlassCard className="admin-list"><div className="row between"><div><span className="eyebrow">KELOMPOK</span><h3>{groups.length} Kelompok</h3></div><button className="icon-button" onClick={()=>setG({...empty})}><Plus/></button></div><div className="scroll-list">{groups.map(x=><button key={x.group_id} className={g.group_id===x.group_id?'select-row active':'select-row'} onClick={()=>setG(x)}><strong>{x.name}</strong><small>{x.project_code} • {x.member_ids.length} anggota</small></button>)}</div></GlassCard>
    <GlassCard><div className="form-grid two"><label className="field"><span>Nama kelompok</span><input value={g.name} onChange={e=>setG({...g,name:e.target.value})}/></label><label className="field"><span>Proyek</span><select value={g.project_code} onChange={e=>setG({...g,project_code:e.target.value})}><option value="AUDIOVISUAL">Audiovisual</option><option value="WEBSITE">Website</option><option value="PWA">PWA</option><option value="AUDIO">Audio</option><option value="VISUAL">Visual</option></select></label></div><div className="field"><span>Anggota</span><div className="member-grid">{users.map(u=><button type="button" key={u.user_id} className={g.member_ids.includes(u.user_id)?'member-chip selected':'member-chip'} onClick={()=>toggle(u.user_id)}><span className="avatar small">{u.name[0]}</span><span><strong>{u.name}</strong><small>{u.nim}</small></span></button>)}</div></div><div className="right-actions"><button className="button primary" onClick={save}><Save/>Simpan Kelompok</button></div></GlassCard>
  </div>{msg&&<div className="notice">{msg}</div>}</AppShell></AuthGate>
}
