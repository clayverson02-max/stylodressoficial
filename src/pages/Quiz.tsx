import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowRight, Check, ShieldCheck, Play, BookOpen, Flower2, LoaderCircle, X, CalendarDays, Smartphone, Heart, Search, ListChecks, Wind, Utensils, LockKeyhole, CreditCard, Clock3, ChevronDown } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { birthOffer, offerIncludes } from "@/data/birthOffer";
import { beginBirthCheckout, checkoutDestination } from "@/lib/birthCheckout";
import { trackStandard } from "@/lib/metaPixel";

const MAIN_CTA = "QUIERO MI PREPARACIÓN COMPLETA POR US$ 4";
const checkoutUrl = birthOffer.checkout;

function CheckoutLink({ children = MAIN_CTA, location }: { children?: ReactNode; location: string }) {
  const pending = useRef(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const checkout = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;
    if (pending.current) { event.preventDefault(); return; }
    const destination = checkoutDestination(event.currentTarget.href, window.location.search);
    // Preserve the browser's native new-tab behavior on modified clicks.
    if (event.button === 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      beginBirthCheckout(destination, () => {});
      return;
    }
    event.preventDefault();
    pending.current = true;
    timer.current = beginBirthCheckout(destination, url => { pending.current = false; window.location.assign(url); });
  };
  return <a className="prep-cta" href={checkoutUrl} onClick={checkout} onAuxClick={event => { if (event.button === 1) checkout(event); }} data-checkout-cta={location}><span>{children}</span><ArrowRight size={21} aria-hidden="true" /></a>;
}

function PurchaseNote() {
  return <p className="prep-micro">Pago único de US$ 4,00 · Acceso tras confirmar el pago · Garantía de {birthOffer.guaranteeDays} días</p>;
}

function SectionTitle({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return <header className="prep-section-heading">{kicker && <p className="prep-kicker">{kicker}</p>}<h2>{children}</h2></header>;
}

function PhoneMockup() {
  return <figure className="prep-hero-visual">
    <img className="prep-hero-woman" src="/images/calm-mother.webp" alt="Mujer embarazada consultando su celular con tranquilidad" width={576} height={720} decoding="async" />
    <div className="prep-phone" aria-label="Vista ilustrativa de la organización de los contenidos">
      <div className="prep-phone-notch" />
      <div className="prep-phone-brand"><Flower2 size={20} aria-hidden="true" /><span>Mi preparación</span></div>
      <p className="prep-phone-welcome">Un momento para ti.</p>
      <strong>Tu contenido,<br />semana por semana.</strong>
      <div className="prep-phone-week"><CalendarDays size={16} aria-hidden="true" />Organizado por etapa</div>
      <div className="prep-phone-module"><span><Play size={18} aria-hidden="true" /></span><div><b>Ejercicios en video</b><small>Movimiento y preparación</small></div></div>
      <div className="prep-phone-module"><span><Utensils size={18} aria-hidden="true" /></span><div><b>Recetas caseras</b><small>Alimentación sin complicarte</small></div></div>
      <div className="prep-phone-module"><span><Wind size={18} aria-hidden="true" /></span><div><b>Relajación pélvica</b><small>Conecta con tu cuerpo</small></div></div>
      <div className="prep-phone-footer">Todo en un solo lugar.</div>
    </div>
    <figcaption>Vista ilustrativa de la organización del contenido.</figcaption>
  </figure>;
}

function useHalfPageView() {
  useEffect(() => {
    let sent = false;
    let frame = 0;
    const check = () => {
      frame = 0;
      const available = document.documentElement.scrollHeight - window.innerHeight;
      if (!sent && available > 0 && window.scrollY / available >= 0.5) {
        sent = true;
        try { trackStandard("ViewContent", { content_name: birthOffer.name, content_type: "product", value: 4, currency: "USD" }); } catch { /* Reading must remain available when analytics are blocked. */ }
      }
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(check); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    check();
    return () => { window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); window.cancelAnimationFrame(frame); };
  }, []);
}

function StickyMobileCheckout({ hero }: { hero: React.RefObject<HTMLElement> }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = hero.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0));
    observer.observe(element);
    return () => observer.disconnect();
  }, [hero]);
  if (!visible) return null;
  return <aside className="prep-sticky-buy" aria-label="Acceso a la preparación completa"><div><strong>US$ 4,00</strong><span>Pago único</span></div><CheckoutLink location="mobile-sticky">EMPEZAR HOY</CheckoutLink></aside>;
}

