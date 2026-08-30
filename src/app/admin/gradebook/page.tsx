'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichTextEditor from '@/components/RichTextEditor';
import RichHtml from '@/components/RichHtml';
import { api } from '@/lib/api';
import { Save, ExternalLink, MessageSquareText, Download, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, UsersRound } from 'lucide-react';

type Activity={activity_id:string;title:string;type:string;max_score:number;week_id:string};
type Roster={
  user:{user_id:string;nim:string;name:string;class_name?:string};
  grade?:{score:number;max_score:number;feedback_html:string;published:boolean}|null;
  submission?:{submission_id:string;link_url:string;file_url:string;file_name?:string;content_html:string;submitted_at?:string}|null;
  post_count?:number;discussion_excerpt?:string;group_id?:string;group_name?:string;has_comment?:boolean;latest_comment_html?:string;
};
type GradeImportRow={activity_id:string;user_id:string;submission_id:string;group_id:string;score:string;comment:string;name:string;nim:string};
type ImportReport={processed:number;grade_records:number;comments:number;group_rows:number;errors:string[]};

function stripHtml(v:string){
  if(typeof document==='undefined')return v.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const el=document.createElement('div');el.innerHTML=v||'';return (el.textContent||'').replace(/\s+/g,' ').trim();
}
function keyOf(r:Roster){return r.submission?.submission_id||r.group_id||r.user.user_id}
function normalizeImport(raw:Record<string,unknown>):GradeImportRow{
  const low:Record<string,unknown>={};Object.keys(raw).forEach(k=>{low[k.trim().toLowerCase()]=raw[k]});
  const t=(v:unknown)=>String(v??'').trim();
  return {activity_id:t(low.activity_id),user_id:t(low.user_id),submission_id:t(low.submission_id),group_id:t(low.group_id),score:t(low.nilai??low.score),comment:t(low.komentar??low.comment??low.feedback),name:t(low.nama??low.name),nim:t(low.nim)};
}

