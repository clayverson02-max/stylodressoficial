import { trackCustom, trackStandard } from './metaPixel';
import type { Answers, Step } from '@/data/sosQuiz';
export function safeQuizTrack(name:string,data?:Record<string,unknown>,standard=false) {
  try { if(standard)trackStandard(name,data);else trackCustom(name,data); }catch{/* Tracking cannot block navigation. */}
}
const memory=new Set<string>();
export function onceQuiz(key:string,callback:()=>void) {
  const id=`sos-quiz-tracked-v1-${key}`;
  try { if(sessionStorage.getItem(id))return; sessionStorage.setItem(id,'1'); }catch{if(memory.has(id))return;memory.add(id);}
  callback();
}
export const answersForStorage=(step:Step,answers:Answers)=>({version:1,step,answers});
