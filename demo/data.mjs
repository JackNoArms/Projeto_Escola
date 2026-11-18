/** Registros inteiramente fictícios, criados para demonstrar o painel. */
export const series=Object.freeze(['6º ano A','7º ano A','8º ano A','9º ano A']);
export const statuses=Object.freeze(['Ativa','Pendente','Concluída']);
export const subjects=Object.freeze([
  {id:'MAT',name:'Matemática',area:'Exatas',hours:5},
  {id:'POR',name:'Língua Portuguesa',area:'Linguagens',hours:5},
  {id:'CIE',name:'Ciências',area:'Natureza',hours:3},
  {id:'HIS',name:'História',area:'Humanas',hours:3},
  {id:'GEO',name:'Geografia',area:'Humanas',hours:3},
  {id:'ING',name:'Inglês',area:'Linguagens',hours:2},
  {id:'ART',name:'Arte',area:'Linguagens',hours:2},
  {id:'EDF',name:'Educação Física',area:'Corpo e movimento',hours:2}
]);
export const teachers=Object.freeze([
  {id:'DOC-01',name:'Clara Exemplo',subject:'Matemática',classes:4,initials:'CE'},
  {id:'DOC-02',name:'Rafael Exemplo',subject:'Língua Portuguesa',classes:4,initials:'RE'},
  {id:'DOC-03',name:'Marina Exemplo',subject:'Ciências',classes:3,initials:'ME'},
  {id:'DOC-04',name:'João Exemplo',subject:'História',classes:2,initials:'JE'},
  {id:'DOC-05',name:'Bianca Exemplo',subject:'Geografia',classes:3,initials:'BE'},
  {id:'DOC-06',name:'André Exemplo',subject:'Inglês',classes:2,initials:'AE'}
]);
const names=['Alice Demo','Bruno Demo','Camila Demo','Daniel Demo','Elisa Demo','Felipe Demo',
'Gabriela Demo','Heitor Demo','Isabela Demo','Júlio Demo','Lara Demo','Miguel Demo',
'Nina Demo','Otávio Demo','Paula Demo','Renato Demo','Sofia Demo','Tiago Demo',
'Valentina Demo','William Demo','Yara Demo','Zoe Demo','Caio Demo','Luiza Demo'];
export const initialStudents=Object.freeze(names.map((name,i)=>({
 id:'ALU-DEMO-'+String(i+1).padStart(3,'0'),
 name,grade:series[i%4],status:statuses[i%3===0?1:(i%7===0?2:0)],
 enrolled:'2026-'+String(2+(i%4)).padStart(2,'0')+'-'+String(4+(i%19)).padStart(2,'0')
})));
export function normalize(value){
 return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
}
export function filterStudents(rows,{search='',grade='',status=''}={}){
 const q=normalize(search);
 return rows.filter(student=>(!grade||student.grade===grade)&&(!status||student.status===status)&&
 (!q||[student.id,student.name,student.grade].some(v=>normalize(v).includes(q))));
}
export function summarize(rows){
 const count=(key,value)=>rows.filter(r=>r[key]===value).length;
 return {
  total:rows.length,
  active:count('status','Ativa'),
  pending:count('status','Pendente'),
  complete:count('status','Concluída'),
  grades:Object.fromEntries(series.map(grade=>[grade,count('grade',grade)]))
 };
}
export function addStudent(rows,values){
 const name=String(values.name??'').trim().replace(/\s+/g,' ');
 const grade=String(values.grade??'');
 if(name.length<3||name.length>70)throw new RangeError('Informe um nome com 3 a 70 caracteres.');
 if(!series.includes(grade))throw new RangeError('Selecione uma série válida.');
 if(rows.some(row=>normalize(row.name)===normalize(name)&&row.grade===grade)){
   throw new RangeError('Este nome já existe na série selecionada.');
 }
 const next=Math.max(0,...rows.map(r=>Number(String(r.id).replace(/^ALU-DEMO-/,'')).valueOf()||0))+1;
 return [...rows,{id:'ALU-DEMO-'+String(next).padStart(3,'0'),name,grade,
  status:'Pendente',enrolled:'2026-11-18'}];
}
export function updateStatus(rows,id,status){
 if(!statuses.includes(status))throw new RangeError('Situação inválida.');
 if(!rows.some(row=>row.id===id))throw new RangeError('Matrícula não encontrada.');
 return rows.map(row=>row.id===id?{...row,status}:row);
}
