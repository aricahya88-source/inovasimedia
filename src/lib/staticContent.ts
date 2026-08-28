import type { Activity, Material, WeekSummary, DiscussionSummary } from './types';

export type StaticMilestone = {
  block:number;
  title:string;
  deadline:string;
  deadline_label:string;
  material_range:string;
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

async function staticJson<T>(url:string):Promise<T>{
  const response=await fetch(url,{cache:'force-cache'});
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
  return staticJson<StaticWeekData>(`/content/weeks/week-${String(weekNo).padStart(2,'0')}.json`);
}

export function quizIdFromActivity(activityId:string){ return String(activityId).replace(/^QUIZ_/,'Q_'); }
export async function getStaticQuiz(activityId:string){ return staticJson<StaticQuiz>(`/content/quizzes/${quizIdFromActivity(activityId)}.json`); }

export async function getStaticDiscussions(){
  if(discussionCache) return discussionCache;
  discussionCache=await staticJson<DiscussionSummary[]>('/content/discussions.json');
  return discussionCache;
}

export async function getStaticDiscussionByActivity(activityId:string){
  const rows=await getStaticDiscussions();
  const d=rows.find(x=>x.activity_id===activityId);
  if(!d) throw new Error('Diskusi tidak ditemukan.');
  return d;
}

export async function getStaticActivities(){
  return staticJson<Array<Activity & {quiz_id?:string;discussion_id?:string;material_no?:number;material_range?:string}>>('/content/activity-index.json');
}