export default function Gradebook(){
  const[activities,setActivities]=useState<Activity[]>([]);const[activity,setActivity]=useState('');const[rows,setRows]=useState<Roster[]>([]);const[selected,setSelected]=useState<Roster|null>(null);const[score,setScore]=useState(0);const[feedback,setFeedback]=useState('');const[comment,setComment]=useState('');const[published,setPublished]=useState(true);const[msg,setMsg]=useState('');
  const[importRows,setImportRows]=useState<GradeImportRow[]>([]);const[importName,setImportName]=useState('');const[importBusy,setImportBusy]=useState(false);const[importReport,setImportReport]=useState<ImportReport|null>(null);
  const loadActivities=()=>api<Activity[]>('adminGradebookActivities').then(a=>{setActivities(a);setActivity(v=>v||a[0]?.activity_id||'')});
  const loadRows=()=>activity?api<Roster[]>('adminActivityRoster',{activity_id:activity}).then(setRows):Promise.resolve();
  useEffect(()=>{loadActivities().catch(e=>setMsg(e.message))},[]);
  useEffect(()=>{if(activity){setSelected(null);setImportRows([]);setImportName('');setImportReport(null);loadRows().catch(e=>setMsg(e.message))}},[activity]);
  const open=(r:Roster)=>{setSelected(r);setScore(Number(r.grade?.score||0));setFeedback(r.grade?.feedback_html||'');setComment('');setPublished(r.grade?.published!==false)};
  const save=async()=>{if(!selected)return;if(score<0||score>100){setMsg('Nilai harus berada pada rentang 0–100.');return;}try{await api('adminSaveGrade',{activity_id:activity,user_id:selected.user.user_id,submission_id:selected.submission?.submission_id||'',score,feedback_html:feedback,published});setMsg('Nilai tersimpan pada skala 100.');await loadRows()}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  const sendComment=async()=>{if(!selected?.submission?.submission_id||!comment.replace(/<[^>]+>/g,'').trim())return;try{await api('adminAddSubmissionComment',{submission_id:selected.submission.submission_id,content_html:comment});setComment('');setMsg('Komentar dosen terkirim tanpa mengubah nilai.');await loadRows()}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  const current=activities.find(a=>a.activity_id===activity);

  const uniqueEvidence=useMemo(()=>{
    const seen=new Set<string>();return rows.filter(r=>{
      const hasEvidence=current?.type==='discussion'?(Number(r.post_count)||0)>0:!!r.submission;
      if(!hasEvidence)return false;const k=keyOf(r);if(seen.has(k))return false;seen.add(k);return true;
    });
  },[rows,current?.type]);
  const pending=useMemo(()=>uniqueEvidence.filter(r=>!r.grade&&!r.has_comment),[uniqueEvidence]);
  const graded=useMemo(()=>uniqueEvidence.filter(r=>!!r.grade).length,[uniqueEvidence]);

  const exportPending=async()=>{
    if(!current)return;if(current.type==='quiz'){setMsg('Kuis dinilai otomatis dan tidak masuk export penilaian manual.');return;}if(!pending.length){setMsg('Tidak ada hasil yang sekaligus belum dinilai dan belum diberi komentar pada aktivitas ini.');return;}
    const XLSX=await import('xlsx');
    const exportRows=pending.map(r=>({
      activity_id:activity,user_id:r.user.user_id,submission_id:r.submission?.submission_id||'',group_id:r.group_id||'',
      NIM:r.user.nim,Nama:r.group_name?`${r.group_name} — ${r.user.name}`:r.user.name,Kelas:r.user.class_name||'',Jenis:current.type,Aktivitas:current.title,Kelompok:r.group_name||'',
      'Tanggal Kirim':r.submission?.submitted_at||'',
      Bukti:current.type==='discussion'?(r.discussion_excerpt||`${r.post_count||0} post`):[stripHtml(r.submission?.content_html||''),r.submission?.link_url||'',r.submission?.file_url||''].filter(Boolean).join(' | ').slice(0,3000),
      Nilai:'',Komentar:''
    }));
    const ws=XLSX.utils.json_to_sheet(exportRows,{header:['activity_id','user_id','submission_id','group_id','NIM','Nama','Kelas','Jenis','Aktivitas','Kelompok','Tanggal Kirim','Bukti','Nilai','Komentar']});
    ws['!cols']=[{hidden:true},{hidden:true},{hidden:true},{hidden:true},{wch:14},{wch:28},{wch:14},{wch:14},{wch:38},{wch:20},{wch:22},{wch:70},{wch:12},{wch:70}];
    const info=[
      ['PETUNJUK PENILAIAN KOLEKTIF'],
      ['1. File ini hanya berisi hasil yang belum dinilai DAN belum diberi komentar.'],
      ['2. Isi kolom Nilai dengan angka 0–100.'],
      ['3. Isi kolom Komentar dengan feedback dosen.'],
      ['4. Jangan mengubah kolom teknis activity_id, user_id, submission_id, dan group_id.'],
      ['5. Untuk submission kelompok, satu baris mewakili satu kelompok; nilai dan komentar akan diterapkan kepada seluruh anggota.'],
      ['6. Kuis tidak termasuk karena dinilai otomatis.']
    ];
    const wi=XLSX.utils.aoa_to_sheet(info);wi['!cols']=[{wch:105}];
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'PENILAIAN');XLSX.utils.book_append_sheet(wb,wi,'PETUNJUK');
    const safe=current.title.replace(/[^a-z0-9\-_]+/gi,'_').slice(0,55);XLSX.writeFile(wb,`Belum_Dinilai_${safe}_${new Date().toISOString().slice(0,10)}.xlsx`);
    setMsg(`${pending.length} hasil belum dinilai berhasil diekspor.`);
  };

  const readImport=async(file:File|null)=>{
    if(!file)return;setMsg('');setImportReport(null);setImportRows([]);setImportName(file.name);
    try{const XLSX=await import('xlsx');const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});const sheet=wb.Sheets['PENILAIAN']||wb.Sheets[wb.SheetNames[0]];if(!sheet)throw new Error('Sheet PENILAIAN tidak ditemukan.');const raw=XLSX.utils.sheet_to_json<Record<string,unknown>>(sheet,{defval:'',raw:false});const parsed=raw.map(normalizeImport).filter(x=>x.activity_id||x.user_id||x.score||x.comment);if(!parsed.length)throw new Error('Tidak ada baris penilaian yang terbaca.');if(parsed.length>500)throw new Error('Maksimal 500 baris per file.');setImportRows(parsed);}catch(e){setImportName('');setMsg(e instanceof Error?e.message:String(e))}
  };
  const importErrors=useMemo(()=>importRows.map((r,i)=>{const errs:string[]=[];const n=Number(r.score);if(!r.activity_id||r.activity_id!==activity)errs.push('aktivitas tidak sesuai');if(!r.user_id)errs.push('user_id kosong');if(r.score===''||Number.isNaN(n)||n<0||n>100)errs.push('nilai harus 0–100');if(!r.comment)errs.push('komentar kosong');return errs.length?`Baris ${i+2}: ${errs.join(', ')}`:''}).filter(Boolean),[importRows,activity]);
  const validImport=importRows.length-importErrors.length;
  const runImport=async()=>{
    if(!importRows.length||importErrors.length)return;setImportBusy(true);setMsg('');setImportReport(null);const chunks:GradeImportRow[][]=[];for(let i=0;i<importRows.length;i+=50)chunks.push(importRows.slice(i,i+50));const total:ImportReport={processed:0,grade_records:0,comments:0,group_rows:0,errors:[]};
    try{for(const chunk of chunks){const result=await api<ImportReport>('adminImportGrades',{rows:chunk.map(r=>({activity_id:r.activity_id,user_id:r.user_id,submission_id:r.submission_id,group_id:r.group_id,score:Number(r.score),comment:r.comment}))});total.processed+=result.processed;total.grade_records+=result.grade_records;total.comments+=result.comments;total.group_rows+=result.group_rows;total.errors.push(...result.errors)}setImportReport(total);setMsg(`Import selesai: ${total.processed} hasil dinilai, ${total.comments} komentar dicatat.`);setImportRows([]);setImportName('');await loadRows()}catch(e){setImportReport(total);setMsg(e instanceof Error?e.message:String(e))}finally{setImportBusy(false)}
  };

  return <AuthGate adminOnly><AppShell title="Gradebook"><div className="stack">
    <GlassCard><div className="row between wrap gap"><label className="field grow"><span>Pilih aktivitas</span><select value={activity} onChange={e=>setActivity(e.target.value)}>{activities.map(a=><option key={a.activity_id} value={a.activity_id}>{a.week_id} • {a.title} ({a.type})</option>)}</select></label><div className="row wrap gap"><button className="button soft" disabled={!current||current.type==='quiz'||pending.length===0} onClick={exportPending}><Download/>Export {pending.length} Belum Dinilai</button><label className="button primary"><Upload/>Import Nilai & Komentar<input className="hidden" type="file" accept=".xlsx,.xls" onChange={e=>readImport(e.target.files?.[0]||null)}/></label></div></div><p className="muted">Export hanya mengambil hasil yang <strong>belum memiliki nilai dan belum memiliki komentar dosen</strong>. Semua nilai menggunakan skala 100. Kuis tetap dinilai otomatis.</p></GlassCard>

    <div className="gradebook-stat-grid"><GlassCard><span className="eyebrow">HASIL MASUK</span><h2>{uniqueEvidence.length}</h2><small>submission/post yang siap diperiksa</small></GlassCard><GlassCard><span className="eyebrow">SUDAH DINILAI</span><h2>{graded}</h2><small>nilai tersimpan pada skala 100</small></GlassCard><GlassCard><span className="eyebrow">BELUM DINILAI + KOMENTAR</span><h2>{pending.length}</h2><small>akan masuk file export Excel</small></GlassCard></div>

    {importRows.length>0&&<GlassCard><div className="row between wrap gap"><div><span className="eyebrow">PREVIEW IMPORT</span><h3>{importName}</h3></div><div className="row wrap gap"><span className="badge success"><CheckCircle2/> {validImport} siap</span>{importErrors.length>0&&<span className="badge danger"><AlertTriangle/> {importErrors.length} masalah</span>}</div></div><div className="scroll-list">{importRows.slice(0,8).map((r,i)=><div className="select-row" key={`${r.user_id}-${i}`}><strong>{r.name||r.nim||r.user_id}</strong><small>Nilai {r.score||'—'} • {r.comment?`${r.comment.slice(0,100)}${r.comment.length>100?'…':''}`:'komentar kosong'}</small></div>)}</div>{importErrors.length>0&&<div className="error-box selectable">{importErrors.slice(0,10).map((x,i)=><div key={i}>{x}</div>)}</div>}<div className="right-actions"><button className="button primary" disabled={importBusy||importErrors.length>0||!importRows.length} onClick={runImport}><FileSpreadsheet/>{importBusy?'Mengimpor...':`Import ${validImport} Penilaian`}</button></div></GlassCard>}
    {importReport&&<div className="notice"><strong>Import penilaian selesai.</strong> {importReport.processed} baris diproses, {importReport.grade_records} record nilai tersimpan, {importReport.comments} komentar ditambahkan.{importReport.group_rows>0&&<> <UsersRound size={15}/> {importReport.group_rows} baris kelompok diterapkan ke seluruh anggota.</>}{importReport.errors.map((x,i)=><div key={i}>{x}</div>)}</div>}

    <div className="admin-split">
      <GlassCard className="admin-list"><span className="eyebrow">MAHASISWA</span><h3>{rows.length} peserta</h3><div className="scroll-list">{rows.map(r=><button key={r.user.user_id} onClick={()=>open(r)} className={selected?.user.user_id===r.user.user_id?'select-row active':'select-row'}><strong>{r.user.name}</strong><small>{r.user.nim}{r.group_name?` • ${r.group_name}`:''} • {r.grade?`${r.grade.score}/100`:'Belum dinilai'} {typeof r.post_count==='number'?`• ${r.post_count} post`:''}{r.has_comment?' • sudah dikomentari':''}</small></button>)}</div></GlassCard>
      <div className="stack">{selected&&<>
        <GlassCard><span className="eyebrow">BUKTI BELAJAR</span><h3>{selected.user.name}</h3>{selected.group_name&&<span className="badge"><UsersRound/> {selected.group_name}</span>}{selected.submission?<><RichHtml html={selected.submission.content_html||''}/>{selected.submission.link_url&&<a target="_blank" rel="noreferrer" className="button soft compact" href={selected.submission.link_url}><ExternalLink/>Buka URL</a>}{selected.submission.file_url&&<a target="_blank" rel="noreferrer" className="button soft compact" href={selected.submission.file_url}><ExternalLink/>Buka File</a>}<div className="field"><span>Komentar dosen tanpa memberi nilai</span><RichTextEditor value={comment} onChange={setComment} minHeight={130}/></div><div className="right-actions"><button className="button soft" disabled={!comment.replace(/<[^>]+>/g,'').trim()} onClick={sendComment}><MessageSquareText/>Kirim Komentar</button></div></>:<p className="muted">{typeof selected.post_count==='number'?`Jumlah post diskusi: ${selected.post_count}`:'Belum ada submission.'}</p>}</GlassCard>
        <GlassCard><div className="form-grid two"><label className="field"><span>Nilai (skala 0–100)</span><input type="number" min="0" max="100" value={score} onChange={e=>setScore(Number(e.target.value))}/></label><label className="switch-row"><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)}/>Publikasikan ke mahasiswa</label></div><label className="field"><span>Feedback / komentar penilaian</span><RichTextEditor value={feedback} onChange={setFeedback} minHeight={220}/></label><div className="right-actions"><button className="button primary" onClick={save}><Save/>Simpan Nilai</button></div></GlassCard>
      </>}</div>
    </div>{msg&&<div className="notice selectable">{msg}</div>}
  </div></AppShell></AuthGate>
}
