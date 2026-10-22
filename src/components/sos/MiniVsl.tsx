import { useEffect, useRef, useState } from "react";
import { Play, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { sosMedia } from "@/data/sosMedia";
import { trackCustom } from "@/lib/metaPixel";
import { scrollToSection } from "@/lib/scrollToOffer";

const COMPLETED_KEY = "sos-vsl-complete-v1";
const safeTrack = (event: string) => { try { trackCustom(event, { video: "sos-bebe-vsl" }); } catch { /* Analytics must not affect playback. */ } };

export function MiniVsl() {
  const [open, setOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  const [safetyExit, setSafetyExit] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const sent = useRef(new Set<string>());
  const lastAllowed = useRef(0);
  const lastProgress = useRef(0);
  const restoring = useRef(false);

  useEffect(() => {
    if (!open) return;
    // Radix locks document scrolling; fixed content also accounts for the dynamic mobile viewport.
    document.body.classList.add("vsl-is-open");
    document.dispatchEvent(new Event("sos-vsl-state"));
    const elementAtOpen = video.current;
    lastProgress.current = performance.now();
    const watchdog = window.setInterval(() => {
      if (!document.hidden && !complete && performance.now() - lastProgress.current >= 8000) setSafetyExit(true);
    }, 500);
    const resume = () => {
      if (document.hidden || complete) return;
      lastProgress.current = performance.now();
      const element = video.current;
      if (element?.paused) void element.play().catch(() => { setNeedsPlay(true); setSafetyExit(true); });
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    return () => {
      clearInterval(watchdog);
      elementAtOpen?.pause();
      document.body.classList.remove("vsl-is-open");
      document.dispatchEvent(new Event("sos-vsl-state"));
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
    };
  }, [open, complete]);

  const startPlayback = () => {
    const element = video.current;
    if (!element) return;
    element.muted = false;
    element.volume = 1;
    element.playbackRate = 1;
    void element.play().then(() => setNeedsPlay(false)).catch(() => { setNeedsPlay(true); });
  };
  const openVideo = () => {
    setComplete(false); setSafetyExit(false); setNeedsPlay(false);
    lastAllowed.current = 0;
    setOpen(true);
  };
  const closeVideo = () => { video.current?.pause(); setOpen(false); };
  const mark = (event: string) => { if (!sent.current.has(event)) { sent.current.add(event); safeTrack(event); } };
  const finish = () => {
    mark("VSL_Complete"); setComplete(true);
    try { sessionStorage.setItem(COMPLETED_KEY, "1"); } catch { /* Playback still completes without storage. */ }
    if (progress.current) progress.current.style.transform = "scaleX(1)";
  };
  return <>
    <div className="vsl-intro">
      <button className="vsl-card" type="button" onClick={openVideo} aria-label={`Assistir agora à apresentação de ${sosMedia.vsl.durationLabel}`} style={{ aspectRatio: sosMedia.vsl.aspectRatio }}>
        <video poster={sosMedia.vsl.poster} src={sosMedia.vsl.src} preload="metadata" playsInline muted width={480} height={854} tabIndex={-1} aria-hidden="true"/>
        <span className="vsl-shade"/>
        <span className="vsl-card-copy"><span className="vsl-play-circle"><Play fill="currentColor" size={42}/></span><strong>▶ ASSISTIR AGORA · {sosMedia.vsl.durationLabel}</strong></span>
      </button>
      <p>Assista até o final. O vídeo abre em tela cheia. <strong>🔊 Ative o som.</strong></p>
    </div>
    <Dialog.Root open={open} onOpenChange={next => { if (!next) closeVideo(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="vsl-backdrop"/>
        <Dialog.Content className="vsl-fullscreen" aria-modal="true" onOpenAutoFocus={event=>{event.preventDefault();video.current?.focus();startPlayback();}} onEscapeKeyDown={event=>{
          // Keep an emergency keyboard exit for accessibility, even before the on-screen close appears.
          event.preventDefault(); closeVideo();
        }} onPointerDownOutside={event=>event.preventDefault()} onInteractOutside={event=>event.preventDefault()} onContextMenu={event=>event.preventDefault()}>
          <Dialog.Title className="sr-only">Apresentação SOS Bebê</Dialog.Title>
          <Dialog.Description className="sr-only">Vídeo com som. Use o botão no alto da tela ou a tecla Escape para sair a qualquer momento.</Dialog.Description>
          <button type="button" className="vsl-close vsl-close--subtle" onClick={closeVideo} aria-label="Fechar vídeo" title="Fechar vídeo"><X size={18}/></button>
          {complete ? <div className="vsl-end"><h2>Você chegou até o final. Continue conhecendo o SOS Bebê.</h2><button type="button" className="sos-cta vsl-reading-cta" onClick={()=>{closeVideo();window.setTimeout(()=>scrollToSection("continuar-leitura"),30);}}>Continuar vendo a página →</button></div> : <>
            <video ref={video} className="vsl-playing" src={sosMedia.vsl.src} poster={sosMedia.vsl.poster} preload="metadata" playsInline autoPlay disablePictureInPicture disableRemotePlayback controlsList="nodownload noplaybackrate noremoteplayback" tabIndex={0} aria-label="Vídeo de apresentação SOS Bebê" onContextMenu={event=>event.preventDefault()} onKeyDown={event=>{if ([" ","ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End","k","j","l"].includes(event.key)) event.preventDefault();}} onPlay={()=>{setNeedsPlay(false);mark("VSL_Play");}} onPlaying={()=>{setNeedsPlay(false);lastProgress.current=performance.now();}} onPause={()=>{
              const element=video.current;
              if (element&&!element.ended&&!document.hidden) void element.play().catch(()=>{setNeedsPlay(true);});
            }} onTimeUpdate={()=>{
              const element=video.current;
              if (!element || element.seeking || !Number.isFinite(element.duration) || element.duration<=0) return;
              if(element.currentTime>lastAllowed.current) lastProgress.current=performance.now();
              lastAllowed.current=element.currentTime;
              const ratio=Math.min(1,element.currentTime/element.duration);
              if(progress.current) progress.current.style.transform=`scaleX(${ratio})`;
              for(const threshold of [25,50,75]) if(ratio>=threshold/100) mark(`VSL_${threshold}`);
            }} onSeeking={()=>{
              const element=video.current;
              if(!element||restoring.current)return;
              if(Math.abs(element.currentTime-lastAllowed.current)>1){restoring.current=true;element.currentTime=lastAllowed.current;}
            }} onSeeked={()=>{restoring.current=false;}} onRateChange={()=>{if(video.current&&video.current.playbackRate!==1)video.current.playbackRate=1;}} onEnded={finish} onError={()=>setSafetyExit(true)}/>
            {needsPlay&&<button type="button" className="vsl-retry" onClick={startPlayback}><Play size={38}/>TOCAR PARA INICIAR COM SOM</button>}
            {safetyExit&&<p className="vsl-safety" role="status">O vídeo está com dificuldade para carregar. Você pode fechar e continuar na página.</p>}
          </>}
          <div className="vsl-progress" aria-hidden="true"><div ref={progress}/></div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
