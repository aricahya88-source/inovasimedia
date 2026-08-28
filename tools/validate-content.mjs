import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const materials=read('../src/server-seed/materials.json');
const quizzes=read('../src/server-seed/quizzes.json');
const discussions=read('../src/server-seed/discussions.json');
if(materials.length!==28) throw new Error(`Materials ${materials.length}, expected 28`);
if(quizzes.length!==28) throw new Error(`Quizzes ${quizzes.length}, expected 28`);
if(discussions.length!==28) throw new Error(`Discussions ${discussions.length}, expected 28`);
for(let i=1;i<=28;i++){
  const m=materials.find(x=>x.material_no===i);if(!m)throw new Error(`Missing material ${i}`);
  const expected=`W${String(Math.ceil(i/2)).padStart(2,'0')}`;if(m.week_id!==expected)throw new Error(`Material ${i} week mismatch`);
}
console.log('OK: 28 materials, 28 quizzes, 28 discussions, 14 paired LMS weeks.');
