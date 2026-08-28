'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import { Plus, Save, KeyRound } from 'lucide-react';

type U=User&{active?:boolean;initial_pin?:string};
const empty:U={user_id:'',nim:'',name:'',email:'',role:'mahasiswa',class_name:'',active:true};
export default function AdminUsers(){
  const[rows,setRows]=useState<U[]>([]);const[u,setU]=useState<U>(empty);const[msg,setMsg]=useState('');
  const load=()=>api<U[]>('adminListUsers').then(setRows);
  useEffect(()=>{load().catch(e=>setMsg(e.message));},[]);
  const save=async()=>{try{const d=await api<{user:U;temporary_pin?:string}>('adminSaveUser',{user:u});setU(d.user);setMsg(d.temporary_pin?`Pengguna tersimpan. PIN sementara: ${d.temporary_pin}`:'Pengguna tersimpan.');await load()}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  const reset=async()=>{if(!u.user_id)return;const pin=prompt('PIN baru (minimal 6 karakter). Kosongkan untuk PIN acak:','');try{const d=await api<{pin:string}>('adminResetPin',{user_id:u.user_id,pin:pin||''});setMsg(`PIN baru: ${d.pin}`)}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  return <AuthGate adminOnly><AppShell title="Pengguna"><div className="admin-split">
    <GlassCard className="admin-list"><div className="row between"><div><span className="eyebrow">AKUN</span><h3>{rows.length} Pengguna</h3></div><button className="icon-button" onClick={()=>setU({...empty})}><Plus/></button></div><input className="list-search" placeholder="Cari nama/NIM..." onChange={e=>{const q=e.target.value.toLowerCase();document.querySelectorAll<HTMLElement>('[data-user-row]').forEach(el=>el.hidden=!el.dataset.userRow?.includes(q))}}/><div className="scroll-list">{rows.map(x=><button data-user-row={`${x.name} ${x.nim} ${x.email}`.toLowerCase()} key={x.user_id} className={u.user_id===x.user_id?'select-row active':'select-row'} onClick={()=>setU(x)}><strong>{x.name}</strong><small>{x.nim} • {x.role}</small></button>)}</div></GlassCard>
    <GlassCard><div className="form-grid two"><label className="field"><span>NIM / ID</span><input value={u.nim} onChange={e=>setU({...u,nim:e.target.value})}/></label><label className="field"><span>Nama</span><input value={u.name} onChange={e=>setU({...u,name:e.target.value})}/></label><label className="field"><span>Email</span><input type="email" value={u.email} onChange={e=>setU({...u,email:e.target.value})}/></label><label className="field"><span>Kelas</span><input value={u.class_name||''} onChange={e=>setU({...u,class_name:e.target.value})}/></label><label className="field"><span>Role</span><select value={u.role} onChange={e=>setU({...u,role:e.target.value as U['role']})}><option value="mahasiswa">Mahasiswa</option><option value="dosen">Dosen</option><option value="admin">Admin</option></select></label>{!u.user_id&&<label className="field"><span>PIN awal (opsional)</span><input value={u.initial_pin||''} onChange={e=>setU({...u,initial_pin:e.target.value})} placeholder="Kosong = dibuat otomatis"/></label>}</div><label className="switch-row"><input type="checkbox" checked={u.active!==false} onChange={e=>setU({...u,active:e.target.checked})}/>Akun aktif</label><div className="row between">{u.user_id?<button className="button soft" onClick={reset}><KeyRound/>Reset PIN</button>:<span/>}<button className="button primary" onClick={save}><Save/>Simpan Pengguna</button></div></GlassCard>
  </div>{msg&&<div className="notice selectable">{msg}</div>}</AppShell></AuthGate>
}
