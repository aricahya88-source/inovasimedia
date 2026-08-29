'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { ProjectPlan } from '@/lib/types';
import { projectByCode } from '@/lib/projectThemes';
import RichTextEditor from './RichTextEditor';
import GlassCard from './GlassCard';
import RichHtml from './RichHtml';
import Link from 'next/link';
import { CheckCircle2, Save, Send, BookOpenCheck, UsersRound, Crown, Eye, LockKeyhole } from 'lucide-react';

type GroupMember={user_id:string;nim:string;name:string;role:'leader'|'member'};
type PlanContext={
  plan:ProjectPlan|null;
  group?:{group_id:string;name:string;project_code:string}|null;
  group_members?:GroupMember[];
  membership_role?:string;
  can_edit?:boolean;
  is_group?:boolean;
  leader_id?:string;
};

const EMPTY = (code:string):ProjectPlan => ({
  project_code:code,title:'',theme_code:'',topic:'',maharah_json:'[]',
  target_users_html:'',problem_html:'',objectives_html:'',features_html:'',
  flow_html:'',technology_html:'',test_plan_html:'',team_html:'',detail_json:'{}'
});

const maharah=['Istimāʿ','Kalām','Qirāʾah','Kitābah','Mufradāt','Qawāʿid','Terpadu'];

