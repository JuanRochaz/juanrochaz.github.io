// Simulação 3D do Escritório ao vivo (Three.js).
// Fica num arquivo separado porque a regra de segurança do site (CSP) bloqueia script escrito dentro do HTML.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const SECT = {
  DP:{name:'Depto. Pessoal',c:'#F2B544'}, FIN:{name:'Financeiro',c:'#4C9BE8'},
  FIS:{name:'Fiscal',c:'#9B7BE0'}, COM:{name:'Compras',c:'#3FC1C9'},
  RH:{name:'RH',c:'#EF7D6B'}, GES:{name:'Gestão',c:'#C9D3D9'}, AUTO:{name:'Automação',c:'#19B37F'}
};
const WORKERS_DEF = [
  {id:'ana',  name:'Ana',   s:'DP',  x:-5, z:-3.2},
  {id:'bruno',name:'Bruno', s:'FIN', x: 0, z:-3.2},
  {id:'carla',name:'Carla', s:'FIS', x: 5, z:-3.2},
  {id:'diego',name:'Diego', s:'COM', x:-5, z: 2.8},
  {id:'elisa',name:'Elisa', s:'RH',  x: 0, z: 2.8},
  {id:'rafa', name:'Rafael',s:'GES', x: 5, z: 2.8},
  {id:'robo', name:'Robô JR Dev', s:'AUTO', x:10.2, z:-4.6, robot:true}
];
const T = (h,m)=>h*60+m;
const TASKS_DEF = [
  [T(8,0),'bruno','Conferir e-mails e cobranças',30],
  [T(8,5),'ana','Fechar marcações de ponto',40],
  [T(8,12),'robo','Enviar 42 holerites no WhatsApp',6,180],
  [T(8,20),'rafa','Planejar prioridades do dia',20],
  [T(8,30),'bruno','Lançar contas a pagar',60],
  [T(8,40),'elisa','Admissão: ficha e EPI',75],
  [T(9,0),'carla','Conciliação bancária',50],
  [T(9,20),'diego','Cotação de materiais',45],
  [T(9,30),'robo','Recarga do cartão benefício',3,40],
  [T(9,45),'rafa','Aprovar pagamentos',20],
  [T(10,20),'robo','Alertas de contrato de experiência',2,30],
  [T(10,30),'carla','Notas fiscais de entrada',60],
  [T(10,40),'diego','Emitir pedido de compra',30],
  [T(11,0),'elisa','Atendimento a colaboradores',40],
  [T(11,10),'ana','Horas extras de obra',50],
  [T(11,30),'rafa','Reunião de alinhamento',30],
  [T(13,0),'robo','Documentos no portal do cliente',5,90],
  [T(13,10),'ana','Lançar variáveis da folha',70],
  [T(13,30),'bruno','Pagamentos e transferências',40],
  [T(13,45),'rafa','Revisar contratos',35],
  [T(14,0),'carla','Apuração de impostos',80],
  [T(14,10),'elisa','Integração de novo colaborador',60],
  [T(14,30),'diego','Acompanhar entregas',45],
  [T(15,0),'robo','Planilha de ajuda de custo',2,45],
  [T(15,40),'bruno','Fluxo de caixa semanal',50],
  [T(15,45),'elisa','Agendar exames admissionais',30],
  [T(16,0),'diego','Fechamento de pedidos',40],
  [T(16,20),'robo','Relatório do dia para a diretoria',3,60],
  [T(16,30),'rafa','Revisão de pendências',40],
  [T(16,50),'ana','Arquivar documentos',30],
  [T(17,0),'carla','Conferir guias de pagamento',35],
];
const BREAKS = [
  {s:T(10,0),e:T(10,15),label:'Pausa para o café',back:'Fim do café, todos de volta'},
  {s:T(12,0),e:T(13,0),label:'Horário de almoço',back:'Volta do almoço'},
  {s:T(15,15),e:T(15,30),label:'Pausa para o café',back:'Fim do café, todos de volta'},
];
const DAY_START=T(8,0), DAY_END=T(18,0), SEC_PER_MIN=0.22;

