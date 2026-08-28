'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichHtml from '@/components/RichHtml';
import RichTextEditor from '@/components/RichTextEditor';
import QuizPlayer from '@/components/QuizPlayer';
import { api, fileToBase64 } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Upload, ExternalLink } from 'lucide-react';

type TaskData={
  activity:{activity_id:string;type:string;title:string;description_html:string;max_score:number;due_at:string;allow_comments:boolean};
  latest?:{submission_id:string;version:number;content_html:string;link_url:string;file_url:string;file_name:string;submitted_at:string};
  grade?:{score:number;max_score:number;feedback_html:string};
  comments:Array<{comment_id:string;content_html:string;created_at:string;author?:{name:string}}>;
};

export default function TaskPage({params}:{params:Promise<{id:string}>}){
  const {id}=use(params);
  const [d,setD]=useState<TaskData|null>(null);const [error,setError]=useState('');
  const [content,setContent]=useState('');const [link,setLink]=useState('');const [file,setFile]=useState<File|null>(null);const [busy,setBusy]=useState(false);
  const isStaticQuiz=String(id).startsWith('QUIZ_');
  const load=()=>api<TaskData>('getTask',{activity_id:id}).then(setD).catch(e=>setError(e.message));
  useEffect(()=>{if(!isStaticQuiz)load();},[id,isStaticQuiz]);
  if(isStaticQuiz||d?.activity.type==='quiz') return <AuthGate><AppShell title="Kuis"><Link href="/tasks" className="button soft compact"><ArrowLeft/>Kembali</Link><QuizPlayer activityId={id}/></AppShell></AuthGate>;

  const submit=async()=>{
    setBusy(true);setError('');
    try{
      let base64='';let file_name='';let file_mime='';
      if(file){if(file.size>3*1024*1024)throw new Error('File kecil maksimal 3 MB. Untuk audio/video besar gunakan URL Drive/YouTube.');base64=await fileToBase64(file);file_name=file.name;file_mime=file.type;}
      await api('submitWork',{activity_id:id,content_html:content,link_url:link,file_base64:base64,file_name,file_mime});
      setContent('');setLink('');setFile(null);await load();
    }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  };

  return <AuthGate><AppShell title="Tugas">
    <Link href="/tasks" className="button soft compact"><ArrowLeft/>Kembali</Link>
    {error&&<div className="error-box">{error}</div>}
    {!d?<div className="screen-center small"><div className="spinner"/>Memuat tugas...</div>:<div className="stack">
      <GlassCard><span className="eyebrow">{d.activity.type.toUpperCase()}</span><h2>{d.activity.title}</h2><RichHtml html={d.activity.description_html||'<p>Instruksi belum diisi.</p>'}/><div className="row wrap gap"><span className="badge">Maks. {d.activity.max_score} poin</span>{d.activity.due_at&&<span className="badge">{formatDate(d.activity.due_at)}</span>}</div></GlassCard>
      {d.grade&&<GlassCard className="grade-highlight"><div><span className="eyebrow">NILAI</span><h2>{d.grade.score} / {d.grade.max_score}</h2></div><RichHtml html={d.grade.feedback_html||'<p>Belum ada feedback tertulis.</p>'}/></GlassCard>}
      {d.latest&&<GlassCard><span className="eyebrow">SUBMISSION TERAKHIR • VERSI {d.latest.version}</span><RichHtml html={d.latest.content_html}/>{d.latest.link_url&&<a className="button soft compact" target="_blank" rel="noreferrer" href={d.latest.link_url}><ExternalLink/>Buka tautan</a>}{d.latest.file_url&&<a className="button soft compact" target="_blank" rel="noreferrer" href={d.latest.file_url}><ExternalLink/>{d.latest.file_name||'Buka file'}</a>}<small>{formatDate(d.latest.submitted_at)}</small></GlassCard>}
      <GlassCard><span className="eyebrow">{d.latest?'KIRIM REVISI':'KUMPULKAN'}</span><h3>Submission</h3><RichTextEditor value={content} onChange={setContent} minHeight={160}/>
        <div className="form-grid two">
          <label className="field"><span>URL karya / Drive / GitHub / YouTube</span><input value={link} onChange={e=>setLink(e.target.value)} placeholder="https://..."/></label>
          <label className="field"><span>File kecil (maks. 3 MB)</span><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
        </div>
        <div className="right-actions"><button className="button primary" disabled={busy} onClick={submit}><Upload/>{busy?'Mengirim...':'Kirim Submission'}</button></div>
      </GlassCard>
      {d.comments.length>0&&<><div className="section-title"><h3>Komentar</h3></div><div className="stack small-gap">{d.comments.map(c=><GlassCard key={c.comment_id}><strong>{c.author?.name||'Pengguna'}</strong><RichHtml html={c.content_html}/><small>{formatDate(c.created_at)}</small></GlassCard>)}</div></>}
    </div>}
  </AppShell></AuthGate>
}
