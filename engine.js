(function(root){
function calculate(text,ans=0,degrees=true,x=0){
 const raw=text.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/π/g,'pi').replace(/,/g,'.');
 const tokens=raw.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z]+|[+\-*/^()%!]/g)||[];
 if(tokens.join('')!==raw.replace(/\s/g,''))throw Error('Caractère non reconnu');
 let i=0;const peek=()=>tokens[i],take=()=>tokens[i++];const factor=degrees?Math.PI/180:1;
 const funcs={sqrt:Math.sqrt,abs:Math.abs,ln:Math.log,log:Math.log10,exp:Math.exp,floor:Math.floor,ceil:Math.ceil,sin:v=>Math.sin(v*factor),cos:v=>Math.cos(v*factor),tan:v=>{if(Math.abs(Math.cos(v*factor))<1e-14)throw Error('Tangente non définie');return Math.tan(v*factor)},asin:v=>Math.asin(v)/factor,acos:v=>Math.acos(v)/factor,atan:v=>Math.atan(v)/factor};
 function atom(){let t=take(),v;if(t==='('){v=sum();if(take()!==')')throw Error('Parenthèse manquante')}else if(Object.hasOwn(funcs,t)){if(take()!=='(')throw Error('Parenthèse attendue');v=funcs[t](sum());if(take()!==')')throw Error('Parenthèse manquante')}else if(t==='pi')v=Math.PI;else if(t==='e')v=Math.E;else if(t==='Ans')v=ans;else if(t==='x')v=x;else if(t&&/^\d|^\./.test(t))v=Number(t);else throw Error('Expression incomplète');while(peek()==='!'||peek()==='%'){if(take()==='%')v/=100;else{if(!Number.isInteger(v)||v<0||v>170)throw Error('Factorielle : entier de 0 à 170');let n=v;v=1;for(let k=2;k<=n;k++)v*=k}}return v}
 function power(){let v=atom();if(peek()==='^'){take();v=v**unary()}return v}function unary(){if(peek()==='+'){take();return unary()}if(peek()==='-'){take();return -unary()}return power()}
 function product(){let v=unary();while(i<tokens.length){let t=peek();if(t==='*'||t==='/'){take();let b=unary();if(t==='/'&&b===0)throw Error('Division par zéro');v=t==='*'?v*b:v/b}else if(t==='('||/^[A-Za-z\d.]/.test(t))v*=unary();else break}return v}function sum(){let v=product();while(peek()==='+'||peek()==='-'){let t=take(),b=product();v=t==='+'?v+b:v-b}return v}
 let value=sum();if(i!==tokens.length)throw Error('Expression incorrecte');if(!Number.isFinite(value))throw Error('Résultat non défini ou trop grand');return value;
}const api={calculate};if(typeof module!=='undefined')module.exports=api;else root.Calc=api;
})(globalThis);
