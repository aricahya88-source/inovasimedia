'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getStaticQuiz, type StaticQuiz } from '@/lib/staticContent';
import RichHtml from './RichHtml';
import GlassCard from './GlassCard';
import { CheckCircle2, Circle, Trophy, DatabaseZap, CalendarClock, LockKeyhole } from 'lucide-react';

type Status={attempts:number;attempt_limit:number;best?:{score:number;max_score:number;percentage:number};closed?:boolean;due_at?:string};
type Result={score:number;max_score:number;percentage:number;attempt_no:number;feedback?:Array<{question_id:string;correct:boolean;correct_option?:string;explanation_html?:string}>};

export default function QuizPlayer({activityId}:{activityId:string}){
  const[data,setData]=useState<StaticQuiz|null>(null);const[status,setStatus]=useState<Status|null>(null);const[answers,setAnswers]=useState<Record<string,string>>({});const[result,setResult]=useState<Result|null>(null);const[error,setError]=useState('');const[busy,setBusy]=useState(false);
  const loadStatus=()=>api<Status>('getStaticQuizStatus',{activity_id:activityId}).then(setStatus);
  useEffect(()=>{Promise.all([getStaticQuiz(activityId),loadStatus()]).then(([q])=>setData(q)).catch(e=>setError(e.message));},[activityId]);
  if(error)return <GlassCard><p className="error-text">{error}</p></GlassCard>;
  if(!data||!status)return <div className="screen-center small"><div className="spinner"/>Memuat kuis lokal...</div>;
  const submit=async()=>{if(status.closed)return;if(Object.keys(answers).length<data.questions.length&&!confirm('Masih ada soal yang belum dijawab. Tetap kirim?'))return;setBusy(true);setError('');try{const r=await api<Result>('submitStaticQuiz',{activity_id:activityId,quiz_id:data.quiz_id,answers});setResult(r);await loadStatus()}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}};
  if(result)return <div className="stack"><GlassCard className="quiz-result"><div className="icon-bubble amber"><Trophy/></div><div><span className="eyebrow">HASIL KUIS</span><h2>{result.score} / {result.max_score}</h2><p className="muted">{result.percentage.toFixed(0)}% • Percobaan ke-{result.attempt_no}</p></div><button className="button soft" onClick={()=>{setResult(null);setAnswers({})}}>Kembali</button></GlassCard>{result.feedback?.map((f,i)=><GlassCard key={f.question_id}><div className="row gap"><strong>Soal {i+1}</strong><span className={f.correct?'badge success':'badge danger'}>{f.correct?'Benar':'Perlu diperbaiki'}</span></div>{f.correct_option&&<p>Jawaban benar: <strong>{f.correct_option}</strong></p>}{f.explanation_html&&<RichHtml html={f.explanation_html}/>}</GlassCard>)}</div>;
  const remaining=Math.max(0,status.attempt_limit-status.attempts);
  return <div className="stack"><GlassCard><div className="row between wrap gap"><div><span className="eyebrow">CHECKPOINT {data.checkpoint_no} • MATERI {data.material_range}</span><h2>{data.title}</h2></div><span className="badge success"><DatabaseZap/> Soal CDN • hasil Sheets</span></div><RichHtml html={data.instructions_html||''}/><div className="row wrap gap"><span className="badge">Percobaan: {status.attempts}/{status.attempt_limit}</span>{status.best&&<span className="badge success">Terbaik: {status.best.percentage.toFixed(0)}%</span>}<span className={status.closed?'badge danger':'badge'}>{status.closed?<LockKeyhole/>:<CalendarClock/>} Batas: {data.due_label}</span></div></GlassCard>{data.questions.map((q,idx)=><GlassCard key={q.question_id} className="quiz-question"><div className="question-number">{idx+1}</div>{q.source_material_no&&<span className="eyebrow">SUMBER MATERI {q.source_material_no}</span>}<RichHtml html={q.question_html}/><div className="option-list">{q.options.map(o=><button type="button" disabled={status.closed||remaining<=0} key={o.key} onClick={()=>setAnswers(v=>({...v,[q.question_id]:o.key}))} className={answers[q.question_id]===o.key?'quiz-option-button selected':'quiz-option-button'}>{answers[q.question_id]===o.key?<CheckCircle2/>:<Circle/>}<strong>{o.key}</strong><RichHtml html={o.html}/></button>)}</div></GlassCard>)}{error&&<p className="error-text">{error}</p>}<button className="button primary large" disabled={busy||remaining<=0||status.closed} onClick={submit}>{busy?'Mengoreksi...':status.closed?'Kuis ditutup':remaining<=0?'Kesempatan habis':'Kirim Jawaban'}</button></div>;
}
