'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichTextEditor from '@/components/RichTextEditor';
import { api } from '@/lib/api';
import { Plus, Save, Trash2 } from 'lucide-react';

type QuizList={quiz_id:string;activity_id:string;week_id:string;title:string;attempt_limit:number;max_score:number};
type QuizDetail={
  quiz_id?:string;activity_id?:string;week_id:string;title:string;instructions_html:string;
  attempt_limit:number;show_feedback:boolean;shuffle_questions:boolean;visible:boolean;due_at:string;
  questions:Question[];
};
type Question={question_id?:string;order_no:number;question_html:string;option_a_html:string;option_b_html:string;option_c_html:string;option_d_html:string;correct_option:string;points:number;explanation_html:string};
const emptyQ=():Question=>({order_no:1,question_html:'',option_a_html:'',option_b_html:'',option_c_html:'',option_d_html:'',correct_option:'A',points:1,explanation_html:''});
const empty:QuizDetail={week_id:'W01',title:'',instructions_html:'',attempt_limit:3,show_feedback:true,shuffle_questions:false,visible:true,due_at:'',questions:[]};

export default function AdminQuizzes(){
  const[rows,setRows]=useState<QuizList[]>([]);const[q,setQ]=useState<QuizDetail>({...empty});const[question,setQuestion]=useState<Question>(emptyQ());const[msg,setMsg]=useState('');
  const load=()=>api<QuizList[]>('adminListQuizzes').then(setRows);
  useEffect(()=>{load().catch(e=>setMsg(e.message));},[]);
  const open=async(activity_id:string)=>{try{setQ(await api<QuizDetail>('adminGetQuiz',{activity_id}));setQuestion(emptyQ())}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  const saveQuiz=async()=>{try{const d=await api<QuizDetail>('adminSaveQuiz',{quiz:q});setQ(d);setMsg('Kuis tersimpan.');await load();}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  const saveQuestion=async()=>{if(!q.activity_id)return setMsg('Simpan kuis terlebih dahulu.');try{await api('adminSaveQuizQuestion',{activity_id:q.activity_id,question});setMsg('Soal tersimpan.');await open(q.activity_id)}catch(e){setMsg(e instanceof Error?e.message:String(e))}};
  const delQuestion=async(id?:string)=>{if(!id||!confirm('Hapus soal ini?'))return;await api('adminDeleteQuizQuestion',{question_id:id});if(q.activity_id)await open(q.activity_id)};
  return <AuthGate adminOnly><AppShell title="Kelola Kuis">
    <div className="admin-split">
      <GlassCard className="admin-list"><div className="row between"><div><span className="eyebrow">KUIS</span><h3>Daftar Kuis</h3></div><button className="icon-button" onClick={()=>{setQ({...empty});setQuestion(emptyQ())}}><Plus/></button></div><div className="scroll-list">{rows.map(x=><button key={x.quiz_id} className={q.activity_id===x.activity_id?'select-row active':'select-row'} onClick={()=>open(x.activity_id)}><strong>{x.title}</strong><small>{x.week_id} • {x.max_score} poin</small></button>)}</div></GlassCard>
      <div className="stack">
        <GlassCard>
          <div className="form-grid two"><label className="field"><span>Minggu</span><select value={q.week_id} onChange={e=>setQ({...q,week_id:e.target.value})}>{Array.from({length:14},(_,i)=><option key={i} value={`W${String(i+1).padStart(2,'0')}`}>Minggu {i+1}</option>)}</select></label><label className="field"><span>Judul kuis</span><input value={q.title} onChange={e=>setQ({...q,title:e.target.value})}/></label><label className="field"><span>Kesempatan</span><input type="number" min="1" value={q.attempt_limit} onChange={e=>setQ({...q,attempt_limit:Number(e.target.value)})}/></label><label className="field"><span>Deadline</span><input type="datetime-local" value={q.due_at||''} onChange={e=>setQ({...q,due_at:e.target.value})}/></label></div>
          <label className="field"><span>Instruksi kuis</span><RichTextEditor value={q.instructions_html} onChange={v=>setQ({...q,instructions_html:v})} minHeight={130}/></label>
          <div className="row wrap gap"><label className="switch-row"><input type="checkbox" checked={q.show_feedback} onChange={e=>setQ({...q,show_feedback:e.target.checked})}/>Tampilkan feedback</label><label className="switch-row"><input type="checkbox" checked={q.shuffle_questions} onChange={e=>setQ({...q,shuffle_questions:e.target.checked})}/>Acak soal</label><label className="switch-row"><input type="checkbox" checked={q.visible} onChange={e=>setQ({...q,visible:e.target.checked})}/>Visible</label></div>
          <div className="right-actions"><button className="button primary" onClick={saveQuiz}><Save/>Simpan Kuis</button></div>
        </GlassCard>

        {q.activity_id&&<GlassCard>
          <div className="row between"><div><span className="eyebrow">BANK SOAL</span><h3>{q.questions.length} soal</h3></div><button className="button soft compact" onClick={()=>setQuestion({...emptyQ(),order_no:q.questions.length+1})}><Plus/>Soal Baru</button></div>
          <div className="quiz-question-list">{q.questions.map((x,i)=><button key={x.question_id} className={question.question_id===x.question_id?'mini-question active':'mini-question'} onClick={()=>setQuestion(x)}><strong>{i+1}</strong><div className="grow" dangerouslySetInnerHTML={{__html:x.question_html}}/><span>{x.points}p</span></button>)}</div>
        </GlassCard>}

        {q.activity_id&&<GlassCard>
          <span className="eyebrow">EDITOR SOAL</span><div className="form-grid two"><label className="field"><span>Urutan</span><input type="number" value={question.order_no} onChange={e=>setQuestion({...question,order_no:Number(e.target.value)})}/></label><label className="field"><span>Poin</span><input type="number" value={question.points} onChange={e=>setQuestion({...question,points:Number(e.target.value)})}/></label></div>
          <label className="field"><span>Pertanyaan</span><RichTextEditor value={question.question_html} onChange={v=>setQuestion({...question,question_html:v})} minHeight={120}/></label>
          <div className="form-grid two">{(['A','B','C','D'] as const).map(k=><label className="field" key={k}><span>Opsi {k}</span><RichTextEditor value={question[`option_${k.toLowerCase()}_html` as keyof Question] as string} onChange={v=>setQuestion({...question,[`option_${k.toLowerCase()}_html`]:v})} minHeight={90}/></label>)}</div>
          <div className="form-grid two"><label className="field"><span>Jawaban benar</span><select value={question.correct_option} onChange={e=>setQuestion({...question,correct_option:e.target.value})}><option>A</option><option>B</option><option>C</option><option>D</option></select></label></div>
          <label className="field"><span>Penjelasan / feedback</span><RichTextEditor value={question.explanation_html} onChange={v=>setQuestion({...question,explanation_html:v})} minHeight={110}/></label>
          <div className="row between">{question.question_id?<button className="button danger" onClick={()=>delQuestion(question.question_id)}><Trash2/>Hapus</button>:<span/>}<button className="button primary" onClick={saveQuestion}><Save/>Simpan Soal</button></div>
        </GlassCard>}
      </div>
    </div>{msg&&<div className="notice">{msg}</div>}
  </AppShell></AuthGate>
}
