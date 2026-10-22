import { useEffect, useRef, useState } from "react";
import { HandHeart, Play, ShieldCheck, Soup, Volume2, VolumeX } from "lucide-react";
import { sosMedia } from "@/data/sosMedia";
import { OfferLink } from "./OfferLink";

export function SituationVideos() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [sound, setSound] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const interacted = useRef(false);
  const visibleRef = useRef(false);
  const clip = sosMedia.situations[active];

  useEffect(() => {
    const node = section.current;
    if (!node || !("IntersectionObserver" in window)) { visibleRef.current = true; setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      setVisible(entry.isIntersecting);
    }, { threshold: .12 });
    observer.observe(node); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let cancelled = false;
    const sync = () => {
      const modalOpen = !!document.querySelector(".vsl-fullscreen");
      if (visible && !document.hidden && !modalOpen) {
        element.muted = !sound;
        void element.play().catch(() => { if (!cancelled) setBlocked(true); });
      } else element.pause();
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("sos-vsl-state", sync);
    return () => { cancelled = true; element.pause(); document.removeEventListener("visibilitychange", sync); document.removeEventListener("sos-vsl-state", sync); };
  }, [active, visible, sound]);
  const choose = (index: number) => {
    interacted.current = true;
    setFailed(false); setBlocked(false);
    if (index === active) {
      const element = video.current;
      if (element) { element.loop = true; void element.play().catch(() => setBlocked(true)); }
      return;
    }
    video.current?.pause();
    setActive(index);
  };
  const toggleSound = () => {
    interacted.current = true;
    const next = !sound;
    setSound(next);
    if (video.current) { video.current.muted = !next; void video.current.play().catch(() => setBlocked(true)); }
  };
  return <section className="section" ref={section} id="situacoes"><div className="wrap reveal">
    <header className="section-title"><span className="eyebrow">Escolha. Assista. Faça.</span><h2>Abriu. Viu. Fez.</h2></header>
    <div className="steps">{["Escolha a situação", "Assista ao vídeo", "Faça com mais segurança"].map((text,i)=><div key={text}><b>0{i+1}</b><span>{text}</span></div>)}</div>
    <div className="situation-demo">
      <div className="chips" role="tablist" aria-label="Situações do guia">{sosMedia.situations.map((item,i)=><button key={item.id} role="tab" type="button" id={`situation-${i}`} aria-selected={active===i} aria-controls="situation-content" tabIndex={active===i?0:-1} onClick={()=>choose(i)} onKeyDown={event=>{
        if (!["ArrowRight","ArrowLeft","Home","End"].includes(event.key)) return;
        event.preventDefault();
        const count=sosMedia.situations.length;
        const next=event.key==="Home"?0:event.key==="End"?count-1:(i+(event.key==="ArrowRight"?1:count-1))%count;
        choose(next); document.getElementById(`situation-${next}`)?.focus();
      }}>{item.label}</button>)}</div>
      <div className="situation-card" role="tabpanel" id="situation-content" aria-labelledby={`situation-${active}`}>
        <div>
          <div className="clip-phone">
            <video key={clip.id} ref={video} src={visible?clip.src:undefined} poster={clip.poster} preload="none" muted={!sound} playsInline autoPlay={visible} loop={interacted.current} width={480} height={854} onContextMenu={e=>e.preventDefault()} onError={()=>setFailed(true)} onPlaying={()=>setBlocked(false)} onEnded={()=>{
              if (interacted.current && visibleRef.current && video.current) { video.current.currentTime = 0; void video.current.play().catch(() => setBlocked(true)); }
              else if (visibleRef.current) { setSound(false); setActive(index=>(index+1)%sosMedia.situations.length); setFailed(false); }
            }} onClick={toggleSound} aria-label={`Prévia: ${clip.label}`}/>
            <button type="button" className="clip-sound" onClick={toggleSound} aria-label={blocked?"Reproduzir prévia":sound?"Desativar som da prévia":"Ativar som da prévia"} aria-pressed={sound}>{sound?<Volume2/>:<VolumeX/>}<span>{blocked?"Tocar para assistir":sound?"Som ligado":"Toque para ouvir"}</span></button>
            {failed&&<p className="clip-error" role="status">Não foi possível carregar este vídeo. Escolha outra situação.</p>}
          </div>
          <p className="clip-caption">{clip.caption}</p>
        </div>
        <div><span className="eyebrow">Organização por situação</span><h3>{clip.label}</h3><ul className="icon-list"><li><Play/>Vídeo passo a passo</li><li><Soup/>Receita caseira de apoio</li><li><HandHeart/>Movimento para acalmar</li><li><ShieldCheck/>Cuidados e sinais de alerta</li></ul></div>
      </div>
      <p className="micro">Exemplo ilustrativo da organização da plataforma.</p>
    </div>
    <OfferLink location="after-selector"/>
  </div></section>;
}
