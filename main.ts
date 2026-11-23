import{mkdirSync,readdirSync,readFileSync,writeFileSync}from"node:fs";
import{join}from"node:path";
const I=new Int8Array(256).fill(-1),P=new Int8Array(256),Q=new Int8Array(256),d=(b,i,p,q)=>(I[b]=i,P[b]=p,Q[b]=q);
d(0,0,0,0);d(1,1,0,1);d(2,4,0,1);d(4,0,1,2);d(5,0,2,2);d(6,0,2,3);d(7,0,3,3);d(23,0,1,1);d(27,0,1,1);d(48,2,0,0);d(49,2,1,0);d(50,2,1,0);d(51,2,0,0);d(52,0,0,0);d(64,0,1,1);d(65,0,2,0);d(82,0,0,1);
for(const b of[3,80,81,83])d(b,0,1,0);
for(let b=16;b<35;b++)b!=23&&b!=27&&b!=31&&d(b,0,2,1);
function r(p,u){
const s=new Int32Array(256),c=new Int32Array(64),m=new Int32Array(256),o=new Uint8Array(65536);
let a=0,b=0,l=0,i=0,q=0,n=0;
const e=new TextEncoder(),f=x=>({o:o.slice(0,l),x});
for(;;){
if(n>=1e6)return f(10);
if(q<0||q>=p.length)return f(9);
const t=p[q],v=I[t];
if(v<0)return f(5);
if(q+v>=p.length)return f(9);
n++;
const k=q+1+v;
if(a<P[t])return f(2);
if(a-P[t]+Q[t]>256)return f(3);
q=k;
if(t>15&&t<35&&t!=23&&t!=27){
const y=s[a-1],x=s[a-2];let w;
if(t==16)w=x+y|0;
else if(t==17)w=x-y|0;
else if(t==18)w=Math.imul(x,y);
else if(t==19){if(!y)return f(4);w=x/y|0;}
else if(t==20){if(!y)return f(4);w=y==-1?0:x%y|0;}
else if(t==21){if(!y)return f(4);w=Math.floor((x>>>0)/(y>>>0))|0;}
else if(t==22){if(!y)return f(4);w=(x>>>0)%(y>>>0)|0;}
else if(t==24)w=x&y;
else if(t==25)w=x|y;
else if(t==26)w=x^y;
else if(t==28)w=x<<(y&31);
else if(t==29)w=x>>(y&31);
else if(t==30)w=x>>>(y&31)|0;
else if(t==32)w=x==y?1:0;
else if(t==33)w=x<y?1:0;
else w=(x>>>0)<(y>>>0)?1:0;
a-=2;s[a++]=w;
}else switch(t){
case 0:return f(0);
case 1:s[a++]=(p[k-1]<<24)>>24;break;
case 2:s[a++]=p[k-4]|p[k-3]<<8|p[k-2]<<16|p[k-1]<<24;break;
case 3:a--;break;
case 4:s[a]=s[a-1];a++;break;
case 5:{const z=s[a-1];s[a-1]=s[a-2];s[a-2]=z;break;}
case 6:s[a]=s[a-2];a++;break;
case 7:{const z=s[a-3];s[a-3]=s[a-2];s[a-2]=s[a-1];s[a-1]=z;break;}
case 23:s[a-1]=-s[a-1]|0;break;
case 27:s[a-1]=~s[a-1];break;
case 48:case 49:case 50:{
const z=(p[k-2]|p[k-1]<<8)<<16>>16;
if(t==48){q=k+z;break;}
const v=s[--a];
if(t==49&&v==0||t==50&&v!=0)q=k+z;
break;}
case 51:
if(b>=64)return f(7);
c[b++]=k;q=p[k-2]|p[k-1]<<8;break;
case 52:
if(!b)return f(8);
q=c[--b];break;
case 64:{
const z=s[a-1];
if(z<0||z>255)return f(6);
s[a-1]=m[z];break;}
case 65:{
const z=s[a-1],v=s[a-2];
if(z<0||z>255)return f(6);
a-=2;m[z]=v;break;}
case 80:{
const z=e.encode(String(s[a-1]));
if(l+z.length>65536)return f(11);
a--;o.set(z,l);l+=z.length;break;}
case 81:
if(l+1>65536)return f(11);
o[l++]=s[--a]&255;break;
case 82:s[a++]=i<u.length?u[i++]:-1;break;
case 83:return f(s[--a]&255);
default:return f(5);
}}}
const A=process.env.MAKEFUN_INPUT_DIR??"/input",B=process.env.MAKEFUN_OUTPUT_DIR??"/output";
for(const t of readdirSync(A,{withFileTypes:!0}).sort((x,y)=>x.name<y.name?-1:1)){
if(!t.isDirectory())continue;
const g=r(readFileSync(join(A,t.name,"program.bin")),readFileSync(join(A,t.name,"input.bin"))),o=join(B,t.name);
mkdirSync(o,{recursive:!0});
writeFileSync(join(o,"stdout.bin"),g.o);
writeFileSync(join(o,"exit.txt"),g.x+"\n");
}
