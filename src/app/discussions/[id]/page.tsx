'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichHtml from '@/components/RichHtml';
import RichTextEditor from '@/components/RichTextEditor';
import { api } from '@/lib/api';
import type { Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Send, Reply } from 'lucide-react';

type Data={discussion:{discussion_id:string;prompt_html:string};activity:{activity_id:string;title:string;max_score:number};posts:Post[]};

export default function DiscussionPage({params}:{params:Promise<{id:string}>}){
  const {id}=use(params); const [d,setD]=useState<Data|null>(null); const [content,setContent]=useState(''); const [replyTo,setReplyTo]=useState<string>(''); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const load=()=>api<Data>('getDiscussion',{activity_id:id}).then(setD).catch(e=>setError(e.message));
  useEffect(()=>{load();},[id]);
  const send=async()=>{if(!content.replace(/<[^>]+>/g,'').trim())return;setBusy(true);try{await api('createPost',{discussion_id:d?.discussion.discussion_id,content_html:content,parent_post_id:replyTo});setContent('');setReplyTo('');await load();}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}};
  return <AuthGate><AppShell title="Diskusi">
    <Link href="/discussions" className="button soft compact"><ArrowLeft/>Kembali</Link>
    {error&&<div className="error-box">{error}</div>}
    {!d?<div className="screen-center small"><div className="spinner"/>Memuat forum...</div>:<div className="stack">
      <GlassCard><span className="eyebrow">FORUM</span><h2>{d.activity.title}</h2><RichHtml html={d.discussion.prompt_html}/></GlassCard>
      <div className="section-title"><h3>{d.posts.length} Respons</h3></div>
      <div className="discussion-stream">{d.posts.map(p=><GlassCard key={p.post_id} className={`post-card ${p.parent_post_id?'reply-post':''}`}>
        <div className="avatar">{(p.author?.name||'?')[0]}</div><div className="grow"><div className="post-head"><strong>{p.author?.name||'Pengguna'}</strong><small>{formatDate(p.created_at)}</small></div><RichHtml html={p.content_html}/><button className="text-button" onClick={()=>setReplyTo(p.post_id)}><Reply size={14}/>Balas</button></div>
      </GlassCard>)}</div>
      <GlassCard><span className="eyebrow">{replyTo?'BALAS POSTING':'TULIS RESPONS'}</span>{replyTo&&<div className="notice">Sedang membalas posting. <button className="text-button" onClick={()=>setReplyTo('')}>Batalkan</button></div>}<RichTextEditor value={content} onChange={setContent} minHeight={150}/><div className="right-actions"><button className="button primary" disabled={busy} onClick={send}><Send/>{busy?'Mengirim...':'Kirim Respons'}</button></div></GlassCard>
    </div>}
  </AppShell></AuthGate>
}
