'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichTextEditor from '@/components/RichTextEditor';
import RichHtml from '@/components/RichHtml';
import { api } from '@/lib/api';
import { Save, ExternalLink, MessageSquareText } from 'lucide-react';

type Activity={activity_id:string;title:string;type:string;max_score:number;week_id:string};
type Roster={user:{user_id:string;nim:string;name:string};grade?:{score:number;max_score:number;feedback_html:string;published:boolean};submission?:{submission_id:string;link_url:string;file_url:string;content_html:string};post_count?:number};
export default function Gradebook(){
  const[activities,setActivities]=useState<Activity[]>([]);const[activity,setActivity]=useState('');const[rows,setRows]=useState<Roster[]>([]);const[selected,setSelected]=useState<Roster|null>(null);const[score,setScore]=useState(0);const[feedback,setFeedback]=useState('');const[comment,setComment]=useState('');const[published,setPublished]=useState(true);const[msg,setMsg]=useState('');
  useEffect(()=>{api<Activity[]>('adminGradebookActivities').then(a=>{setActivities(a);if(a[0])setActivity(a[0].activity_id)}).catch(e=>setMsg(e.message))},[]);
  useEffect(()=>{if(activity)api<Roster[]>('adminActivityRoster',{activity_id:activity}).then(setRows).catch(e=>setMsg(e.message))},[activity]);
  const open=(r:Roster)=>{setSelected(r);setScore(Number(r.grade?.score||0));setFeedback(r.grade?.feedback_html||'');setComment('');setPublished(r.grade?.published!==false)};
  const save=async()=>{if(!selected)return;try{await api('adminSaveGrade',{activity_id:activity,user_id:selected.user.user_id,submission_id:selected.submission?.submission_id||'',score,feedback_html:feedback,published});setMsg('Nilai tersimpan.');setRows(await api<Roster[]>('adminActivityRoster',{activity_id:activity}))}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  const sendComment=async()=>{if(!selected?.submission?.submission_id||!comment.replace(/<[^>]+>/g,'').trim())return;try{await api('adminAddSubmissionComment',{submission_id:selected.submission.submission_id,content_html:comment});setComment('');setMsg('Komentar dosen terkirim tanpa mengubah nilai.')}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  const current=activities.find(a=>a.activity_id===activity);
  return <AuthGate adminOnly><AppShell title="Gradebook">
    <GlassCard><label className="field"><span>Pilih aktivitas</span><select value={activity} onChange={e=>{setActivity(e.target.value);setSelected(null)}}>{activities.map(a=><option key={a.activity_id} value={a.activity_id}>{a.week_id} • {a.title} ({a.type})</option>)}</select></label></GlassCard>
    <div className="admin-split">
      <GlassCard className="admin-list"><span className="eyebrow">MAHASISWA</span><h3>{rows.length} peserta</h3><div className="scroll-list">{rows.map(r=><button key={r.user.user_id} onClick={()=>open(r)} className={selected?.user.user_id===r.user.user_id?'select-row active':'select-row'}><strong>{r.user.name}</strong><small>{r.user.nim} • {r.grade?`${r.grade.score}/${r.grade.max_score}`:'Belum dinilai'} {typeof r.post_count==='number'?`• ${r.post_count} post`:''}</small></button>)}</div></GlassCard>
      <div className="stack">{selected&&<>
        <GlassCard><span className="eyebrow">BUKTI BELAJAR</span><h3>{selected.user.name}</h3>{selected.submission?<><RichHtml html={selected.submission.content_html||''}/>{selected.submission.link_url&&<a target="_blank" rel="noreferrer" className="button soft compact" href={selected.submission.link_url}><ExternalLink/>Buka URL</a>}{selected.submission.file_url&&<a target="_blank" rel="noreferrer" className="button soft compact" href={selected.submission.file_url}><ExternalLink/>Buka File</a>}<div className="field"><span>Komentar dosen tanpa memberi nilai</span><RichTextEditor value={comment} onChange={setComment} minHeight={130}/></div><div className="right-actions"><button className="button soft" disabled={!comment.replace(/<[^>]+>/g,'').trim()} onClick={sendComment}><MessageSquareText/>Kirim Komentar</button></div></>:<p className="muted">{typeof selected.post_count==='number'?`Jumlah post diskusi: ${selected.post_count}`:'Belum ada submission.'}</p>}</GlassCard>
        <GlassCard><div className="form-grid two"><label className="field"><span>Nilai (maks. {current?.max_score||100})</span><input type="number" min="0" max={current?.max_score||100} value={score} onChange={e=>setScore(Number(e.target.value))}/></label><label className="switch-row"><input type="checkbox" checked={published} onChange={e=>setPublished(e.target.checked)}/>Publikasikan ke mahasiswa</label></div><label className="field"><span>Feedback</span><RichTextEditor value={feedback} onChange={setFeedback} minHeight={220}/></label><div className="right-actions"><button className="button primary" onClick={save}><Save/>Simpan Nilai</button></div></GlassCard>
      </>}</div>
    </div>{msg&&<div className="notice">{msg}</div>}
  </AppShell></AuthGate>
}
