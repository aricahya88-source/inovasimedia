'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichHtml from '@/components/RichHtml';
import RichTextEditor from '@/components/RichTextEditor';
import { api } from '@/lib/api';
import type { ProjectPlan } from '@/lib/types';
import { Save } from 'lucide-react';

type Row=ProjectPlan&{owner_name?:string;owner_nim?:string;group_name?:string};
export default function AdminProjects(){
  const[rows,setRows]=useState<Row[]>([]);const[p,setP]=useState<Row|null>(null);const[feedback,setFeedback]=useState('');const[status,setStatus]=useState('UNDER_REVIEW');const[msg,setMsg]=useState('');
  const load=()=>api<Row[]>('adminListProjectPlans').then(setRows);
  useEffect(()=>{load().catch(e=>setMsg(e.message));},[]);
  const open=(x:Row)=>{setP(x);setFeedback(x.lecturer_feedback_html||'');setStatus(x.status||'UNDER_REVIEW')};
  const review=async()=>{if(!p)return;try{await api('adminReviewProjectPlan',{plan_id:p.plan_id,status,feedback_html:feedback});setMsg('Review tersimpan.');await load()}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  return <AuthGate adminOnly><AppShell title="Kelola Proyek"><div className="admin-split">
    <GlassCard className="admin-list"><span className="eyebrow">PERENCANAAN</span><h3>{rows.length} Proposal</h3><div className="scroll-list">{rows.map(x=><button key={x.plan_id} className={p?.plan_id===x.plan_id?'select-row active':'select-row'} onClick={()=>open(x)}><strong>{x.title||'(Belum berjudul)'}</strong><small>{x.project_code} • {x.owner_name||x.group_name} • {x.status}</small></button>)}</div></GlassCard>
    <div className="stack">{p&&<>
      <GlassCard><span className="eyebrow">{p.project_code} • {p.status}</span><h2>{p.title}</h2><p><strong>Pemilik:</strong> {p.owner_name||p.group_name} {p.owner_nim?`(${p.owner_nim})`:''}</p><p><strong>Tema:</strong> {p.theme_code} • <strong>Topik:</strong> {p.topic}</p></GlassCard>
      {[
        ['Masalah / kebutuhan',p.problem_html],['Target pengguna',p.target_users_html],['Tujuan',p.objectives_html],
        ['Fitur utama',p.features_html],['Alur',p.flow_html],['Teknologi',p.technology_html],['Rencana uji',p.test_plan_html],['Pembagian tugas',p.team_html]
      ].filter(x=>x[1]).map(([label,val])=><GlassCard key={label}><span className="eyebrow">{label}</span><RichHtml html={String(val)}/></GlassCard>)}
      <GlassCard><div className="form-grid two"><label className="field"><span>Status</span><select value={status} onChange={e=>setStatus(e.target.value)}><option value="UNDER_REVIEW">Direview</option><option value="NEEDS_REVISION">Perlu Revisi</option><option value="APPROVED">Disetujui</option><option value="IN_PRODUCTION">Dalam Produksi</option><option value="DONE">Selesai</option></select></label></div><label className="field"><span>Feedback dosen</span><RichTextEditor value={feedback} onChange={setFeedback} minHeight={220}/></label><div className="right-actions"><button className="button primary" onClick={review}><Save/>Simpan Review</button></div></GlassCard>
    </>}</div>
  </div>{msg&&<div className="notice">{msg}</div>}</AppShell></AuthGate>
}