export default function ProjectPlanForm({code}:{code:string}) {
  const def=projectByCode(code);
  const [plan,setPlan]=useState<ProjectPlan>(EMPTY(code));
  const [detail,setDetail]=useState<Record<string,string>>({});
  const [ctx,setCtx]=useState<PlanContext>({plan:null,can_edit:true,is_group:false,group_members:[]});
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const selected=useMemo(()=>def?.themes.find(t=>t.code===plan.theme_code),[def,plan.theme_code]);

  const load=()=>api<PlanContext>('getProjectPlan',{project_code:code}).then(d=>{
    setCtx(d);
    if(d.plan) {
      setPlan(d.plan);
      try { setDetail(JSON.parse(d.plan.detail_json||'{}')); } catch { setDetail({}); }
    } else { setPlan(EMPTY(code));setDetail({}); }
  });
  useEffect(()=>{load().catch(e=>setMessage(e instanceof Error?e.message:String(e)));},[code]);

  if(!def) return <GlassCard>Jenis proyek tidak ditemukan.</GlassCard>;
  const chosen:string[]=(()=>{try{return JSON.parse(plan.maharah_json||'[]')}catch{return[]}})();
  const set=(key:keyof ProjectPlan,val:string)=>setPlan(p=>({...p,[key]:val}));
  const toggleMaharah=(m:string)=>{const next=chosen.includes(m)?chosen.filter(x=>x!==m):[...chosen,m];set('maharah_json',JSON.stringify(next));};
  const status=plan.status||'DRAFT';
  const locked=['APPROVED','IN_PRODUCTION','DONE'].includes(status);
  const editable=ctx.can_edit!==false&&!locked;

  const save=async(submit=false)=>{
    setBusy(true);setMessage('');
    try {
      const payload={...plan,detail_json:JSON.stringify(detail)};
      const d=await api<{plan:ProjectPlan}>('saveProjectPlan',{plan:payload,submit});
      setPlan(d.plan); setMessage(submit?(ctx.is_group?'Perencanaan kelompok diajukan ke dosen.':'Perencanaan diajukan ke dosen.'):'Draft tersimpan.');
      await load();
    } catch(e){setMessage(e instanceof Error?e.message:String(e));}
    finally{setBusy(false);}
  };

  const richField=(key:keyof ProjectPlan,label:string)=>
    <GlassCard key={String(key)}><label className="field"><span>{label} *</span>{editable?<RichTextEditor value={String(plan[key]||'')} onChange={v=>set(key,v)} minHeight={150}/>:<div className="readonly-rich"><RichHtml html={String(plan[key]||'<p>Belum diisi.</p>')}/></div>}</label></GlassCard>;

  return <div className="stack">
    <GlassCard className="project-hero">
      <div><span className="eyebrow">PERENCANAAN PROYEK</span><h2>{def.name}</h2><p className="muted">Pilih tema, susun perencanaan, ajukan, lalu revisi berdasarkan feedback dosen.</p></div>
      <div className="row wrap gap"><span className="badge">{status}</span><Link className="button soft" href={`/guides/${code.toLowerCase()}`}><BookOpenCheck size={17}/>Panduan tema</Link></div>
    </GlassCard>

    {ctx.is_group&&ctx.group&&<GlassCard className="group-project-context"><div className="row between wrap gap"><div className="row gap"><div className="icon-bubble"><UsersRound/></div><div><span className="eyebrow">PROYEK KELOMPOK</span><h3>{ctx.group.name}</h3><p className="muted">Satu perencanaan digunakan bersama seluruh anggota kelompok.</p></div></div>{ctx.can_edit?<span className="badge success"><Crown/>Anda ketua • dapat mengedit</span>:<span className="badge"><Eye/>Mode lihat • ketua yang mengirim</span>}</div><div className="group-member-strip">{(ctx.group_members||[]).map(m=><div className={m.role==='leader'?'group-member-card leader':'group-member-card'} key={m.user_id}>{m.role==='leader'?<Crown/>:<span className="avatar small">{m.name.slice(0,1)}</span>}<span><strong>{m.name}</strong><small>{m.nim} • {m.role==='leader'?'Ketua':'Anggota'}</small></span></div>)}</div>{ctx.can_edit===false&&<div className="notice"><LockKeyhole size={16}/> Perencanaan dapat dibaca semua anggota, tetapi hanya ketua kelompok yang dapat menyimpan atau mengajukannya.</div>}</GlassCard>}

    {plan.lecturer_feedback_html && <GlassCard><span className="eyebrow">FEEDBACK DOSEN</span><RichHtml html={plan.lecturer_feedback_html}/></GlassCard>}

    <GlassCard>
      <div className="form-grid two">
        <label className="field"><span>Judul proyek *</span><input disabled={!editable} value={plan.title} onChange={e=>set('title',e.target.value)} placeholder={`Contoh judul ${def.name}`}/></label>
        <label className="field"><span>Topik / Materi Bahasa Arab *</span><input disabled={!editable} value={plan.topic} onChange={e=>set('topic',e.target.value)} placeholder="Topik/materi utama"/></label>
      </div>
      <div className="field"><span>Tema proyek *</span><div className="theme-grid">{def.themes.map(t=><button type="button" disabled={!editable} key={t.code} className={plan.theme_code===t.code?'theme-card selected':'theme-card'} onClick={()=>set('theme_code',t.code)}><strong>{t.name}</strong><small>{t.description}</small>{plan.theme_code===t.code&&<CheckCircle2/>}</button>)}</div></div>
      <div className="field"><span>Mahārah / fokus materi *</span><div className="chip-list">{maharah.map(m=><button type="button" disabled={!editable} className={chosen.includes(m)?'chip selected':'chip'} onClick={()=>toggleMaharah(m)} key={m}>{m}</button>)}</div></div>
    </GlassCard>

    {richField('problem_html','Masalah / kebutuhan pembelajaran')}
    {richField('target_users_html','Target pengguna & karakteristiknya')}
    {richField('objectives_html','Tujuan pembelajaran')}
    {richField('features_html','Fitur / komponen utama')}
    {richField('flow_html','Alur pengguna / alur belajar')}
    {richField('technology_html','Teknologi dan tools yang digunakan')}
    {richField('test_plan_html','Rencana uji & indikator keberhasilan')}

    {ctx.is_group && <GlassCard><label className="field"><span>Pembagian tugas kelompok</span>{editable?<RichTextEditor value={plan.team_html} onChange={v=>set('team_html',v)} minHeight={160}/>:<div className="readonly-rich"><RichHtml html={plan.team_html||'<p>Belum diisi.</p>'}/></div>}</label></GlassCard>}

    {selected && <GlassCard><span className="eyebrow">PERENCANAAN KHUSUS TEMA</span><h3>{selected.name}</h3><div className="stack">{selected.fields.map(f=><label className="field" key={f.key}><span>{f.label}</span>{editable?<RichTextEditor value={detail[f.key]||''} onChange={v=>setDetail(d=>({...d,[f.key]:v}))} minHeight={110}/>:<div className="readonly-rich"><RichHtml html={detail[f.key]||'<p>Belum diisi.</p>'}/></div>}{f.hint&&<small>{f.hint}</small>}</label>)}</div></GlassCard>}

    {message&&<div className="notice selectable">{message}</div>}
    {ctx.can_edit!==false&&<div className="sticky-actions"><button className="button soft" disabled={busy||!editable} onClick={()=>save(false)}><Save/>Simpan Draft</button><button className="button primary" disabled={busy||!editable||!plan.title||!plan.theme_code} onClick={()=>save(true)}><Send/>Ajukan Perencanaan</button></div>}
  </div>;
}
