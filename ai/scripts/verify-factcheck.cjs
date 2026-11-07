const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=n=>fs.readFileSync(path.join(root,'chapters',n+'.html'),'utf8');
function section(s,a,b){const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i);return s.slice(i,j);}
let scripts=0;for(const n of fs.readdirSync(path.join(root,'chapters'))){const s=fs.readFileSync(path.join(root,'chapters',n),'utf8');for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){if(/src\s*=/.test(m[1])||!m[2].trim())continue;if(/application\/ld\+json/.test(m[1]))JSON.parse(m[2]);else{new vm.Script(m[2],{filename:n});scripts++;}}}
const c=vm.createContext({});vm.runInContext(section(read('generation'),'  function decodeStep(cands, hist, o)','  function pick('),c);
function reference(cands,hist,o){let a=cands.map(x=>({w:x.w,logit:hist.includes(x.w)&&o.rep>1?(x.logit>0?x.logit/o.rep:x.logit*o.rep):x.logit})).sort((x,y)=>y.logit-x.logit);if(o.k>0)a=a.slice(0,o.k);const probs=()=>{const m=a[0].logit,e=a.map(x=>Math.exp((x.logit-m)/Math.max(o.T,1e-3))),sum=e.reduce((s,x)=>s+x,0);return e.map(x=>x/sum);};if(o.p<1){let cum=0,n=0;for(const p of probs()){if(cum>=o.p)break;cum+=p;n++;}a=a.slice(0,n);}if(o.minp>0){const p=probs();a=a.filter((x,i)=>p[i]>=o.minp*p[0]);}const p=probs();return new Map(a.map((x,i)=>[x.w,p[i]]));}
const special=[.4,.3,.2,.1].map((p,i)=>({w:String(i),logit:Math.log(p)}));assert.deepEqual(Array.from(c.decodeStep(special,[],{T:1,k:2,p:.5,minp:0,rep:1}).filter(x=>x.keep).map(x=>x.w)),['0']);
let decodeCases=0;
for(let seed=1;seed<=40;seed++){const cand=Array.from({length:8},(_,i)=>({w:String(i),logit:Math.sin(seed*17+i*31)*7+i*.013}));for(const k of [0,1,2,4,8])for(const p of [.05,.5,.9,1])for(const minp of [0,.1,.6])for(const T of [.2,1,2]){const o={T,k,p,minp,rep:2},hist=['1','4'],got=c.decodeStep(cand,hist,o),expected=reference(cand,hist,o);assert(Math.abs(got.reduce((s,x)=>s+x.p,0)-1)<1e-12);for(const x of got)assert(Math.abs(x.p-(expected.get(x.w)||0))<1e-12);decodeCases++;}}
// Build representable positive values directly from sign/exponent/mantissa bit
// fields; binary-search adjacent codes and use raw-code parity at exact midpoint.
const q=vm.createContext({});vm.runInContext(section(read('quantization'),'  var E2M1 =','  var FN ='),q);
function values(m,bias,lastExp,lastFrac){const out=[];for(let e=0;e<=lastExp;e++)for(let f=0;f<=(e===lastExp?lastFrac:2**m-1);f++)out.push({v:e===0?2**(1-bias)*f/2**m:2**(e-bias)*(1+f/2**m),code:e*2**m+f});return out;}
function nearest(x,vs){const a=Math.abs(x),sg=x<0?-1:1;let l=0,h=vs.length-1;while(l<h){const m=(l+h)>>1;if(vs[m].v<a)l=m+1;else h=m;}const upper=vs[l];if(l===0)return sg*upper.v;const lower=vs[l-1],dl=a-lower.v,du=upper.v-a;return sg*(dl<du||(dl===du&&lower.code%2===0)?lower.v:upper.v);}
let codecCases=0;
for(const [name,vs] of [['qE2M1',values(1,1,3,1)],['qE4M3',values(3,7,15,6)],['qFP16',values(10,15,30,1023)]]){for(let i=1;i<vs.length;i++){const mid=(vs[i-1].v+vs[i].v)/2,delta=Math.max(Number.MIN_VALUE,Math.abs(mid)*Number.EPSILON);for(const x of [vs[i].v,mid-delta,mid,mid+delta])for(const sign of [1,-1]){assert.equal(q[name](sign*x),nearest(sign*x,vs),name+' '+sign*x);codecCases++;}}}
assert.equal(q.qE2M1(.25+1e-13),.5);assert.equal(q.qE2M1(.25-1e-13),0);
let tensorCases=0;
for(const N of [32,128,512,1024])for(const scale of [.01,1,137]) {
  const x=Array.from({length:N},(_,i)=>Math.sin(i*1.7)*scale),got=q.quantNV(x);
  assert.equal(got.bits,(N*4+(N/16)*8+32)/N);
  assert.equal(got.tensorScale,Math.fround(Math.max(...x.map(Math.abs))/(6*448)));
  assert(got.y.every(Number.isFinite));tensorCases++;
}
console.log(JSON.stringify({inlineScripts:scripts,decodeCases,codecCases,tensorCases}));
