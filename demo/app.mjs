import {initialStudents,teachers,subjects,series,statuses,filterStudents,summarize,addStudent,updateStatus} from './data.mjs';
const $=id=>document.getElementById(id);
let students=[...initialStudents];
let visible=[];
const controls={search:$('search'),grade:$('grade'),status:$('status')};
function add(parent,tag,className='',value){
 const el=document.createElement(tag);
 if(className)el.className=className;
 if(value!==undefined)el.textContent=String(value);
 parent.append(el);return el;
}
function option(select,value,label){
 const op=add(select,'option','',label);op.value=value;return op;
}
function chart(id,entries){
 const area=$(id);area.replaceChildren();
 const max=Math.max(1,...entries.map(x=>x.value));
 entries.forEach(({label,value},index)=>{
  const row=add(area,'div','bar-row');
  const heading=add(row,'div','bar-heading');
  add(heading,'span','',label);add(heading,'strong','',value);
  const track=add(row,'div','bar-track');
  const fill=add(track,'div','bar-fill');
  fill.dataset.tone=String(index);fill.style.width=(100*value/max)+'%';
  track.setAttribute('aria-label',label+': '+value);
 });
}
function renderTotals(){
 const stats=summarize(students);
 $('total').textContent=stats.total;
 $('active').textContent=stats.active;
 $('pending').textContent=stats.pending;
 $('teacher-total').textContent=teachers.length;
 chart('grade-chart',series.map(label=>({label,value:stats.grades[label]})));
 chart('status-chart',[
  {label:'Ativas',value:stats.active},
  {label:'Pendentes',value:stats.pending},
  {label:'Concluídas',value:stats.complete}
 ]);
 const biggest=Object.entries(stats.grades).sort((a,b)=>b[1]-a[1])[0];
 $('insight').textContent='Nesta demonstração, '+stats.active+' de '+stats.total+' matrículas estão ativas e a série com mais registros é '+biggest[0]+' ('+biggest[1]+' alunos). Estes números são exemplos, não indicadores de uma escola real.';
}
function formatDate(date){
 const [y,m,d]=String(date).split('-');return [d,m,y].join('/');
}
function renderTable(){
 visible=filterStudents(students,{
  search:controls.search.value,grade:controls.grade.value,status:controls.status.value
 });
 const body=$('rows');body.replaceChildren();
 visible.forEach(item=>{
  const tr=add(body,'tr');
  const title=add(tr,'td');
  add(title,'span','name',item.name);add(title,'span','sub',item.id);
  add(tr,'td','',item.grade);
  add(tr,'td','',formatDate(item.enrolled));
  const statusCell=add(tr,'td');
  const badge=add(statusCell,'span','status-tag',item.status);
  badge.dataset.status=item.status;
  const change=add(tr,'td');
  const select=add(change,'select','status-editor');
  select.setAttribute('aria-label','Alterar situação de '+item.name);
  statuses.forEach(s=>option(select,s,s));
  select.value=item.status;
  select.addEventListener('change',()=>{
    students=updateStatus(students,item.id,select.value);
    renderTotals();renderTable();
  });
 });
 $('row-count').textContent=visible.length+' de '+students.length+' matrícula(s) fictícia(s)';
 $('empty').hidden=visible.length>0;
}
function render(){
 renderTotals();renderTable();
}
function clearFilters(){
 Object.values(controls).forEach(c=>c.value='');renderTable();
}
function renderTeachers(){
 const grid=$('teacher-grid');grid.replaceChildren();
 teachers.forEach(item=>{
  const card=add(grid,'article','teacher');
  add(card,'div','avatar',item.initials);
  const info=add(card,'div');
  add(info,'h3','',item.name);add(info,'p','',item.subject);
  add(info,'span','teacher-count',item.classes+' série(s) atribuída(s)');
 });
}
function renderSubjects(){
 const grid=$('subject-grid');grid.replaceChildren();
 subjects.forEach(item=>{
  const card=add(grid,'article','subject');
  add(card,'span','subject-id',item.id);
  add(card,'h3','',item.name);
  add(card,'p','',item.area);
  add(card,'span','hours',item.hours+' aula(s) semanais');
 });
}
function cell(text){
 let value=String(text??'');
 if(/^[=+@\-]/.test(value))value="'"+value;
 return '"'+value.replaceAll('"','""')+'"';
}
function exportRows(){
 if(!visible.length){$('row-count').textContent='Nenhuma matrícula no recorte para exportar';return;}
 const keys=['id','name','grade','status','enrolled'];
 const content='\uFEFF'+[
 ['Código','Aluno','Série','Situação','Data'].map(cell).join(';'),
 ...visible.map(row=>keys.map(key=>cell(row[key])).join(';'))
 ].join('\r\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
 const anchor=document.createElement('a');
 anchor.href=url;anchor.download='sistema-escola-matriculas-ficticias.csv';
 document.body.append(anchor);anchor.click();anchor.remove();
 URL.revokeObjectURL(url);
}
function init(){
 series.forEach(s=>{option(controls.grade,s,s);option($('student-grade'),s,s);});
 statuses.forEach(s=>option(controls.status,s,s));
 for(const ctrl of Object.values(controls))ctrl.addEventListener(ctrl===controls.search?'input':'change',renderTable);
 $('reset').addEventListener('click',clearFilters);
 $('restore').addEventListener('click',()=>{students=[...initialStudents];clearFilters();renderTotals();});
 $('export').addEventListener('click',exportRows);
 $('add-button').addEventListener('click',()=>{
  $('enroll-form').reset();$('form-error').hidden=true;
  $('new-student').showModal();$('student-name').focus();
 });
 $('close-dialog').addEventListener('click',()=>$('new-student').close());
 $('enroll-form').addEventListener('submit',event=>{
  event.preventDefault();
  try{
   students=addStudent(students,{
    name:$('student-name').value,grade:$('student-grade').value
   });
   $('form-error').hidden=true;
   $('new-student').close();
   clearFilters();renderTotals();
   $('search').value=$('student-name').value;renderTable();
   $('enrollments').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }catch(error){
   $('form-error').textContent=error.message;$('form-error').hidden=false;
  }
 });
 document.querySelectorAll('.side-nav a').forEach(link=>link.addEventListener('click',()=>{
  document.querySelectorAll('.side-nav a').forEach(a=>a.classList.toggle('active',a===link));
 }));
 renderTeachers();renderSubjects();render();
}
init();
