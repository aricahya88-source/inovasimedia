'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import RichHtml from './RichHtml';
import GlassCard from './GlassCard';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';

type Q = {
  question_id:string; order_no:number; question_html:string;
  options:Array<{key:string;html:string}>;
  points:number;
};
type QuizData = {
  activity:{activity_id:string;title:string;max_score:number};
  quiz:{quiz_id:string;instructions_html:string;attempt_limit:number;show_feedback:boolean};
  questions:Q[];
  attempts:number;
  best?:{score:number;max_score:number;percentage:number};
};
type Result = {score:number;max_score:number;percentage:number;attempt_no:number;feedback?:Array<{question_id:string;correct:boolean;correct_option?:string;explanation_html?:string}>};

export default function QuizPlayer({activityId}:{activityId:string}) {
  const [data,setData]=useState<QuizData|null>(null);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    api<QuizData>('getQuiz',{activity_id:activityId}).then(setData).catch(e=>setError(e.message));
  },[activityId]);

  if(error) return <GlassCard><p className="error-text">{error}</p></GlassCard>;
  if(!data) return <div className="screen-center small"><div className="spinner"/>Memuat kuis...</div>;

  const submit=async()=>{
    if(Object.keys(answers).length < data.questions.length && !confirm('Masih ada soal yang belum dijawab. Tetap kirim?')) return;
    setBusy(true); setError('');
    try {
      const r=await api<Result>('submitQuiz',{activity_id:activityId,answers});
      setResult(r);
      const fresh=await api<QuizData>('getQuiz',{activity_id:activityId});
      setData(fresh);
    } catch(e) { setError(e instanceof Error?e.message:String(e)); }
    finally { setBusy(false); }
  };

  if(result) return <div className="stack">
    <GlassCard className="quiz-result">
      <div className="icon-bubble amber"><Trophy/></div>
      <div><span className="eyebrow">HASIL KUIS</span><h2>{result.score} / {result.max_score}</h2><p className="muted">{result.percentage.toFixed(0)}% • Percobaan ke-{result.attempt_no}</p></div>
      <button className="button soft" onClick={()=>{setResult(null);setAnswers({});}}>Kembali</button>
    </GlassCard>
    {result.feedback?.map((f,i)=><GlassCard key={f.question_id}>
      <div className="row gap"><strong>Soal {i+1}</strong><span className={f.correct?'badge success':'badge danger'}>{f.correct?'Benar':'Perlu diperbaiki'}</span></div>
      {f.correct_option && <p>Jawaban benar: <strong>{f.correct_option}</strong></p>}
      {f.explanation_html && <RichHtml html={f.explanation_html}/>}
    </GlassCard>)}
  </div>;

  const remaining=Math.max(0,data.quiz.attempt_limit-data.attempts);
  return <div className="stack">
    <GlassCard>
      <span className="eyebrow">KUIS FORMATIF</span>
      <h2>{data.activity.title}</h2>
      <RichHtml html={data.quiz.instructions_html||''}/>
      <div className="row wrap gap"><span className="badge">Percobaan: {data.attempts}/{data.quiz.attempt_limit}</span>{data.best&&<span className="badge success">Terbaik: {data.best.percentage.toFixed(0)}%</span>}</div>
    </GlassCard>
    {data.questions.map((q,idx)=><GlassCard key={q.question_id} className="quiz-question">
      <div className="question-number">{idx+1}</div>
      <RichHtml html={q.question_html}/>
      <div className="option-list">
        {q.options.map(o=><button type="button" key={o.key} onClick={()=>setAnswers(v=>({...v,[q.question_id]:o.key}))} className={answers[q.question_id]===o.key?'quiz-option-button selected':'quiz-option-button'}>
          {answers[q.question_id]===o.key?<CheckCircle2/>:<Circle/>}<strong>{o.key}</strong><RichHtml html={o.html}/>
        </button>)}
      </div>
    </GlassCard>)}
    {error&&<p className="error-text">{error}</p>}
    <button className="button primary large" disabled={busy||remaining<=0} onClick={submit}>{busy?'Mengoreksi...':remaining<=0?'Kesempatan habis':'Kirim Jawaban'}</button>
  </div>;
}
