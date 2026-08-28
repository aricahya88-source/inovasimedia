'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { ProjectPlan } from '@/lib/types';
import { projectByCode } from '@/lib/projectThemes';
import RichTextEditor from './RichTextEditor';
import GlassCard from './GlassCard';
import RichHtml from './RichHtml';
import Link from 'next/link';
import { CheckCircle2, Save, Send, BookOpenCheck } from 'lucide-react';

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
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const selected=useMemo(()=>def?.themes.find(t=>t.code===plan.theme_code),[def,plan.theme_code]);

  useEffect(()=>{
    api<{plan:ProjectPlan|null}>('getProjectPlan',{project_code:code}).then(d=>{
      if(d.plan) {
        setPlan(d.plan);
        try { setDetail(JSON.parse(d.plan.detail_json||'{}')); } catch {}
      }
    }).catch(()=>{});
  },[code]);

  if(!def) return <GlassCard>Jenis proyek tidak ditemukan.</GlassCard>;
  const chosen:string[]=(()=>{try{return JSON.parse(plan.maharah_json||'[]')}catch{return[]}})();

  const set=(key:keyof ProjectPlan,val:string)=>setPlan(p=>({...p,[key]:val}));
  const toggleMaharah=(m:string)=>{
    const next=chosen.includes(m)?chosen.filter(x=>x!==m):[...chosen,m];
    set('maharah_json',JSON.stringify(next));
  };
  const save=async(submit=false)=>{
    setBusy(true);setMessage('');
    try {
      const payload={...plan,detail_json:JSON.stringify(detail)};
      const d=await api<{plan:ProjectPlan}>('saveProjectPlan',{plan:payload,submit});
      setPlan(d.plan); setMessage(submit?'Perencanaan diajukan ke dosen.':'Draft tersimpan.');
    } catch(e){setMessage(e instanceof Error?e.message:String(e));}
    finally{setBusy(false);}
  };
  const status=plan.status||'DRAFT';
  const editable=!['APPROVED','IN_PRODUCTION','DONE'].includes(status);

  return <div className="stack">
    <GlassCard className="project-hero">
      <div><span className="eyebrow">PERENCANAAN PROYEK</span><h2>{def.name}</h2><p className="muted">Pilih satu dari lima tema, susun perencanaan, ajukan, lalu revisi berdasarkan feedback dosen.</p></div>
      <div className="row wrap gap"><span className="badge">{status}</span><Link className="button soft" href={`/guides/${code.toLowerCase()}`}><BookOpenCheck size={17}/>Panduan tema</Link></div>
    </GlassCard>

    {plan.lecturer_feedback_html && <GlassCard><span className="eyebrow">FEEDBACK DOSEN</span><RichHtml html={plan.lecturer_feedback_html}/></GlassCard>}

    <GlassCard>
      <div className="form-grid two">
        <label className="field"><span>Judul proyek *</span><input disabled={!editable} value={plan.title} onChange={e=>set('title',e.target.value)} placeholder={`Contoh judul ${def.name}`}/></label>
        <label className="field"><span>Topik / Materi Bahasa Arab *</span><input disabled={!editable} value={plan.topic} onChange={e=>set('topic',e.target.value)} placeholder="Topik/materi utama"/></label>
      </div>
      <div className="field"><span>Tema proyek *</span>
        <div className="theme-grid">{def.themes.map(t=><button type="button" disabled={!editable} key={t.code} className={plan.theme_code===t.code?'theme-card selected':'theme-card'} onClick={()=>set('theme_code',t.code)}>
          <strong>{t.name}</strong><small>{t.description}</small>{plan.theme_code===t.code&&<CheckCircle2/>}
        </button>)}</div>
      </div>
      <div className="field"><span>Mahārah / fokus materi *</span><div className="chip-list">{maharah.map(m=><button type="button" disabled={!editable} className={chosen.includes(m)?'chip selected':'chip'} onClick={()=>toggleMaharah(m)} key={m}>{m}</button>)}</div></div>
    </GlassCard>

    {[
      ['problem_html','Masalah / kebutuhan pembelajaran'],
      ['target_users_html','Target pengguna & karakteristiknya'],
      ['objectives_html','Tujuan pembelajaran'],
      ['features_html','Fitur / komponen utama'],
      ['flow_html','Alur pengguna / alur belajar'],
      ['technology_html','Teknologi dan tools yang digunakan'],
      ['test_plan_html','Rencana uji & indikator keberhasilan']
    ].map(([key,label])=><GlassCard key={key}><label className="field"><span>{label} *</span><RichTextEditor value={String(plan[key as keyof ProjectPlan]||'')} onChange={v=>set(key as keyof ProjectPlan,v)} minHeight={150}/></label></GlassCard>)}

    {def.group && <GlassCard><label className="field"><span>Pembagian tugas kelompok</span><RichTextEditor value={plan.team_html} onChange={v=>set('team_html',v)} minHeight={160}/></label></GlassCard>}

    {selected && <GlassCard>
      <span className="eyebrow">PERENCANAAN KHUSUS TEMA</span><h3>{selected.name}</h3>
      <div className="stack">{selected.fields.map(f=><label className="field" key={f.key}><span>{f.label}</span><RichTextEditor value={detail[f.key]||''} onChange={v=>setDetail(d=>({...d,[f.key]:v}))} minHeight={110}/>{f.hint&&<small>{f.hint}</small>}</label>)}</div>
    </GlassCard>}

    {message&&<div className="notice">{message}</div>}
    <div className="sticky-actions">
      <button className="button soft" disabled={busy||!editable} onClick={()=>save(false)}><Save/>Simpan Draft</button>
      <button className="button primary" disabled={busy||!editable||!plan.title||!plan.theme_code} onClick={()=>save(true)}><Send/>Ajukan Perencanaan</button>
    </div>
  </div>;
}
