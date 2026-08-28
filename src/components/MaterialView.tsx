'use client';
import type { Material } from '@/lib/types';
import GlassCard from './GlassCard';
import RichHtml from './RichHtml';
import SpeechPlayer from './SpeechPlayer';
import MediaEmbed from './MediaEmbed';
import { BookOpenText } from 'lucide-react';

export default function MaterialView({material}:{material:Material}) {
  return <GlassCard className="material-card">
    <div className="material-card-head">
      <div className="icon-bubble teal"><BookOpenText/></div>
      <div><span className="eyebrow">MATERI {material.material_no}</span><h2>{material.title}</h2></div>
    </div>
    <SpeechPlayer html={material.content_html}/>
    <RichHtml html={material.content_html} className="rich-html material-html"/>
    <MediaEmbed url={material.resource_url}/>
  </GlassCard>;
}
