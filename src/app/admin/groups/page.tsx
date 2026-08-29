'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';
import {
  Plus, Save, Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2,
  Crown, UsersRound, FolderKanban
} from 'lucide-react';

type Member={user_id:string;nim:string;name:string;role:'leader'|'member'};
type Group={group_id?:string;project_code:string;name:string;member_ids:string[];leader_id?:string;members?:Member[]};
type ImportRow={group_name:string;nim:string;role:'LEADER'|'MEMBER'|string};
type ImportReport={project_code:string;groups:number;members:number;created_groups:number;reused_groups:number;warnings:string[]};

const PROJECTS=[
  ['WEBSITE','Website'],['PWA','PWA'],['AUDIO','Media Audio'],['VISUAL','Media Visual'],['AUDIOVISUAL','Media Audiovisual']
] as const;
const empty=(project='WEBSITE'):Group=>({project_code:project,name:'',member_ids:[],leader_id:''});
const text=(v:unknown)=>String(v??'').trim();
function normalizeImport(raw:Record<string,unknown>):ImportRow{
  const low:Record<string,unknown>={};Object.keys(raw).forEach(k=>{low[k.trim().toLowerCase()]=raw[k]});
  return {group_name:text(low.group_name||low.group||low.kelompok||low['nama kelompok']),nim:text(low.nim||low.id),role:text(low.role||low.peran||'MEMBER').toUpperCase()};
}

