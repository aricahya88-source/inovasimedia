'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import AuthGate from '@/components/AuthGate';
import GlassCard from '@/components/GlassCard';
import RichHtml from '@/components/RichHtml';
import RichTextEditor from '@/components/RichTextEditor';
import { api } from '@/lib/api';
import { getStaticDiscussionByActivity } from '@/lib/staticContent';
import type { DiscussionSummary, Post } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Send, Reply, DatabaseZap } from 'lucide-react';

type PostsData={posts:Post[]};
export default function DiscussionPage({params}:{params:Promise<{id:string}>}){
  const{id}=use(params);const[discussion,setDiscussion]=useState<DiscussionSummary|null>(null);const[posts,setPosts]=useState<Post[]>([]);const[content,setContent]=useState('');const[replyTo,setReplyTo]=useState('');const[busy,setBusy]=useState(false);const[error,setError]=useState('');
  const loadPosts=async(discussionId:string)=>{const d=await api<PostsData>('getStaticDiscussionPosts',{discussion_id:discussionId});setPosts(d.posts)};
  useEffect(()=>{getStaticDiscussionByActivity(id).then(async d=>{setDiscussion(d);await loadPosts(d.discussion_id)}).catch(e=>setError(e.message));},[id]);
  const send=async()=>{if(!discussion||!content.replace(/<[^>]+>/g,'').trim())return;setBusy(true);setError('');try{await api('createStaticPost',{discussion_id:discussion.discussion_id,content_html:content,parent_post_id:replyTo});setContent('');setReplyTo('');await loadPosts(discussion.discussion_id)}catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy(false)}};
  return <AuthGate><AppShell title="Diskusi"><Link href="/discussions" className="button soft compact"><ArrowLeft/>Kembali</Link>{error&&<div className="error-box">{error}</div>}{!discussion?<div className="screen-center small"><div className="spinner"/>Memuat forum...</div>:<div className="stack"><GlassCard><div className="row between wrap gap"><div><span className="eyebrow">FORUM • {discussion.week_id}</span><h2>{discussion.title}</h2></div><span className="badge success"><DatabaseZap/> Prompt CDN • post Sheets</span></div><RichHtml html={discussion.prompt_html}/></GlassCard><div className="section-title"><h3>{posts.length} Respons</h3></div><div className="discussion-stream">{posts.map(p=><GlassCard key={p.post_id} className={`post-card ${p.parent_post_id?'reply-post':''}`}><div className="avatar">{(p.author?.name||'?')[0]}</div><div className="grow"><div className="post-head"><strong>{p.author?.name||'Pengguna'}</strong><small>{formatDate(p.created_at)}</small></div><RichHtml html={p.content_html}/><button className="text-button" onClick={()=>setReplyTo(p.post_id)}><Reply size={14}/>Balas</button></div></GlassCard>)}</div><GlassCard><span className="eyebrow">{replyTo?'BALAS POSTING':'TULIS RESPONS'}</span>{replyTo&&<div className="notice">Sedang membalas posting. <button className="text-button" onClick={()=>setReplyTo('')}>Batalkan</button></div>}<RichTextEditor value={content} onChange={setContent} minHeight={150}/><div className="right-actions"><button className="button primary" disabled={busy} onClick={send}><Send/>{busy?'Mengirim...':'Kirim Respons'}</button></div></GlassCard></div>}</AppShell></AuthGate>
}
