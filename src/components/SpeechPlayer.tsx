'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, Square, RotateCcw, Volume2 } from 'lucide-react';
import { stripHtml } from '@/lib/utils';

function arabicRatio(text:string){const chars=[...text].filter(c=>/\S/.test(c));return chars.length?chars.filter(c=>/[\u0600-\u06FF]/.test(c)).length/chars.length:0;}
function speechChunks(text:string,max=720){
  const units=text.split(/(?<=[.!?؟])\s+|\n+/).map(s=>s.trim()).filter(Boolean),out:string[]=[];
  for(const unit of units){if(unit.length<=max){out.push(unit);continue;}const words=unit.split(/\s+/);let chunk='';for(const word of words){const next=(chunk+' '+word).trim();if(next.length>max&&chunk){out.push(chunk);chunk=word}else chunk=next}if(chunk)out.push(chunk)}return out;
}

export default function SpeechPlayer({html,label='Dengarkan Materi',compact=false}:{html:string;label?:string;compact?:boolean}){
  const text=useMemo(()=>stripHtml(html),[html]); const[supported,setSupported]=useState(true); const[playing,setPlaying]=useState(false); const[paused,setPaused]=useState(false); const[rate,setRate]=useState(0.95); const[voices,setVoices]=useState<SpeechSynthesisVoice[]>([]); const stopped=useRef(false);
  useEffect(()=>{if(!('speechSynthesis' in window)){setSupported(false);return}const load=()=>setVoices(window.speechSynthesis.getVoices());load();window.speechSynthesis.onvoiceschanged=load;return()=>window.speechSynthesis.cancel()},[]);
  const pickVoice=(lang:string)=>{const prefix=lang.split('-')[0].toLowerCase();return voices.find(v=>v.lang.toLowerCase().startsWith(prefix))||voices[0]};
  const play=()=>{if(!supported||!text)return;window.speechSynthesis.cancel();stopped.current=false;setPlaying(true);setPaused(false);const chunks=speechChunks(text);const speakAt=(i:number)=>{if(stopped.current||i>=chunks.length){setPlaying(false);setPaused(false);return}const chunk=chunks[i],lang=arabicRatio(chunk)>0.18?'ar-SA':'id-ID',u=new SpeechSynthesisUtterance(chunk);u.lang=lang;u.rate=rate;const voice=pickVoice(lang);if(voice)u.voice=voice;u.onend=()=>speakAt(i+1);u.onerror=()=>speakAt(i+1);window.speechSynthesis.speak(u)};speakAt(0)};
  const pause=()=>{if(!playing)return;if(paused){window.speechSynthesis.resume();setPaused(false)}else{window.speechSynthesis.pause();setPaused(true)}};
  const stop=()=>{stopped.current=true;window.speechSynthesis.cancel();setPlaying(false);setPaused(false)};
  if(!supported)return compact?null:<div className="speech-bar">Text-to-Speech tidak didukung browser ini.</div>;
  if(compact)return <div className="speech-mini" title="Text-to-Speech: Indonesia/Arab"><button className="button soft compact" onClick={play}><Play size={14}/>{label}</button>{playing&&<><button className="icon-button tiny" onClick={pause}>{paused?<RotateCcw/>:<Pause/>}</button><button className="icon-button tiny" onClick={stop}><Square/></button></>}</div>;
  return <div className="speech-bar glass-subtle"><div className="speech-title"><Volume2 size={17}/><strong>{label}</strong><small>TTS otomatis Indonesia / Arab</small></div><button className="icon-button" onClick={play} title="Putar"><Play size={17}/></button><button className="icon-button" onClick={pause} disabled={!playing} title={paused?'Lanjut':'Jeda'}>{paused?<RotateCcw size={17}/>:<Pause size={17}/>}</button><button className="icon-button" onClick={stop} disabled={!playing} title="Stop"><Square size={16}/></button><label className="rate-control">Kecepatan<input type="range" min="0.7" max="1.35" step="0.05" value={rate} onChange={e=>setRate(Number(e.target.value))}/><span>{rate.toFixed(2)}×</span></label></div>;
}