const $=id=>document.getElementById(id);
const fmtT=m=>{m=Math.floor(m);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const fmtD=m=>{m=Math.round(m);if(m<60)return m+' min';const h=Math.floor(m/60),r=m%60;return h+'h'+(r?String(r).padStart(2,'0'):'')};

$('legend').innerHTML=Object.values(SECT).map(s=>`<span><i style="background:${s.c}"></i>${s.name}</span>`).join('');

const stage=$('stage');
let renderer;
try{ renderer=new THREE.WebGLRenderer({antialias:true}); }catch(e){ $('err').style.display='flex'; throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
stage.prepend(renderer.domElement);
const labelR=new CSS2DRenderer({element:$('labels')});

const scene=new THREE.Scene();
scene.background=new THREE.Color('#0E1418');
const cam=new THREE.OrthographicCamera(-10,10,10,-10,0.1,200);
cam.position.set(20,22,20);
const controls=new OrbitControls(cam,renderer.domElement);
controls.enableDamping=true; controls.enablePan=false;
controls.minPolarAngle=0.5; controls.maxPolarAngle=1.15;
controls.minZoom=0.7; controls.maxZoom=2.2;
controls.target.set(-0.5,0,-0.6);

scene.add(new THREE.HemisphereLight('#cfe8ff','#1a2328',1.15));
const sun=new THREE.DirectionalLight('#ffffff',1.6);
sun.position.set(10,20,8); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:60});
sun.shadow.bias=-0.0005;
scene.add(sun);

const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.75,metalness:.05,...o});
const rbox=(w,h,d,r=0.08)=>new RoundedBoxGeometry(w,h,d,3,r);
function mesh(g,m,x=0,y=0,z=0,cast=true){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;return o}
function label(html,cls,y,parent){const d=document.createElement('div');d.className=cls;d.innerHTML=html;const o=new CSS2DObject(d);o.position.set(0,y,0);parent.add(o);return d}

// chão
const floor=mesh(rbox(30,0.4,18.5,0.15),mat('#16222A'),0,-0.2,0,false); scene.add(floor);
const grid=new THREE.GridHelper(28,28,'#1F2F38','#1B2930'); grid.position.y=0.01; grid.scale.z=17/28; scene.add(grid);
const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(30,0.4,18.5)),new THREE.LineBasicMaterial({color:'#0E7C5A'}));
edge.position.y=-0.2; scene.add(edge);
// paredes baixas ao fundo
scene.add(mesh(rbox(30,1.4,0.3),mat('#1B2830'),0,0.7,-9.1));
scene.add(mesh(rbox(0.3,1.4,18.5),mat('#1B2830'),-14.85,0.7,0));

// Entrada
const inbox=new THREE.Group(); inbox.position.set(-11.5,0,0.6); scene.add(inbox);
inbox.add(mesh(rbox(2.2,0.9,2.2,.12),mat('#22313A'),0,0.45,0));
const inboxGlow=mesh(rbox(1.6,0.12,1.6,.05),mat('#0E7C5A',{emissive:'#0E7C5A',emissiveIntensity:.4}),0,0.95,0);
inbox.add(inboxGlow);
label('Entrada de demandas','sign',2.0,inbox);
const INBOX_POS=new THREE.Vector3(-11.5,1.4,0.6);

// Copa
const copa=new THREE.Group(); copa.position.set(-10.2,0,-5.6); scene.add(copa);
copa.add(mesh(new THREE.CylinderGeometry(1.3,1.3,0.12,32),mat('#2B3A44'),0,0.85,0));
copa.add(mesh(new THREE.CylinderGeometry(0.15,0.25,0.85,16),mat('#1D2830'),0,0.42,0));
copa.add(mesh(new THREE.CylinderGeometry(0.16,0.13,0.3,16),mat('#E8EEF1'),0.3,1.06,0.2));
label('Copa','sign',2.0,copa);

// Arquivo de concluídas
const shelf=new THREE.Group(); shelf.position.set(10.4,0,3.4); scene.add(shelf);
shelf.add(mesh(rbox(2.9,0.25,2.9,.1),mat('#22313A'),0,0.12,0));
label('Concluídas','sign',2.6,shelf);
const shelfSlot=i=>{const col=i%4,row=Math.floor(i/4)%4,lay=Math.floor(i/16);
  return new THREE.Vector3(10.4-1.05+col*0.7,0.47+lay*0.48,3.4-1.05+row*0.7)};

