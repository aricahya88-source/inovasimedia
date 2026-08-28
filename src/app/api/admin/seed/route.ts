import { NextRequest, NextResponse } from 'next/server';
import materials from '@/server-seed/materials.json';
import quizzes from '@/server-seed/quizzes.json';
import discussions from '@/server-seed/discussions.json';
import { SERVER_CONFIG } from '@/lib/server-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { token, scope = 'all' } = await req.json();
    if (!token) return NextResponse.json({ok:false,error:{message:'Token admin tidak tersedia.'}}, {status:401});
    const url = String(SERVER_CONFIG.APPS_SCRIPT_URL || '').trim();
    if (!url || url.includes('PASTE_APPS_SCRIPT')) {
      return NextResponse.json({ok:false,error:{message:'APPS_SCRIPT_URL belum diisi.'}}, {status:500});
    }
    const payload = {
      action:'adminSeedBundledContent',
      token,
      payload:{
        materials: scope === 'all' || scope === 'materials' ? materials : [],
        quizzes: scope === 'all' || scope === 'quizzes' ? quizzes : [],
        discussions: scope === 'all' || scope === 'discussions' ? discussions : []
      }
    };
    const upstream = await fetch(url, {
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify(payload),
      redirect:'follow',
      cache:'no-store'
    });
    const text = await upstream.text();
    const json = JSON.parse(text);
    return NextResponse.json(json, {status:json.ok ? 200 : 400});
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ok:false,error:{message}}, {status:500});
  }
}
