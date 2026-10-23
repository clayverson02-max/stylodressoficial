import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import type { quizMedia } from '@/data/sosQuiz';
type Clip = typeof quizMedia.choro | typeof quizMedia.colica | typeof quizMedia.gases | typeof quizMedia.imprevistos;

/** One media coordinator for the quiz: at most one preview plays, even when cards overlap. */
const previews = new Set<HTMLVideoElement>();
export function QuizClip({clip, label=clip.label}: {clip: Clip; label?:string}) {
  const video=useRef<HTMLVideoElement>(null);
  const frame=useRef<HTMLDivElement>(null);
  const [visible,setVisible]=useState(false);
  const [sound,setSound]=useState(false);
  const [blocked,setBlocked]=useState(false);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const node=frame.current;
    if(!node)return;
    if(!('IntersectionObserver' in window)){setVisible(true);return;}
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:.15});
    observer.observe(node);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const element=video.current;if(!element)return;
    previews.add(element);
    const sync=()=>{
      if(!visible||document.hidden||document.body.classList.contains('vsl-is-open')){element.pause();return;}
      for(const other of previews)if(other!==element)other.pause();
      element.muted=!sound;
      void element.play().then(()=>setBlocked(false)).catch(()=>setBlocked(true));
    };
    sync();document.addEventListener('visibilitychange',sync);document.addEventListener('sos-vsl-state',sync);
    return()=>{element.pause();previews.delete(element);document.removeEventListener('visibilitychange',sync);document.removeEventListener('sos-vsl-state',sync);};
  },[visible,sound,clip.src]);
  const toggle=()=>{const next=!sound;setSound(next);const el=video.current;if(el){el.muted=!next;for(const other of previews)if(other!==el)other.pause();void el.play().catch(()=>setBlocked(true));}};
  return <div className="sq-phone" ref={frame}>
    <video ref={video} src={visible?clip.src:undefined} poster={clip.poster} width={480} height={854} preload="none" muted={!sound} playsInline loop autoPlay={visible} onClick={toggle} onError={()=>setFailed(true)} aria-label={`Prévia: ${label}`}/>
    <button className="sq-sound" type="button" onClick={toggle} aria-pressed={sound}>{sound?<Volume2 size={20}/>:<VolumeX size={20}/>} {blocked?'Tocar para assistir':sound?'Som ligado':'Toque para ouvir'}</button>
    {failed&&<p className="sq-media-error">O vídeo não carregou. Você pode continuar.</p>}
  </div>;
}