// Pessoas e mesas
const workers={};
const packetGeo=rbox(0.42,0.42,0.42,0.07);
WORKERS_DEF.forEach((d,i)=>{
  const w={...d,sect:SECT[d.s],queue:[],active:null,doneCount:0,busyMin:0};
  const g=new THREE.Group(); g.position.set(d.x,0,d.z); scene.add(g); w.group=g;
  const col=new THREE.Color(w.sect.c);
  if(!d.robot){
    g.add(mesh(rbox(2.7,0.12,1.4,.05),mat('#2B3A44'),0,0.9,0));
    [[-1.2,-0.55],[1.2,-0.55],[-1.2,0.55],[1.2,0.55]].forEach(([x,z])=>g.add(mesh(new THREE.BoxGeometry(0.1,0.85,0.1),mat('#1D2830'),x,0.43,z)));
    g.add(mesh(rbox(1.15,0.7,0.08,.03),mat('#11181C'),0.15,1.4,0.35));
    g.add(mesh(new THREE.BoxGeometry(0.1,0.25,0.1),mat('#11181C'),0.15,1.06,0.4));
    w.screen=new THREE.MeshStandardMaterial({color:'#0b1114',emissive:col,emissiveIntensity:0.05});
    const sc=mesh(new THREE.PlaneGeometry(1.02,0.58),w.screen,0.15,1.4,0.305,false); sc.rotation.y=Math.PI; g.add(sc);
    g.add(mesh(rbox(0.7,0.04,0.25,.02),mat('#3A4C57'),0.15,0.98,-0.15));
    // cadeira
    const chair=new THREE.Group(); chair.position.set(0.15,0,-1.0); g.add(chair);
    chair.add(mesh(rbox(0.75,0.12,0.7,.05),mat('#2A3842'),0,0.55,0));
    chair.add(mesh(rbox(0.75,0.75,0.12,.05),mat('#2A3842'),0,0.95,-0.35));
    chair.add(mesh(new THREE.CylinderGeometry(0.05,0.05,0.5,8),mat('#1D2830'),0,0.27,0));
    // pessoa
    const p=new THREE.Group(); scene.add(p); w.person=p;
    w.body=mesh(new THREE.CapsuleGeometry(0.3,0.5,4,12),mat(col),0,0.95,0); p.add(w.body);
    w.head=mesh(new THREE.SphereGeometry(0.25,20,16),mat('#E9C9A8'),0,1.62,0); p.add(w.head);
    w.seat=new THREE.Vector3(d.x+0.15,0,d.z-1.0);
    const a=(i/6)*Math.PI*2; w.copaPos=new THREE.Vector3(-10.2+Math.cos(a)*1.9,0,-5.6+Math.sin(a)*1.9);
    p.position.copy(w.seat);
    w.qBase=new THREE.Vector3(d.x-0.95,0.96,d.z+0.25);
    w.aPos=new THREE.Vector3(d.x+0.95,1.25,d.z-0.1);
    w.tagParent=new THREE.Object3D(); w.tagParent.position.set(0,0,0); p.add(w.tagParent);
    w.tagY=2.45;
  } else {
    g.add(mesh(rbox(1.6,2.8,1.1,.1),mat('#1A252C'),0,1.4,0));
    w.leds=[];
    for(let r=0;r<7;r++)for(let c=0;c<3;c++){
      const m=new THREE.MeshStandardMaterial({color:'#0b1114',emissive:'#19B37F',emissiveIntensity:.1});
      const l=mesh(new THREE.BoxGeometry(0.28,0.1,0.04),m,-0.4+c*0.4,0.6+r*0.3,0.56,false); g.add(l); w.leds.push(m);
    }
    w.ring=mesh(new THREE.TorusGeometry(0.55,0.05,8,48),new THREE.MeshStandardMaterial({color:'#19B37F',emissive:'#19B37F',emissiveIntensity:.9}),0,3.3,0,false);
    w.ring.rotation.x=Math.PI/2; g.add(w.ring);
    g.add(mesh(rbox(2.2,0.4,1.6,.08),mat('#22313A'),2.1,0.2,0.4));
    w.qBase=new THREE.Vector3(d.x+1.6,0.65,d.z+0.4);
    w.aPos=new THREE.Vector3(d.x,3.3,d.z);
    w.tagParent=g; w.tagY=4.2;
  }
  const tag=document.createElement('div'); tag.className='tag'+(d.robot?' robot':'');
  tag.innerHTML=`<div class="t1"><i style="background:${w.sect.c}"></i>${w.name}<span style="color:var(--txt3);font-weight:400">${d.robot?'automação':w.sect.name}</span></div><div class="t2">Livre</div><div class="bar"><b style="background:${w.sect.c}"></b></div>`;
  const to=new CSS2DObject(tag); to.position.set(0,w.tagY,0); w.tagParent.add(to); w.tagObj=to;
  w.tagEl=tag; w.tagT2=tag.querySelector('.t2'); w.tagBar=tag.querySelector('.bar b');
  workers[d.id]=w;
});

