import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {series,subjects,teachers,statuses,initialStudents,normalize,filterStudents,summarize,addStudent,updateStatus} from '../demo/data.mjs';

test('initial dataset uses only clearly fictional records',()=>{
 assert.equal(initialStudents.length,24);
 assert.ok(initialStudents.every(x=>x.id.startsWith('ALU-DEMO-')&&x.name.endsWith(' Demo')));
 assert.equal(new Set(initialStudents.map(x=>x.id)).size,initialStudents.length);
 assert.equal(teachers.length,6);
 assert.equal(subjects.length,8);
 assert.ok(series.includes('6º ano A'));
});

test('statistics reflect all records and each series',()=>{
 const stats=summarize(initialStudents);
 assert.equal(stats.total,24);
 assert.equal(stats.active+stats.pending+stats.complete,24);
 assert.equal(Object.values(stats.grades).reduce((a,b)=>a+b,0),24);
});

test('search ignores accents and can find by student code',()=>{
 assert.equal(normalize(' MÁTRÍCULA '),'matricula');
 const rows=filterStudents(initialStudents,{search:'alU-DEMO-003'});
 assert.equal(rows.length,1);assert.equal(rows[0].id,'ALU-DEMO-003');
 assert.equal(filterStudents(initialStudents,{search:'ALICE'}).length,1);
});

test('filters combine grade, status and keyword',()=>{
 const expected=initialStudents.filter(x=>x.grade==='6º ano A'&&x.status==='Pendente');
 const rows=filterStudents(initialStudents,{grade:'6º ano A',status:'Pendente'});
 assert.deepEqual(rows,expected);
 assert.equal(filterStudents(initialStudents,{status:'inexistente'}).length,0);
});

test('enrollment is non-mutating and starts pending',()=>{
 const created=addStudent(initialStudents,{name:'Estudante Demonstrativo',grade:'7º ano A'});
 assert.equal(created.length,25);
 assert.equal(initialStudents.length,24);
 const last=created.at(-1);
 assert.equal(last.status,'Pendente');assert.match(last.id,/^ALU-DEMO-/);
 assert.equal(last.name,'Estudante Demonstrativo');
});

test('duplicate and invalid enrollments are rejected',()=>{
 for(const values of [
  {name:'A',grade:'6º ano A'},
  {name:'Nome válido',grade:'não existe'},
  {name:'Alice Demo',grade:'6º ano A'}
 ]) assert.throws(()=>addStudent(initialStudents,values),RangeError);
});

test('status update is validated and immutable',()=>{
 const id=initialStudents[0].id;
 const changed=updateStatus(initialStudents,id,'Ativa');
 assert.equal(changed[0].status,'Ativa');
 assert.notEqual(changed,initialStudents);
 assert.throws(()=>updateStatus(initialStudents,id,'Inválida'),RangeError);
 assert.throws(()=>updateStatus(initialStudents,'nao-existe','Ativa'),RangeError);
});

test('interface identifies fictitious content and avoids unsafe HTML insertion',()=>{
 const html=readFileSync(new URL('../demo/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../demo/app.mjs',import.meta.url),'utf8');
 assert.match(html,/dados fictícios/i);
 assert.match(html,/id="enroll-form"/);
 assert.match(html,/aria-live="polite"/);
 assert.match(app,/textContent/);
 assert.doesNotMatch(app,/innerHTML\s*=/);
});
