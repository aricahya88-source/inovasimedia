'use client';
import { useEffect, useState } from 'react';
import { api, fileToBase64 } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import GlassCard from './GlassCard';
import RichHtml from './RichHtml';
import RichTextEditor from './RichTextEditor';
import { ExternalLink, FileCheck2, Upload, UsersRound, Crown, Eye, RefreshCw } from 'lucide-react';

type GroupMember={user_id:string;nim:string;name:string;role:'leader'|'member'};
type Report={submission_id:string;version:number;content_html:string;link_url:string;file_name:string;file_url:string;submitted_at:string};
type ReportData={
  activity:{activity_id:string;title:string;max_score:number};
  report:Report|null;
  comments:Array<{comment_id:string;content_html:string;created_at:string;author?:{name:string}}>;
  grade?:{score:number;max_score:number;feedback_html:string}|null;
  group?:{group_id:string;name:string}|null;
  group_members?:GroupMember[];
  can_edit:boolean;
  is_group:boolean;
  membership_role:string;
};

export default function ProjectFinalReport({code}:{code:string}){
  const[d,setD]=useState<ReportData|null>(null);const[content,setContent]=useState('');const[link,setLink]=useState('');const[file,setFile]=useState<File|null>(null);const[busy,setBusy]=useState(false);const[msg,setMsg]=useState('');
  const load=()=>api<ReportData>('getProjectFinalReport',{project_code:code}).then(setD).catch(e=>setMsg(e instanceof Error?e.message:String(e)));
  useEffect(()=>{load();},[code]);
  const submit=async()=>{
    if(!d?.can_edit)return;setBusy(true);setMsg('');
    try{let file_base64='',file_name='',file_mime='';if(file){if(file.size>3*1024*1024)throw new Error('File kecil maksimal 3 MB. Untuk video/audio besar gunakan tautan Drive/YouTube.');file_base64=await fileToBase64(file);file_name=file.name;file_mime=file.type;}
      await api('saveProjectFinalReport',{project_code:code,content_html:content,link_url:link,file_base64,file_name,file_mime});setContent('');setLink('');setFile(null);setMsg(d.is_group?'Laporan akhir kelompok berhasil dikirim.':'Laporan akhir berhasil dikirim.');await load();
    }catch(e){setMsg(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  };

  return <div className="stack project-final-section">
    <GlassCard className="final-report-hero"><div className="row between wrap gap"><div className="row gap"><div className="icon-bubble coral"><FileCheck2/></div><div><span className="eyebrow">TAHAP FINAL</span><h2>Laporan Hasil Akhir</h2><p className="muted">Ringkas hasil pengembangan, tautkan produk final, jelaskan pengujian/revisi, dan sertakan bukti bila diperlukan.</p></div></div>{d?.is_group?<span className="badge"><UsersRound/>{d.group?.name||'Kelompok'}</span>:<span className="badge">Individu</span>}</div></GlassCard>

    {d?.is_group&&<GlassCard><div className="row between wrap gap"><div><span className="eyebrow">SATU LAPORAN PER KELOMPOK</span><h3>{d.group?.name}</h3><p className="muted">Laporan yang dikirim ketua otomatis menjadi laporan bersama seluruh anggota dan dapat dilihat oleh semua anggota.</p></div>{d.can_edit?<span className="badge success"><Crown/>Anda ketua • dapat mengirim</span>:<span className="badge"><Eye/>Anda anggota • mode lihat</span>}</div><div className="group-member-strip">{(d.group_members||[]).map(m=><div key={m.user_id} className={m.role==='leader'?'group-member-card leader':'group-member-card'}>{m.role==='leader'?<Crown/>:<span className="avatar small">{m.name.slice(0,1)}</span>}<span><strong>{m.name}</strong><small>{m.nim} • {m.role==='leader'?'Ketua':'Anggota'}</small></span></div>)}</div></GlassCard>}

    {d?.grade&&<GlassCard className="grade-highlight"><div><span className="eyebrow">NILAI PROYEK</span><h2>{d.grade.score} / {d.grade.max_score}</h2></div><RichHtml html={d.grade.feedback_html||'<p>Belum ada feedback tertulis.</p>'}/></GlassCard>}

    {d?.report&&<GlassCard><div className="row between wrap gap"><div><span className="eyebrow">LAPORAN TERAKHIR • VERSI {d.report.version}</span><h3>Submission Final</h3></div><span className="badge"><FileCheck2/>{formatDate(d.report.submitted_at)}</span></div><RichHtml html={d.report.content_html||'<p>Tidak ada narasi.</p>'}/><div className="row wrap gap">{d.report.link_url&&<a className="button soft compact" target="_blank" rel="noreferrer" href={d.report.link_url}><ExternalLink/>Buka produk final</a>}{d.report.file_url&&<a className="button soft compact" target="_blank" rel="noreferrer" href={d.report.file_url}><ExternalLink/>{d.report.file_name||'Buka lampiran'}</a>}</div></GlassCard>}

    {d?.can_edit&&<GlassCard><div className="row between wrap gap"><div><span className="eyebrow">{d.report?'KIRIM REVISI LAPORAN':'KUMPULKAN LAPORAN'}</span><h3>{d.is_group?'Ketua mengirim untuk kelompok':'Laporan hasil akhir proyek'}</h3></div>{d.report&&<span className="badge"><RefreshCw/>Versi baru</span>}</div><label className="field"><span>Ringkasan hasil, pengujian, revisi, dan refleksi produk</span><RichTextEditor value={content} onChange={setContent} minHeight={190}/></label><div className="form-grid two"><label className="field"><span>URL produk final / Drive / GitHub / YouTube</span><input value={link} onChange={e=>setLink(e.target.value)} placeholder="https://..."/></label><label className="field"><span>Lampiran kecil (maks. 3 MB)</span><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}/><small>Untuk audio/video besar gunakan URL agar LMS tetap ringan.</small></label></div><div className="right-actions"><button className="button primary" disabled={busy} onClick={submit}><Upload/>{busy?'Mengirim...':d.is_group?'Kirim untuk Kelompok':'Kirim Laporan'}</button></div></GlassCard>}

    {d&&!d.can_edit&&!d.report&&<div className="notice">Ketua kelompok belum mengirim laporan hasil akhir. Setelah dikirim, laporan akan otomatis tampil di sini untuk seluruh anggota.</div>}
    {d?.comments?.length?<div className="stack small-gap"><div className="section-title"><h3>Komentar Dosen</h3></div>{d.comments.map(c=><GlassCard key={c.comment_id}><strong>{c.author?.name||'Dosen'}</strong><RichHtml html={c.content_html}/><small>{formatDate(c.created_at)}</small></GlassCard>)}</div>:null}
    {msg&&<div className="notice selectable">{msg}</div>}
  </div>;
}