function DesktopExitOffer() {
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const exit = (event: globalThis.MouseEvent) => {
      if (!media.matches || shown.current || event.relatedTarget !== null || event.clientY > 0) return;
      try { if (sessionStorage.getItem("birth-exit-offer-v1")) return; } catch { /* Ref remains the fallback for this visit. */ }
      shown.current = true;
      try { sessionStorage.setItem("birth-exit-offer-v1", "shown"); } catch { /* Restricted storage must not affect navigation. */ }
      setOpen(true);
    };
    document.addEventListener("mouseout", exit);
    return () => document.removeEventListener("mouseout", exit);
  }, []);
  return <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className="prep-dialog-overlay" /><Dialog.Content className="prep-exit-dialog"><Dialog.Close className="prep-dialog-close" aria-label="Cerrar aviso"><X size={23} /></Dialog.Close><p className="prep-kicker">CADA SEMANA CUENTA</p><Dialog.Title>¡Espera! Tu preparación cuesta solo US$ 4,00.</Dialog.Title><Dialog.Description>No necesitas seguir buscando contenido por separado. Tu preparación completa te espera en un solo lugar.</Dialog.Description><CheckoutLink location="desktop-exit" /><p className="prep-micro">Pago único · Garantía de 7 días</p><Dialog.Close className="prep-dialog-dismiss">Seguir leyendo</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

const agitation = [
  { icon: Search, title: "Contenido suelto", text: "Rutinas que no sabes si son para tu etapa." },
  { icon: ListChecks, title: "Sin orden", text: "Empiezas, lo dejas y se te pasan las semanas." },
  { icon: Wind, title: "Sin técnicas de relajación", text: "El miedo y la tensión pueden hacerte sentir sin herramientas." },
  { icon: Utensils, title: "Sin plan de alimentación", text: "Más dudas para organizar tus comidas del día a día." },
];
const contents = [
  { icon: Play, number: "250+", title: "Ejercicios en video", text: "Fortalece, gana movilidad y prepara tu cuerpo paso a paso, con las indicaciones de tu profesional." },
  { icon: Wind, number: "RELÁJATE", title: "Masajes y relajación pélvica", text: "Aprende a soltar la tensión y conectar con tu cuerpo." },
  { icon: BookOpen, number: "100+", title: "Recetas caseras", text: "Organiza tu alimentación sin complicarte." },
  { icon: CalendarDays, number: "POR ETAPA", title: "Según tu semana de embarazo", text: "Encuentra el contenido de tu etapa sin perderte entre publicaciones." },
  { icon: Smartphone, number: "A TU RITMO", title: "Desde tu celular", text: "Consulta en casa, cuando quieras. También en tablet o computadora." },
  { icon: LockKeyhole, number: "TU ACCESO", title: "Empieza tras confirmar el pago", text: "Recibe las indicaciones de acceso después de la confirmación de tu compra." },
];
const comparison = [
  ["Por semana de embarazo", "Tú lo organizas", "Ya organizado"],
  ["Ejercicios + alimentación + relajación", "Buscas por separado", "Juntos"],
  ["Todo en un solo lugar", "Distintas fuentes", "Una plataforma"],
  ["Tiempo de búsqueda", "Filtras y comparas", "Contenido reunido"],
  ["Empiezas hoy mismo", "Por tu cuenta", "Tras confirmar tu pago"],
  ["Precio", "Gratis, pero disperso", "US$ 4,00 · Pago único"],
];
const faqs = [
  ["¿Es muy básico por US$ 4?", "Es acceso completo a toda la plataforma. El precio es bajo para que más mamás puedan prepararse."],
  ["¿Y si no tengo tiempo?", "Puedes consultar y practicar pocos minutos al día, a tu ritmo y desde casa. Adapta los ejercicios a las indicaciones de tu profesional."],
  ["¿Sirve para mi semana de embarazo?", "El contenido está organizado por semanas. Consulta con tu médico u obstetra cuáles ejercicios son adecuados para ti."],
  ["¿Cómo recibo el acceso?", "Después de la confirmación de tu compra, recibirás las instrucciones de acceso en el correo que usaste para pagar."],
  ["¿Funciona desde el celular?", "Sí. Puedes acceder desde tu celular, tablet o computadora."],
  ["¿Es pago único?", "Sí. Un solo pago de US$ 4,00, sin mensualidades."],
  ["¿Y si no me gusta?", "Tienes una garantía de 7 días. Puedes solicitar el reembolso dentro de ese plazo a través de Hotmart."],
];

