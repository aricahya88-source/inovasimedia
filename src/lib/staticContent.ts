import type { Activity, Material, WeekSummary, DiscussionSummary } from './types';

/**
 * IMPORTANT:
 * Public course content is static on Vercel/CDN, not stored in Sheets.
 * A revision query is appended to every request so an older PWA service worker
 * cannot keep serving the previous 28-quiz / 28-discussion JSON forever.
 */
const STATIC_CONTENT_REV = 'v1.7.1-20260830';

export type StaticMilestone = {
  block:number;
  title:string;
  deadline:string;
  deadline_label:string;
  material_range:string;
};


export type StaticRppCheckpoint = {
  activity_id:string;
  type:string;
  title:string;
  href:string;
};

export type StaticRppMeeting = {
  meeting_no:number;
  week_id:string;
  date:string;
  date_label:string;
  block:number;
  block_deadline:string;
  block_deadline_label:string;
  title:string;
  materials:Array<{material_no:number;title:string}>;
  sub_cpmk:string[];
  objectives:string[];
  before:string[];
  during:string[];
  after:string[];
  outputs:string[];
  checkpoints:StaticRppCheckpoint[];
  duration:string;
  milestone:string;
};

export type StaticRpp = {
  course:string;
  semester_start:string;
  semester_start_label:string;
  meeting_day:string;
  meeting_count:number;
  material_count:number;
  duration_per_meeting:string;
  design_note:string;
  milestones:StaticMilestone[];
  meetings:StaticRppMeeting[];
};

export type StaticWeekData = {
  week: {
    week_id:string;
    week_no:number;
    title:string;
    meeting_date:string;
    meeting_date_label:string;
    block:number;
    block_label:string;
    block_deadline:string;
    block_deadline_label:string;
  };
  materials: Material[];
  activities: Array<Activity & { quiz_id?:string; discussion_id?:string; material_no?:number; material_range?:string }>;
};

export type StaticQuiz = {
  checkpoint_no:number;
  material_range:string;
  materials:number[];
  week_id:string;
  activity_id:string;
  quiz_id:string;
  title:string;
  instructions_html:string;
  max_score:number;
  attempt_limit:number;
  show_feedback:boolean;
  recommended_date:string;
  recommended_date_label:string;
  due_at:string;
  due_label:string;
  questions:Array<{
    question_id:string;
    order_no:number;
    source_material_no?:number;
    question_html:string;
    options:Array<{key:string;html:string}>;
    points:number;
  }>;
};

type CourseFile={
  course:string;
  semester_start:string;
  semester_start_label:string;
  meeting_day:string;
  meeting_count:number;
  material_count:number;
  discussion_count:number;
  quiz_count:number;
  milestones:StaticMilestone[];
  weeks:WeekSummary[];
};
let courseCache:CourseFile|null=null;
let discussionCache:DiscussionSummary[]|null=null;

function withRevision(url:string){
  const sep=url.includes('?')?'&':'?';
  return `${url}${sep}rev=${encodeURIComponent(STATIC_CONTENT_REV)}`;
}

async function staticJson<T>(url:string):Promise<T>{
  // no-store is intentional: Vercel CDN is still fast, while the browser/PWA
  // always asks for the current static revision instead of a stale semester bundle.
  const response=await fetch(withRevision(url),{cache:'no-store'});
  if(!response.ok) throw new Error(`Konten statis gagal dimuat (${response.status}).`);
  return response.json() as Promise<T>;
}

export async function getStaticCourse(){
  if(courseCache) return courseCache;
  courseCache=await staticJson<CourseFile>('/content/course.json');
  return courseCache;
}

export async function getStaticWeek(weekNo:number){
  if(!Number.isFinite(weekNo)||weekNo<1||weekNo>14) throw new Error('Pertemuan tidak ditemukan.');
  const data=await staticJson<StaticWeekData>(`/content/weeks/week-${String(weekNo).padStart(2,'0')}.json`);
  // Defensive validation prevents a bad/stale JSON response from crashing the whole client page.
  if(!data || !data.week || !Array.isArray(data.materials) || !Array.isArray(data.activities)){
    throw new Error('Format konten pertemuan tidak valid. Muat ulang halaman setelah deployment selesai.');
  }
  return data;
}

export function quizIdFromActivity(activityId:string){ return String(activityId).replace(/^QUIZ_/,'Q_'); }
export async function getStaticQuiz(activityId:string){ return staticJson<StaticQuiz>(`/content/quizzes/${quizIdFromActivity(activityId)}.json`); }

export async function getStaticDiscussions(){
  if(discussionCache) return discussionCache;
  discussionCache=await staticJson<DiscussionSummary[]>('/content/discussions.json');
  if(!Array.isArray(discussionCache)) throw new Error('Format daftar diskusi tidak valid.');
  return discussionCache;
}

export async function getStaticDiscussionByActivity(activityId:string){
  const rows=await getStaticDiscussions();
  const d=rows.find(x=>x.activity_id===activityId);
  if(!d) throw new Error('Diskusi tidak ditemukan.');
  return d;
}

export async function getStaticActivities(){
  const rows=await staticJson<Array<Activity & {quiz_id?:string;discussion_id?:string;material_no?:number;material_range?:string}>>('/content/activity-index.json');
  if(!Array.isArray(rows)) throw new Error('Format daftar aktivitas tidak valid.');
  return rows;
}

export async function getStaticRpp(){
  const data=await staticJson<StaticRpp>('/content/rpp.json');
  if(!data || !Array.isArray(data.meetings)) throw new Error('Format Rencana Pembelajaran tidak valid.');
  return data;
}
