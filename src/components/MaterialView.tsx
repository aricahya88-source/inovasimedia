'use client';
import { useMemo, useState } from 'react';
import type { Material } from '@/lib/types';
import GlassCard from './GlassCard';
import RichHtml from './RichHtml';
import SpeechPlayer from './SpeechPlayer';
import MediaEmbed from './MediaEmbed';
import { BookOpenText, ChevronDown, ChevronUp, Headphones, Clock3 } from 'lucide-react';
import { stripHtml } from '@/lib/utils';

function cleanHero(html:string){return String(html||'').replace(/<header class="material-hero">[\s\S]*?<\/header>/i,'').trim();}
function splitSections(html:string){
  const body=cleanHero(html); const parts=body.split(/(?=<h[23][^>]*>)/i).filter(x=>x.trim());
  if(parts.length<=1) return [{id:'intro',html:body}];
  return parts.map((x,i)=>({id:`s${i+1}`,html:x}));
}
function sectionLabel(html:string){
  const m=html.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i); return m?stripHtml(m[1]):'Pengantar materi';
}

export default function MaterialView({material}:{material:Material}) {
  const sections=useMemo(()=>splitSections(material.content_html),[material.content_html]);
  const [open,setOpen]=useState<Record<string,boolean>>({});
  const words=stripHtml(material.content_html).split(/\s+/).filter(Boolean).length;
  const minutes=Math.max(1,Math.round(words/180));
  return <GlassCard className="material-card reading-surface">
    <div className="material-card-head">
      <div className="icon-bubble teal"><BookOpenText/></div>
      <div className="grow"><span className="eyebrow">MATERI {material.material_no}</span><h2>{material.title}</h2><div className="row wrap gap material-meta"><span><Clock3/> ±{minutes} menit baca</span><span><Headphones/> Bisa didengarkan</span></div></div>
    </div>
    <SpeechPlayer html={material.content_html} label="Dengarkan seluruh materi"/>
    <div className="material-sections">
      {sections.map((section,i)=>{
        const label=sectionLabel(section.html); const collapsible=i>0; const isOpen=open[section.id]!==false;
        return <section className="material-section" key={section.id}>
          <div className="material-section-toolbar">
            <span className="section-index">{String(i+1).padStart(2,'0')}</span><strong>{label}</strong>
            {collapsible&&<button className="icon-button" title={isOpen?'Tutup bagian':'Buka bagian'} onClick={()=>setOpen(v=>({...v,[section.id]:!isOpen}))}>{isOpen?<ChevronUp/>:<ChevronDown/>}</button>}
          </div>
          {isOpen&&<RichHtml html={section.html} className="rich-html material-html"/>}
        </section>;
      })}
    </div>
    <MediaEmbed url={material.resource_url}/>
  </GlassCard>;
}
