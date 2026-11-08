// Interface indépendante : les inscriptions suivent la référence photographique.
const originalButtons=new Map([...document.querySelectorAll('#keys button')].map(b=>[b.textContent.trim(),b.onclick]));
let second=false,alpha=false,storing=false,powered=true,memory=0,undo='',overwrite=false;
const vars={A:0,B:0,C:0,D:0,E:0,F:0,x:0,y:0,M:0};
const status=document.querySelector('.status span:last-child');
function refreshModes(){status.textContent=!powered?'':storing?'STO → variable':second?'S · SECONDE':alpha?'A · ALPHA':'CALCUL';document.querySelector('.calc').classList.toggle('shifted',second);document.querySelector('.calc').classList.toggle('alpha-mode',alpha);document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode==='second'?second:alpha)))}
function message(text){$('result').textContent=text;$('result').classList.add('notice')}
function toolPanel(mode){if(mode){$('tool').value=mode;$('tool').onchange()}const d=document.querySelector('.card details');d.open=true;d.scrollIntoView({behavior:'smooth',block:'center'})}
function value(){return input.value?Calc.calculate(input.value,ans,deg):ans}

function primeDecomposition(n){
 if(!Number.isSafeInteger(n)||n<2)throw Error('Décomp : entier supérieur ou égal à 2');
 if(n>1e12)throw Error('Décomp : maximum 1 000 000 000 000');
 const factors=[];
 const superscript=k=>String(k).replace(/\d/g,d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
 for(let d=2;d*d<=n;d=d===2?3:d+2){
  let count=0;while(n%d===0){n/=d;count++}
  if(count)factors.push(String(d)+(count>1?superscript(count):''));
 }
 if(n>1)factors.push(String(n));
 return factors.join(' × ');
}
function decomposeOnScreen(){
 const n=value(), decomposition=primeDecomposition(n);
 ans=n;fraction=false;
 $('result').textContent=decomposition;
 input.focus();
}

function put(s){undo=input.value;if(overwrite&&input.selectionStart===input.selectionEnd&&input.selectionStart<input.value.length)input.setSelectionRange(input.selectionStart,input.selectionStart+1);insert(s)}
function variable(name){if(storing){vars[name]=value();if(name==='M')memory=vars.M;storing=false;message(name+' = '+fmt(vars[name]))}else put('('+vars[name]+')')}
function clear(){undo=input.value;input.value='';$('result').textContent='0'}
function off(){powered=false;input.value='';input.disabled=true;$('result').textContent='';$('angle').textContent='';refreshModes()}
function on(){powered=true;input.disabled=false;second=alpha=storing=false;clear();$('angle').textContent=deg?'DEG':'RAD';refreshModes()}
function runAction(action){if(!powered)return;try{$('result').classList.remove('notice');if(typeof action==='string')put(action);else action()}catch(e){message(e.message)}}
function key(label,normal,shift,letter){const b=document.createElement('button');b.textContent=label;b.title=label;b.onmousedown=e=>e.preventDefault();b.onclick=()=>{const action=alpha&&letter?()=>variable(letter):second?(shift||(()=>message('Fonction secondaire non disponible'))):normal;runAction(action);second=alpha=false;refreshModes()};return b}
function cell(label,gold,red,normal,shift,letter,cls=''){const w=document.createElement('div');w.className='key-cell '+cls;const l=document.createElement('div');l.className='legend';const g=document.createElement('span');g.textContent=gold||'\u00a0';const r=document.createElement('span');r.className='red';r.textContent=red||'';l.append(g,r);const b=key(label,normal,shift,letter);b.setAttribute('aria-label',label);b.title=[label,gold?'SECONDE : '+gold:'',red?'ALPHA : '+red:''].filter(Boolean).join(' · ');w.append(l,b);return w}
const controls=document.createElement('div');controls.className='controls';
function round(caption,action,mode){const w=document.createElement('div');w.className='round-wrap '+(mode||'');const s=document.createElement('small');s.textContent=caption;const b=document.createElement('button');b.setAttribute('aria-label',caption);b.title=caption;b.onmousedown=e=>e.preventDefault();b.onclick=action;if(mode){b.dataset.mode=mode;b.setAttribute('aria-pressed','false')}w.append(s,b);controls.append(w)}
round('SECONDE',()=>{if(powered){second=!second;alpha=false;refreshModes()}},'second');round('ALPHA',()=>{if(powered){alpha=!alpha;second=false;refreshModes()}},'alpha');
const pad=document.createElement('div');pad.className='pad';for(const [cls,label,move]of [['up','Début de l’expression',()=>0],['left','Déplacer à gauche',()=>Math.max(0,input.selectionStart-1)],['right','Déplacer à droite',()=>Math.min(input.value.length,input.selectionEnd+1)],['down','Fin de l’expression',()=>input.value.length]]){const b=document.createElement('button');b.className=cls;b.setAttribute('aria-label',label);b.title=label;b.onmousedown=e=>e.preventDefault();b.onclick=()=>{if(powered){const p=move();input.focus();input.setSelectionRange(p,p)}};pad.append(b)}controls.append(pad);
round('MENU CONFIG',()=>{if(!powered)return;if(second){deg=!deg;$('angle').textContent=deg?'DEG':'RAD';second=false;refreshModes()}else toolPanel()});round('ON',on);
$('keys').before(controls);$('keys').replaceChildren();
const scientific=document.createElement('div');scientific.className='scientific';
const definitions=[
['OPTN','QR','',()=>toolPanel(),()=>message('QR : utilisez le lien du site')],
['x²','√','', '^2','sqrt('],
null,null,
['x³','³√','', '^3',()=>{const v=Math.cbrt(value());ans=v;$('result').textContent=fmt(v)}],
['xⁿ','ⁿ√','', '^','^(1/'],
['CALC','PGCD','',execute,()=>toolPanel('gcd')],
['y','PPCM','',()=>variable('y'),()=>toolPanel('gcd'),'y'],
['=','∶','',()=>message('Égalité : utilisez EXE pour calculer'),()=>message('Rapports : saisir a/b')],
['x','a ×10ⁿ','',()=>variable('x'),()=>{ans=value();$('result').textContent=ans.toExponential(6)},'x'],
['log','10ⁿ','','log(','10^'],['ln','eⁿ','','ln(','exp('],
['Simp','(−)','A',frac,'-','A'],
['├','Décomp','B',()=>toolPanel('euclid'),decomposeOnScreen,'B'],
['▰/▱','Abs','C','/','abs(','C'],
['sin','Arcsin','D','sin(','asin(','D'],['cos','Arccos','E','cos(','acos(','E'],['tan','Arctan','F','tan(','atan(','F'],
['STO','RECALL','',()=>{storing=true;alpha=true;message('STO : ALPHA puis A–F, x, y ou M')},()=>{alpha=true;message('Choisir A–F, x, y ou M')}],
['° ′ ″','←','',()=>{let v=value(),a=Math.abs(v),d=Math.floor(a),m=Math.floor((a-d)*60),s=((a-d)*60-m)*60;message((v<0?'−':'')+d+'° '+m+'′ '+fmt(s)+'″')},()=>message('Saisir degrés + minutes/60 + secondes/3600')],
['(','x⁻¹','','(','^(-1)'],[')','x!','',')','!'],
['S⇔D','a b/c','',frac,()=>{let v=value(),whole=Math.trunc(v);ans=v-whole;frac();$('result').textContent=whole+' + ('+$('result').textContent+')';ans=v}],
['M+','M−','M',()=>{memory+=value();vars.M=memory;message('M = '+fmt(memory))},()=>{memory-=value();vars.M=memory;message('M = '+fmt(memory))},'M']
];
for(const d of definitions){if(d)scientific.append(cell(...d));else{const space=document.createElement('div');space.className='key-spacer';scientific.append(space)}}
const numeric=document.createElement('div');numeric.className='numeric';
for(const d of [
['7','','','7'],['8','','','8'],['9','EFF','','9',()=>{memory=0;for(const k in vars)vars[k]=0;ans=0;clear()}],
['SUPPR','INS','UNDO',()=>{undo=input.value;originalButtons.get('DEL')()},()=>{overwrite=!overwrite;message(overwrite?'Saisie : remplacement':'Saisie : insertion')},null,'yellow'],
['AC','OFF','',clear,off,null,'yellow'],
['4','','','4'],['5','','','5'],['6','','','6'],['×','Ent','','*',()=>{ans=Math.floor(value());$('result').textContent=fmt(ans)}],['÷','EntEx','','/',()=>{ans=Math.trunc(value());$('result').textContent=fmt(ans)}],
['1','','','1'],['2','','','2'],['3','','','3'],['+','Pol','','+',()=>message('Pol : fonction non disponible')],['−','Rec','','-',()=>message('Rec : fonction non disponible')],
['0','Rnd','Arrond','0',()=>{ans=Number(value().toPrecision(10));$('result').textContent=fmt(ans)}],
[',','Ran#','RanInt','.',()=>put(String(Math.random()))],['×10ˣ','π','','*10^','pi',null,'smallkey'],
['Rép','%','Pré-Rép','Ans','%',null,'smallkey'],['EXE','≈','',execute,execute,null,'smallkey']]){const w=cell(...d);const b=w.querySelector('button');if(d[0]==='SUPPR'){const act=b.onclick;b.onclick=()=>{if(alpha){input.value=undo;alpha=false;refreshModes()}else act()}}if(d[0]==='0'){const act=b.onclick;b.onclick=()=>{if(alpha){ans=Math.round(value());$('result').textContent=fmt(ans);alpha=false;refreshModes()}else act()}}if(d[0]===','){const act=b.onclick;b.onclick=()=>{if(alpha){message('RanInt : utilisez floor(Ran# × n)');alpha=false;refreshModes()}else act()}}if(d[0]==='Rép'){const act=b.onclick;b.onclick=()=>{if(alpha){message('Calculs précédents : ouvrir l’historique');alpha=false;refreshModes();document.querySelector('#history').closest('details').open=true}else act()}}numeric.append(w)}
$('keys').append(scientific,numeric);const note=document.createElement('div');note.className='case-note';note.textContent='REPRODUCTION WEB INDÉPENDANTE';$('keys').after(note);refreshModes();
// STO et RECALL arment ALPHA pour la prochaine touche, sans effacer ce mode.
const sto=scientific.querySelectorAll('button')[16];
sto.onclick=()=>{if(!powered)return;if(second){storing=false;message('Rappel : choisir A–F, x, y ou M')}else{storing=true;message('Stockage : choisir A–F, x, y ou M')}second=false;alpha=true;refreshModes()};