// Painel da equipe
$('team').innerHTML=WORKERS_DEF.map(d=>`<div class="row" id="r_${d.id}"><span class="dot" style="background:${SECT[d.s].c}"></span><span class="nm">${d.name} <small class="st">· Livre</small></span><span class="q"></span><span class="pb"><i style="background:${SECT[d.s].c}"></i></span></div>`).join('');
Object.values(workers).forEach(w=>{const r=$('r_'+w.id);w.rowSt=r.querySelector('.st');w.rowQ=r.querySelector('.q');w.rowBar=r.querySelector('.pb i')});

// Estado
let sim, tasks, nextTask, playing=true, speed=2, evIdx, waitSum, waitN, savedMin, finished, lastTxt={};
function feed(txt,cls=''){const li=document.createElement('li');if(cls)li.className=cls;li.innerHTML=`<time>${fmtT(sim)}</time><span>${txt}</span>`;const f=$('feed');f.prepend(li);while(f.children.length>60)f.lastChild.remove()}

function reset(){
  if(tasks)tasks.forEach(t=>scene.remove(t.mesh));
  sim=DAY_START; nextTask=0; evIdx=0; waitSum=0; waitN=0; savedMin=0; finished=false;
  tasks=TASKS_DEF.map(([at,wid,title,dur,manual],i)=>({id:i,at,wid,title,dur,manual,state:'pending',prog:0}));
  Object.values(workers).forEach(w=>{w.queue=[];w.active=null;w.doneCount=0;if(w.person)w.person.position.copy(w.seat)});
  $('feed').innerHTML=''; $('summary').classList.remove('show');
  doneSlots=0; feed('Início do expediente');
  playing=true; syncPlay();
}
let doneSlots=0;

function inBreak(t){return BREAKS.find(b=>t>=b.s&&t<b.e)}
function personState(w,t){
  if(w.robot)return{working:true};
  const b=inBreak(t);
  if(!b)return{working:true,pos:w.seat,face:0};
  const walk=Math.min(6,(b.e-b.s)/3);
  if(t<b.s+walk){const k=(t-b.s)/walk;return{working:false,walking:true,pos:w.seat.clone().lerp(w.copaPos,ease(k)),face:Math.atan2(w.copaPos.x-w.seat.x,w.copaPos.z-w.seat.z)}}
  if(t>b.e-walk){const k=(t-(b.e-walk))/walk;return{working:false,walking:true,back:true,pos:w.copaPos.clone().lerp(w.seat,ease(k)),face:Math.atan2(w.seat.x-w.copaPos.x,w.seat.z-w.copaPos.z)}}
  return{working:false,pos:w.copaPos,face:Math.atan2(-10.2-w.copaPos.x,-5.6-w.copaPos.z),atCopa:true};
}
const ease=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;

function spawn(t){
  const w=workers[t.wid];
  const color=w.robot?SECT.AUTO.c:w.sect.c;
  const m=new THREE.Mesh(packetGeo,new THREE.MeshStandardMaterial({color,roughness:.45,emissive:color,emissiveIntensity:.18}));
  m.castShadow=true; m.position.copy(INBOX_POS); scene.add(m); t.mesh=m;
  t.state='flyIn'; t.f={from:INBOX_POS.clone(),to:queuePos(w,w.queue.length),t0:sim,dur:5,h:3.2};
  inboxPulse=1;
  feed(`Nova demanda: ${t.title} <span style="color:var(--txt3)">→ ${w.name}</span>`, w.robot?'auto':'');
}
function queuePos(w,i){return w.qBase.clone().add(new THREE.Vector3(0,0.23+i*0.46,0))}
function startTask(w,t){
  w.active=t; t.state='active'; t.started=sim;
  waitSum+=sim-t.at; waitN++;
  t.f={from:t.mesh.position.clone(),to:w.aPos.clone(),t0:sim,dur:2,h:0.8};
  if(!w.robot)feed(`${w.name} começou: ${t.title}`);
}
function finishTask(w,t){
  w.active=null; w.doneCount++; t.state='flyOut';
  const slot=shelfSlot(doneSlots++);
  t.f={from:t.mesh.position.clone(),to:slot,t0:sim,dur:5,h:3.5};
  if(w.robot){savedMin+=t.manual-t.dur;feed(`Robô concluiu: ${t.title} em ${fmtD(t.dur)} (à mão levaria ${fmtD(t.manual)})`,'auto')}
  else feed(`${w.name} concluiu: ${t.title} <span style="color:var(--txt3)">(${fmtD(sim-t.started)})</span>`);
}