export default function SalesPage() {
  const hero = useRef<HTMLElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useHalfPageView();
  const reveal = useCallback((element: HTMLElement | null) => { if (element) element.classList.add("prep-reveal"); }, []);

  return <div className="birth-page prep-page">
    <a className="prep-skip" href="#contenido">Ir al contenido</a>
    <div className="prep-topbar" role="note">🤰 Cada semana de tu embarazo cuenta. Empieza hoy tu preparación.</div>
    <main id="contenido">
      <section ref={hero} className="prep-hero" aria-labelledby="hero-title">
        <div className="prep-wrap prep-hero-grid"><div className="prep-hero-copy"><p className="prep-label">PARA EMBARAZADAS QUE QUIEREN UN PARTO NATURAL</p><h1 id="hero-title">Llegar al parto sin saber qué hacer da miedo.<br /><span>Llegar preparada te cambia todo.</span></h1><p className="prep-lead">Tu preparación, <strong>semana por semana.</strong></p><p>Más de <strong>250 ejercicios en video, 100 recetas y técnicas de relajación pélvica.</strong> Todo en un solo lugar, desde tu celular.</p><PurchaseNote />{birthOffer.mothersStarted !== null && <p className="prep-real-count">Más de {birthOffer.mothersStarted.toLocaleString("es-MX")} mamás ya empezaron.</p>}</div><PhoneMockup /></div>
        <div className="prep-wrap prep-vsl-block"><p className="prep-kicker">CONOCE LO QUE VAS A RECIBIR</p><h2>Tu preparación, por dentro.</h2><p>Mira cómo se organiza el contenido antes de dar el siguiente paso.</p><MiniVsl /></div>
      </section>

      <section className="prep-pain" ref={reveal}><div className="prep-wrap prep-narrow"><SectionTitle kicker="NO TIENES QUE SEGUIR BUSCANDO SOLA">Nadie te explica esto.<br /><span>Y el tiempo no se detiene.</span></SectionTitle><div className="prep-pain-block"><span>01</span><p>Tu panza crece cada semana…<br /><strong>y tu preparación sigue esperando.</strong></p></div><div className="prep-pain-block"><span>02</span><p>Buscas en Google, en TikTok, en Instagram.</p><p>Un video dice una cosa, otro dice lo contrario. Terminas con <strong>más dudas que respuestas.</strong></p></div><div className="prep-pain-block"><span>03</span><p>Las semanas pasan. Y cuando te das cuenta, ya estás en el último mes sin haber encontrado una rutina para ti.</p></div><div className="prep-pain-block"><span>04</span><p>¿Y si llega el momento y te sientes bloqueada por el miedo, sin técnicas para relajarte y respirar?</p></div><div className="prep-pain-block"><span>05</span><p>No quieres mirar atrás y pensar:<br /><strong>«Ojalá hubiera empezado antes».</strong></p></div><p className="prep-pain-close">No es falta de ganas. Es falta de una guía clara, ordenada y hecha para ti.</p><CheckoutLink location="pain">SÍ, QUIERO PREPARARME AHORA</CheckoutLink></div></section>

      <section className="prep-section prep-cream" ref={reveal}><div className="prep-wrap"><SectionTitle kicker="EL COSTO DE SEGUIR BUSCANDO">Lo que pasa cuando improvisas tu preparación</SectionTitle><div className="prep-agitation-grid">{agitation.map(({icon:Icon,title,text})=><article className="prep-small-card" key={title}><Icon size={26} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div><p className="prep-section-close">Cada semana sin preparación<br /><strong>es una semana que no vuelve.</strong></p></div></section>

      <section className="prep-section prep-mechanism" ref={reveal}><div className="prep-wrap prep-narrow"><SectionTitle kicker="DEJA DE JUNTAR CONSEJOS SUELTOS">Por eso creamos la <span>Preparación Completa para el Parto Natural.</span></SectionTitle><p>Una plataforma donde todo está ordenado según <strong>tu semana de embarazo.</strong></p><p>Abres, encuentras el contenido de tu etapa y organizas tu rutina. Sin perder horas buscando por dónde empezar.</p><div className="prep-week-mechanism"><CalendarDays size={32} aria-hidden="true" /><strong>SEMANA POR SEMANA</strong><span>Tu preparación te espera donde estés.</span></div><div className="prep-steps"><span><b>1</b>Abre tu plataforma</span><span><b>2</b>Encuentra tu etapa</span><span><b>3</b>Dedícate un momento</span></div><CheckoutLink location="mechanism">EMPEZAR HOY MI PREPARACIÓN</CheckoutLink></div></section>

      <section className="prep-section prep-desire" ref={reveal}><div className="prep-wrap prep-desire-grid"><div><SectionTitle kicker="PIENSA EN ESE MOMENTO">Imagina llegar a tu parto así…</SectionTitle><ul className="prep-check-list">{["Con un cuerpo más fuerte y móvil para afrontar ese momento.","Sabiendo respirar y relajarte cuando más lo necesites.","Con la confianza de haberte dedicado tiempo y preparación.","Con más calma y herramientas para vivir lo que venga.","Disfrutando tu embarazo con una guía, sin buscar respuestas a cada rato."].map(text=><li key={text}><Check size={21} aria-hidden="true" /><span>{text}</span></li>)}</ul><p className="prep-desire-close">Eso es lo que buscas cuando<br /><strong>dejas de improvisar.</strong></p><CheckoutLink location="desire">SÍ, QUIERO PREPARARME AHORA</CheckoutLink></div><img src="/images/calm-mother.webp" width={576} height={720} alt="Mujer embarazada tranquila, dedicando un momento a su preparación" loading="lazy" decoding="async" /></div></section>

      <section className="prep-section" ref={reveal}><div className="prep-wrap"><SectionTitle kicker="TU ACCESO ES COMPLETO">Lo que vas a recibir.<br /><span>Y lo que puede aportar a tu día.</span></SectionTitle><div className="prep-content-grid">{contents.map(({icon:Icon,number,title,text})=><article className="prep-content-card" key={title}><div><span>{number}</span><Icon size={25} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></article>)}</div>{birthOffer.bonuses.length>0 && <div className="prep-bonuses"><h3>También incluye estos bonos</h3>{birthOffer.bonuses.map(bonus=><article key={bonus.title}><strong>{bonus.title}</strong><p>{bonus.description}</p></article>)}</div>}<div className="prep-center"><CheckoutLink location="contents" /></div></div></section>

      <section className="prep-section prep-cream" ref={reveal}><div className="prep-wrap prep-narrow"><SectionTitle>Seguir buscando solita vs.<br /><span>tener todo en un solo lugar.</span></SectionTitle><div className="prep-table-wrap"><table className="prep-compare"><caption className="prep-sr-only">Comparación entre buscar contenido por separado y la plataforma</caption><thead><tr><th scope="col">Tu preparación</th><th scope="col">Contenido suelto<br />en internet</th><th scope="col">Preparación<br />Completa</th></tr></thead><tbody>{comparison.map(([label,free,complete])=><tr key={label}><th scope="row">{label}</th><td>{free}</td><td><Check size={16} aria-hidden="true" />{complete}</td></tr>)}</tbody></table></div><p className="prep-table-note">Comparación de formatos. Los contenidos gratuitos y su organización pueden variar.</p></div></section>

      <section className="prep-section" ref={reveal}><div className="prep-wrap prep-narrow"><SectionTitle kicker="ESTA PREPARACIÓN ES PARA TI SI…">Quieres llegar con más confianza.<br /><span>Y dejar de hacerlo todo sola.</span></SectionTitle><ul className="prep-check-list prep-for-list">{["Estás embarazada y quieres prepararte para un parto natural.","Quieres dejar de depender de contenido suelto.","Prefieres consultar y practicar en casa, a tu ritmo.","Quieres llegar con más confianza y menos miedo."].map(text=><li key={text}><Check size={21} aria-hidden="true" /><span>{text}</span></li>)}</ul><p className="prep-education"><ShieldCheck size={22} aria-hidden="true" /><span>Contenido educativo. No sustituye a tu médico u obstetra. Consulta con tu profesional antes de iniciar cualquier ejercicio o cambiar tu alimentación.</span></p></div></section>

      {birthOffer.testimonials.length>=3 && <section className="prep-section prep-cream"><div className="prep-wrap"><SectionTitle>Experiencias reales de otras mamás</SectionTitle><div className="prep-testimonials">{birthOffer.testimonials.slice(0,6).map(item=><figure key={item.name+item.country}><img src={item.image} alt={`Testimonio compartido por ${item.name}`} loading="lazy" decoding="async" width={480} height={360}/><blockquote>«{item.quote}»</blockquote><figcaption><strong>{item.name}</strong> · {item.country}</figcaption></figure>)}</div></div></section>}

      <section id="oferta" className="prep-section prep-offer-section" ref={reveal}><div className="prep-wrap prep-offer-layout"><div><p className="prep-kicker">TODO LO QUE VISTE. UN SOLO ACCESO.</p><h2>Tu preparación no necesita más vueltas.<br /><span>Necesita un comienzo.</span></h2><p>Ejercicios, alimentación y relajación. Todo organizado para que dejes de buscar cada recurso por separado.</p><div className="prep-offer-note"><Heart size={25} aria-hidden="true" /><p>Ya estás pensando en todo para tu bebé.<br /><strong>Ahora guarda un momento para ti.</strong></p></div></div><article className="prep-offer-card"><span className="prep-offer-label">ACCESO COMPLETO · PAGO ÚNICO</span><h3>{birthOffer.name}</h3><ul>{offerIncludes.map(item=><li key={item}><Check size={19} aria-hidden="true" />{item}</li>)}</ul>{birthOffer.referencePrice!==null&&birthOffer.referencePrice>4&&<p className="prep-reference">Valor de referencia: <s>US$ {birthOffer.referencePrice.toFixed(2).replace(".",",")}</s></p>}<p className="prep-price-label">Hoy, todo tu acceso por</p><div className="prep-price"><small>US$</small><strong>4,00</strong></div><p className="prep-price-copy">Por un pequeño pago, tu preparación completa en un solo lugar.</p><CheckoutLink location="offer" /><p className="prep-micro">Pago único · Sin mensualidades · Acceso tras confirmar el pago</p><div className="prep-guarantee"><ShieldCheck size={27} aria-hidden="true" /><div><strong>Garantía de 7 días</strong><span>Puedes solicitar el reembolso dentro de ese plazo.</span></div></div><div className="prep-safe-pay"><LockKeyhole size={17} aria-hidden="true" /><span>Pago seguro con Hotmart</span><CreditCard size={21} aria-hidden="true" /></div></article></div></section>

      <section className="prep-section" ref={reveal}><div className="prep-wrap prep-narrow"><SectionTitle kicker="RESOLVAMOS TUS ÚLTIMAS DUDAS">Antes de empezar…</SectionTitle><div className="prep-faq">{faqs.map(([question,answer],index)=><article key={question}><h3><button type="button" aria-expanded={openFaq===index} aria-controls={`faq-answer-${index}`} id={`faq-question-${index}`} onClick={()=>setOpenFaq(openFaq===index?null:index)}>{question}<ChevronDown size={21} aria-hidden="true" /></button></h3><div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} hidden={openFaq!==index}><p>{answer}</p></div></article>)}</div></div></section>

      <section className="prep-section prep-final" ref={reveal}><div className="prep-wrap prep-narrow"><p className="prep-kicker">CADA SEMANA CUENTA</p><h2>Tu bebé está en camino.<br /><span>Tu preparación no puede esperar.</span></h2><p>No dejes para después ese momento para ti. Empieza hoy, con una guía organizada y desde tu celular.</p><CheckoutLink location="final" /><PurchaseNote /></div></section>
    </main>
    <footer className="prep-footer prep-wrap"><strong>{birthOffer.name}</strong><p>Contenido educativo. La preparación no garantiza dilatación, ausencia de dolor ni un tipo de parto. Mantén tu seguimiento prenatal.</p></footer>
    <StickyMobileCheckout hero={hero} />
    <DesktopExitOffer />
  </div>;
}

function formatVideoTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function MiniVsl() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ended, setEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const playVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    setFailed(false);
    try {
      await video.play();
      setStarted(true);
    } catch {
      setFailed(true);
      setBuffering(false);
    }
  };

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void playVideo();
    else video.pause();
  };

  const retryVideo = () => {
    setFailed(false);
    setBuffering(false);
    setStarted(false);
    setIsPlaying(false);
    setEnded(false);
    setCurrentTime(0);
    videoRef.current?.load();
  };

  return (
    <div className="birth-vsl" aria-label="Presentación de la plataforma">
      <div className="birth-vsl-heading"><Play size={16} aria-hidden="true" /><span>MIRA CÓMO FUNCIONA LA PLATAFORMA</span></div>
      <div className="birth-vsl-player">
        <video
          ref={videoRef}
          src="/mini-vsl-parto-natural.mp4"
          playsInline
          disablePictureInPicture
          tabIndex={started ? 0 : -1}
          role="button"
          onClick={togglePlayback}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              togglePlayback();
            }
          }}
          preload="metadata"
          aria-label={isPlaying ? "Pausar presentación" : "Reproducir presentación"}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onDurationChange={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onPlay={() => { setStarted(true); setIsPlaying(true); setEnded(false); }}
          onPlaying={() => { setBuffering(false); setFailed(false); }}
          onWaiting={() => setBuffering(true)}
          onCanPlay={() => setBuffering(false)}
          onPause={() => { setIsPlaying(false); setBuffering(false); }}
          onEnded={() => { setEnded(true); setIsPlaying(false); setBuffering(false); }}
          onError={() => { setFailed(true); setBuffering(false); }}
        >
          Tu navegador no admite este video.
        </video>
        {!started && !failed && (
          <button className="birth-vsl-play" type="button" onClick={playVideo} aria-label="Reproducir presentación con sonido">
            <span className="birth-vsl-play-icon"><Play size={34} fill="currentColor" aria-hidden="true" /></span>
            <strong>TOCA PARA VER EL VIDEO</strong>
            <span>Conoce lo que vas a recibir</span>
          </button>
        )}
        {started && !isPlaying && !ended && !failed && (
          <button className="birth-vsl-play" type="button" onClick={playVideo} aria-label="Reanudar presentación">
            <span className="birth-vsl-play-icon"><Play size={34} fill="currentColor" aria-hidden="true" /></span>
          </button>
        )}
        {started && buffering && !failed && (
          <div className="birth-vsl-buffering" role="status" aria-label="Cargando video"><LoaderCircle size={32} aria-hidden="true" /></div>
        )}
        {failed && (
          <div className="birth-vsl-error" role="alert">
            <p>No se pudo reproducir el video. Comprueba tu conexión y vuelve a intentarlo.</p>
            <button type="button" onClick={retryVideo}>Volver a cargar</button>
          </div>
        )}
      </div>
      <div className="birth-vsl-progress" role="progressbar" aria-label="Progreso real del video" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-valuetext={`${formatVideoTime(currentTime)} de ${formatVideoTime(duration)}`}>
        <div style={{ width: `${progress}%` }} />
      </div>
      {ended && <p className="birth-vsl-completed">Ya conoces la plataforma. Descubre abajo todo lo que incluye tu acceso.</p>}
    </div>
  );
}