export default function AdminGroups(){
  const[groups,setGroups]=useState<Group[]>([]);const[users,setUsers]=useState<User[]>([]);const[project,setProject]=useState('WEBSITE');const[g,setG]=useState<Group>(empty());const[msg,setMsg]=useState('');
  const[importRows,setImportRows]=useState<ImportRow[]>([]);const[importName,setImportName]=useState('');const[importBusy,setImportBusy]=useState(false);const[report,setReport]=useState<ImportReport|null>(null);
  const load=async()=>{const [a,b]=await Promise.all([api<Group[]>('adminListGroups'),api<User[]>('adminListUsers')]);setGroups(a);setUsers(b.filter(x=>x.role==='mahasiswa'))};
  useEffect(()=>{load().catch(e=>setMsg(e.message));},[]);

  const projectGroups=useMemo(()=>groups.filter(x=>x.project_code===project),[groups,project]);
  const userByNim=useMemo(()=>{const m=new Map<string,User>();users.forEach(u=>m.set(u.nim.trim().toLowerCase(),u));return m},[users]);
  const assignedElsewhere=useMemo(()=>{const m=new Map<string,string>();projectGroups.forEach(x=>{if(x.group_id!==g.group_id)x.member_ids.forEach(uid=>m.set(uid,x.name));});return m},[projectGroups,g.group_id]);

  const selectProject=(code:string)=>{setProject(code);setG(empty(code));setImportRows([]);setImportName('');setReport(null);setMsg('')};
  const save=async()=>{try{if(g.member_ids.length&&!g.leader_id)throw new Error('Pilih satu ketua kelompok.');const d=await api<{group:Group}>('adminSaveGroup',{group:g});setG(d.group);setMsg('Kelompok tersimpan.');await load()}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  const toggle=(id:string)=>setG(x=>{const selected=x.member_ids.includes(id);const member_ids=selected?x.member_ids.filter(v=>v!==id):[...x.member_ids,id];let leader_id=x.leader_id||'';if(selected&&leader_id===id)leader_id='';if(!selected&&!leader_id)leader_id=id;return {...x,member_ids,leader_id}});

  const readExcel=async(file:File|null)=>{
    if(!file)return;setMsg('');setReport(null);setImportRows([]);setImportName(file.name);
    try{const XLSX=await import('xlsx');const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});const sheet=wb.Sheets[wb.SheetNames[0]];if(!sheet)throw new Error('Sheet pertama tidak ditemukan.');const raw=XLSX.utils.sheet_to_json<Record<string,unknown>>(sheet,{defval:'',raw:false});const rows=raw.map(normalizeImport).filter(x=>x.group_name||x.nim);if(!rows.length)throw new Error('Tidak ada data kelompok yang terbaca. Gunakan template.');if(rows.length>500)throw new Error('Maksimal 500 baris anggota.');setImportRows(rows);}catch(e){setMsg(e instanceof Error?e.message:String(e));setImportName('')}
  };

  const importErrors=useMemo(()=>{
    const errors:string[]=[],seen=new Set<string>(),leaderCount=new Map<string,number>();
    importRows.forEach((r,i)=>{const row=i+2,key=r.nim.toLowerCase(),gk=r.group_name.toLowerCase();if(!r.group_name)errors.push(`Baris ${row}: nama kelompok kosong.`);if(!r.nim)errors.push(`Baris ${row}: NIM kosong.`);if(r.nim&&!userByNim.has(key))errors.push(`Baris ${row}: NIM ${r.nim} tidak ditemukan.`);if(key&&seen.has(key))errors.push(`Baris ${row}: NIM ${r.nim} muncul lebih dari sekali.`);if(key)seen.add(key);if(!['LEADER','MEMBER'].includes(r.role))errors.push(`Baris ${row}: role harus LEADER/MEMBER.`);if(gk&&r.role==='LEADER')leaderCount.set(gk,(leaderCount.get(gk)||0)+1);});
    [...new Set(importRows.map(r=>r.group_name).filter(Boolean))].forEach(name=>{const count=leaderCount.get(name.toLowerCase())||0;if(count!==1)errors.push(`${name}: harus memiliki tepat satu LEADER (saat ini ${count}).`)});return errors;
  },[importRows,userByNim]);
  const importGroupCount=useMemo(()=>new Set(importRows.map(x=>x.group_name.toLowerCase()).filter(Boolean)).size,[importRows]);

  const runImport=async()=>{if(!importRows.length||importErrors.length)return;setImportBusy(true);setMsg('');setReport(null);try{const r=await api<ImportReport>('adminImportGroups',{project_code:project,rows:importRows});setReport(r);setMsg(`Import selesai: ${r.groups} kelompok, ${r.members} anggota.`);setImportRows([]);setImportName('');await load();}catch(e){setMsg(e instanceof Error?e.message:String(e))}finally{setImportBusy(false)}};
  const exportGroups=async()=>{
    const rows=projectGroups.flatMap(x=>(x.members||[]).map(m=>({group_name:x.name,nim:m.nim,role:m.user_id===x.leader_id?'LEADER':'MEMBER'})));
    if(!rows.length){setMsg('Belum ada kelompok pada proyek ini untuk diekspor.');return;}
    const XLSX=await import('xlsx');const ws=XLSX.utils.json_to_sheet(rows,{header:['group_name','nim','role']});const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,project);XLSX.writeFile(wb,`Kelompok_${project}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return <AuthGate adminOnly><AppShell title="Kelompok"><div className="stack">
    <GlassCard><div className="row between wrap gap"><div><span className="eyebrow">5 PROYEK</span><h2>Kelompok Proyek</h2><p className="muted">Kelompok dapat berbeda pada Website, PWA, Audio, Visual, dan Audiovisual. Satu mahasiswa hanya boleh berada pada satu kelompok untuk proyek yang sama.</p></div><UsersRound size={32}/></div>
      <div className="project-tabs">{PROJECTS.map(([code,label])=><button key={code} className={project===code?'project-tab active':'project-tab'} onClick={()=>selectProject(code)}><FolderKanban/>{label}</button>)}</div>
    </GlassCard>

    <GlassCard><div className="row between wrap gap"><div><span className="eyebrow">IMPORT EXCEL • {project}</span><h3>Import Pembagian Kelompok</h3><p className="muted">Pilih proyek di atas, lalu import satu baris per anggota. Setiap kelompok wajib memiliki tepat satu <strong>LEADER</strong>. Ketua inilah yang mengirim perencanaan dan laporan akhir kelompok.</p></div><div className="row wrap gap"><a className="button soft" href="/templates/import-groups.xlsx" download><Download/>Template</a><button className="button soft" onClick={exportGroups}><Download/>Export {project}</button><label className="button primary"><Upload/>Pilih Excel<input className="hidden" type="file" accept=".xlsx,.xls" onChange={e=>readExcel(e.target.files?.[0]||null)}/></label></div></div>
      {importRows.length>0&&<div className="stack small-gap"><div className="notice"><div className="row wrap gap"><FileSpreadsheet/><strong>{importName}</strong><span className="badge">{importGroupCount} kelompok</span><span className="badge">{importRows.length} anggota</span>{importErrors.length===0?<span className="badge success"><CheckCircle2/>Siap import</span>:<span className="badge danger"><AlertTriangle/>{importErrors.length} masalah</span>}</div></div>
        <div className="group-import-preview">{[...new Set(importRows.map(x=>x.group_name).filter(Boolean))].slice(0,8).map(name=><div className="group-preview-card" key={name}><strong>{name}</strong>{importRows.filter(x=>x.group_name===name).map((x,i)=><small key={`${x.nim}-${i}`}><span className={x.role==='LEADER'?'mini-role leader':'mini-role'}>{x.role==='LEADER'?'Ketua':'Anggota'}</span>{x.nim} • {userByNim.get(x.nim.toLowerCase())?.name||'NIM tidak ditemukan'}</small>)}</div>)}</div>
        {importErrors.length>0&&<div className="error-box selectable">{importErrors.slice(0,12).map((x,i)=><div key={i}>{x}</div>)}{importErrors.length>12&&<div>+ {importErrors.length-12} masalah lain</div>}</div>}
        <div className="right-actions"><button className="button primary" disabled={importBusy||importErrors.length>0} onClick={runImport}><FileSpreadsheet/>{importBusy?'Mengimpor...':`Import ${importGroupCount} Kelompok`}</button></div>
      </div>}
      {report&&<div className="notice"><strong>Import {report.project_code} selesai.</strong> {report.created_groups} kelompok baru, {report.reused_groups} kelompok diperbarui, {report.members} anggota.{report.warnings.map((w,i)=><div key={i}><AlertTriangle size={14}/> {w}</div>)}</div>}
    </GlassCard>

    <div className="admin-split">
      <GlassCard className="admin-list"><div className="row between"><div><span className="eyebrow">{project}</span><h3>{projectGroups.length} Kelompok</h3></div><button className="icon-button" onClick={()=>setG(empty(project))}><Plus/></button></div><div className="scroll-list">{projectGroups.map(x=><button key={x.group_id} className={g.group_id===x.group_id?'select-row active':'select-row'} onClick={()=>setG({...x,leader_id:x.leader_id||x.member_ids[0]||''})}><strong>{x.name}</strong><small>{x.member_ids.length} anggota • Ketua: {(x.members||[]).find(m=>m.user_id===x.leader_id)?.name||'belum ditentukan'}</small></button>)}</div></GlassCard>
      <GlassCard><div className="form-grid two"><label className="field"><span>Nama kelompok</span><input value={g.name} onChange={e=>setG({...g,name:e.target.value})}/></label><label className="field"><span>Proyek</span><input value={project} disabled/></label></div>
        <div className="field"><span>Anggota</span><div className="member-grid">{users.map(u=>{const other=assignedElsewhere.get(u.user_id),selected=g.member_ids.includes(u.user_id);return <button type="button" disabled={!!other&&!selected} title={other?`Sudah berada di ${other}`:''} key={u.user_id} className={selected?'member-chip selected':'member-chip'} onClick={()=>toggle(u.user_id)}><span className="avatar small">{u.name[0]}</span><span className="grow"><strong>{u.name}</strong><small>{u.nim}{other?` • ${other}`:''}</small></span>{g.leader_id===u.user_id&&<Crown className="leader-crown"/>}</button>})}</div></div>
        {g.member_ids.length>0&&<label className="field"><span>Ketua kelompok</span><select value={g.leader_id||''} onChange={e=>setG({...g,leader_id:e.target.value})}><option value="">Pilih ketua</option>{g.member_ids.map(uid=>{const u=users.find(x=>x.user_id===uid);return <option value={uid} key={uid}>{u?.name||uid} — {u?.nim||''}</option>})}</select><small>Hanya ketua yang dapat mengubah/mengirim perencanaan dan laporan akhir. Anggota lain dapat melihat.</small></label>}
        <div className="right-actions"><button className="button primary" onClick={save}><Save/>Simpan Kelompok</button></div>
      </GlassCard>
    </div>{msg&&<div className="notice selectable">{msg}</div>}
  </div></AppShell></AuthGate>
}