let inboxPulse=0;
function step(dSim){
  const prev=sim; sim=Math.min(DAY_END,sim+dSim);
  BREAKS.forEach(b=>{if(prev<b.s&&sim>=b.s)feed(b.label,'brk');if(prev<b.e&&sim>=b.e)feed(b.back,'brk')});
  while(nextTask<tasks.length&&tasks[nextTask].at<=sim)spawn(tasks[nextTask++]);
  for(const t of tasks){
    if(t.state==='flyIn'&&sim-t.f.t0>=t.f.dur){const w=workers[t.wid];t.state='queued';w.queue.push(t)}
    if(t.state==='flyOut'&&sim-t.f.t0>=t.f.dur){t.state='done';t.mesh.position.copy(t.f.to)}
  }
  for(const w of Object.values(workers)){
    const ps=personState(w,sim);
    if(!w.active&&w.queue.length&&ps.working&&!ps.walking)startTask(w,w.queue.shift());
    if(w.active&&ps.working&&!ps.walking){
      w.active.prog+=dSim/w.active.dur;
      if(w.active.prog>=1){w.active.prog=1;finishTask(w,w.active)}
    }
  }
  if(sim>=DAY_END&&!finished){finished=true;endDay()}
}

function endDay(){
  feed('Fim do expediente','brk');
  const done=tasks.filter(t=>t.state==='done'||t.state==='flyOut').length;
  const autos=tasks.filter(t=>t.wid==='robo');
  const manual=autos.reduce((a,t)=>a+t.manual,0), auto=autos.reduce((a,t)=>a+t.dur,0);
  $('s1').textContent=done; $('s2').textContent=autos.length;
  $('sumtxt').textContent=`A equipe fechou o dia com ${done} demandas concluídas. As ${autos.length} tarefas repetitivas ficaram com o Robô JR Dev e liberaram ${fmtD(manual-auto)} da equipe para o que precisa de gente.`;
  $('c1').style.width='100%'; $('c2').style.width=Math.max(3,auto/manual*100)+'%';
  $('c1t').textContent=fmtD(manual); $('c2t').textContent=fmtD(auto);
  setTimeout(()=>{$('summary').classList.add('show')},900);
  playing=false; syncPlay();
}

function arc(f,k){const p=f.from.clone().lerp(f.to,k);p.y+=Math.sin(Math.PI*k)*f.h;return p}

function updateVisuals(dt,now){
  for(const t of tasks){
    if(!t.mesh)continue;
    if(t.state==='flyIn'||t.state==='flyOut'||(t.state==='active'&&sim-t.f.t0<t.f.dur)){
      const k=Math.min(1,(sim-t.f.t0)/t.f.dur);t.mesh.position.copy(arc(t.f,ease(k)));t.mesh.rotation.y+=dt*4;
    }
    if(t.state==='active'&&sim-t.f.t0>=t.f.dur){
      const w=workers[t.wid];t.mesh.position.copy(w.aPos);t.mesh.position.y+=Math.sin(now*3)*0.06;t.mesh.rotation.y+=dt*(w.robot?6:1.2);
      const s=1+0.08*Math.sin(now*6);t.mesh.scale.setScalar(s);
    } else t.mesh.scale.setScalar(1);
    if(t.state==='done')t.mesh.rotation.y*=0.9;
  }
  for(const w of Object.values(workers)){
    w.queue.forEach((t,i)=>{t.mesh.position.lerp(queuePos(w,i),1-Math.exp(-dt*10));t.mesh.rotation.y*=0.92});
    const ps=personState(w,sim); const busy=!!w.active&&ps.working&&!ps.walking;
    if(!w.robot){
      w.person.position.copy(ps.pos);
      const targetRot=ps.face;w.person.rotation.y=targetRot;
      const bob=ps.walking?Math.abs(Math.sin(now*10))*0.12:(busy?Math.sin(now*14)*0.025:0);
      w.body.position.y=0.95+bob; w.head.position.y=1.62+bob+(busy?Math.sin(now*2)*0.02:0);
      w.screen.emissiveIntensity+=((busy?0.9:(ps.working?0.2:0.03))-w.screen.emissiveIntensity)*Math.min(1,dt*5);
    } else {
      w.ring.rotation.z+=dt*(busy?8:0.6); w.ring.material.emissiveIntensity=busy?1.4:0.5;
      w.leds.forEach((m,i)=>{const on=busy?Math.random()<0.5:((Math.floor(now*1.5)+i)%7===0);m.emissiveIntensity+=((on?1.4:0.08)-m.emissiveIntensity)*0.35});
    }
    let txt,pct=0;
    const away=!ps.working?(ps.back?'Voltando para a mesa':ps.walking?'A caminho da copa':(inBreak(sim).e-inBreak(sim).s>30?'No almoço':'No café')):'';
    if(w.active){pct=w.active.prog;txt=(away?away+' · pausou ':'')+w.active.title+' · '+Math.round(pct*100)+'%'}
    else if(away)txt=away;
    else if(w.queue.length)txt='Pegando a próxima';
    else txt=w.robot?'Aguardando demandas':'Livre';
    if(!w.active&&!ps.working&&w.queue.length)txt+=' · '+w.queue.length+' na fila';
    w.tagObj.visible=!!ps.working;
    if(lastTxt[w.id]!==txt){lastTxt[w.id]=txt;w.tagT2.textContent=txt;w.rowSt.textContent='· '+txt}
    w.tagBar.style.width=(pct*100)+'%'; w.rowBar.style.width=(pct*100)+'%';
    const q=w.queue.length+tasks.filter(t=>t.state==='flyIn'&&t.wid===w.id).length;
    const qt=(q?q+' na fila · ':'')+w.doneCount+(w.doneCount===1?' feita':' feitas');
    if(w.rowQ.textContent!==qt)w.rowQ.textContent=qt;
  }
  inboxPulse=Math.max(0,inboxPulse-dt*1.5);
  inboxGlow.material.emissiveIntensity=0.35+inboxPulse*1.6;
}

function updateHud(){
  $('clock').textContent=fmtT(sim);
  const b=inBreak(sim);
  $('period').textContent=finished?'Expediente encerrado':b?b.label:sim<T(12,0)?'Manhã':'Tarde';
  $('daybar').style.width=((sim-DAY_START)/(DAY_END-DAY_START)*100)+'%';
  const rec=tasks.filter(t=>t.state!=='pending').length;
  const que=tasks.filter(t=>t.state==='queued'||t.state==='flyIn').length;
  const act=tasks.filter(t=>t.state==='active').length;
  const done=tasks.filter(t=>t.state==='done'||t.state==='flyOut').length;
  const au=tasks.filter(t=>t.wid==='robo'&&(t.state==='done'||t.state==='flyOut')).length;
  $('mRec').textContent=rec;$('mQue').textContent=que;$('mAct').textContent=act;$('mDone').textContent=done;$('mAuto').textContent=au;
  $('mWait').textContent=fmtD(waitN?waitSum/waitN:0);$('mSaved').textContent=fmtD(savedMin);
}

function syncPlay(){
  $('play').textContent=playing?'Pausar':(finished?'Encerrado':'Continuar');
  $('live').classList.toggle('off',!playing);
  $('live').lastChild.textContent=playing?'ao vivo':'pausado';
}
$('play').onclick=()=>{if(finished)return;playing=!playing;syncPlay()};
$('reset').onclick=reset; $('again').onclick=reset;
document.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{speed=+b.dataset.sp;document.querySelectorAll('[data-sp]').forEach(x=>x.classList.toggle('on',x===b))});

function resize(){
  const w=stage.clientWidth,h=stage.clientHeight,a=w/h;
  const H=Math.max(15.5,28.5/a);
  cam.left=-H*a/2;cam.right=H*a/2;cam.top=H/2;cam.bottom=-H/2;cam.updateProjectionMatrix();
  renderer.setSize(w,h);labelR.setSize(w,h);
}
new ResizeObserver(resize).observe(stage);
resize(); reset();

const clock=new THREE.Clock();
renderer.setAnimationLoop(()=>{
  const dt=Math.min(clock.getDelta(),0.1),now=clock.elapsedTime;
  if(playing&&!finished){
    let d=dt/SEC_PER_MIN*speed;
    while(d>0){const s=Math.min(d,1);step(s);d-=s}
  }
  updateVisuals(dt,now); updateHud();
  controls.update(); renderer.render(scene,cam); labelR.render(scene,cam);
});
