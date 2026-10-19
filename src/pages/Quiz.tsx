import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, Check, ShieldCheck, Play, BookOpen, Flower2, LoaderCircle, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { trackInitiateCheckout } from "@/lib/metaPixel";

const checkoutUrl = import.meta.env.VITE_CHECKOUT_URL || "https://pay.hotmart.com/D108067220C?checkoutMode=10";
const benefits = [
  { number: "250+", title: "Ejercicios de preparación", text: "Contenido para trabajar movilidad y preparación física, organizado por semana de gestación. Elige con tu profesional lo adecuado para ti.", icon: Play },
  { number: "100+", title: "Recetas caseras", text: "Ideas prácticas de alimentación reunidas en un solo lugar. Menos tiempo buscando, más opciones para organizar tus comidas.", icon: BookOpen },
  { number: "01", title: "Relajación pélvica", text: "Masajes y prácticas de relajación para conocer tu cuerpo y aprender a soltar tensión. Respeta siempre las indicaciones de tu equipo de salud.", icon: Flower2 },
];
const testimonials = [
  { initials: "CR", name: "Camila R.", country: "México", quote: "Estaba súper asustada con el dolor. Empecé a las 28 semanas con los ejercicios. Llegué al hospital con 4 cm ya y el parto fue mucho más corto de lo que me imaginaba." },
  { initials: "VM", name: "Valentina M.", country: "Colombia", quote: "Yo casi no hacía nada de ejercicio. Después de seguir el protocolo noté una diferencia real. El parto natural fue posible y con mucho menos dolor del que esperaba." },
  { initials: "FS", name: "Fernanda S.", country: "Argentina", quote: "Pensaba que la dilatación era solo suerte. Mi matrona se sorprendió de lo blando que estaba el cuello del útero. Todavía no parí, pero ya siento que mi cuerpo está listo." },
];
function OfferLink({ children }: { children: string }) {
  return <a className="birth-cta" href="#oferta"><span>{children}</span><ArrowRight size={22} aria-hidden="true" /></a>;
}
const includes = ["Más de 250 ejercicios de preparación", "Más de 100 recetas caseras", "Masajes y relajación pélvica", "Organizado por semana de gestación"];

export default function SalesPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const openCheckout = (event: MouseEvent<HTMLAnchorElement>) => {
    try { trackInitiateCheckout(4); } catch { /* Analytics must never block checkout. */ }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const destination = new URL(event.currentTarget.href);
    const params = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "sck", "xcod"].forEach(key => {
      const value = params.get(key);
      if (value && !destination.searchParams.has(key)) destination.searchParams.set(key, value);
    });
    event.preventDefault();
    window.location.assign(destination.toString());
  };
  return <div className="birth-page birth-rebuilt">
    <a className="birth-skip" href="#contenido">Ir al contenido</a>
    <div className="birth-urgency" role="note">Cada semana cuenta. Haz espacio para preparar tu cuerpo.</div>
    <main id="contenido">
      <section className="birth-wrap new-hero" aria-labelledby="hero-title">
        <div className="new-hero-copy">
          <p className="birth-eyebrow">PREPARACIÓN REAL PARA EL PARTO</p>
          <h1 id="hero-title">¡NO SUFRAS PARA TENER <span>A TU BEBÉ!</span></h1>
          <p className="birth-lead">No llegues al parto sintiendo que no sabes qué hacer con tu cuerpo.</p>
          <p>El miedo al dolor pesa. Tener una preparación organizada te da herramientas para afrontar ese momento con más confianza.</p>
          <p className="new-hero-emphasis">Deja de acumular dudas.<br /><strong>Empieza a prepararte.</strong></p>

        </div>
        <figure className="new-hero-image"><img src="/images/pain-belly.webp" width={584} height={388} fetchPriority="high" alt="Mujer embarazada sentada, con una mano en el vientre y expresión de preocupación" /><figcaption>Tu preparación también merece un lugar en la espera.</figcaption></figure>
      </section>

      <section className="new-vsl-section birth-wrap" aria-label="Conoce la plataforma">
        <p className="birth-eyebrow">ANTES DE DECIDIR, MIRA LO QUE RECIBES</p>
        <h2>Conoce tu preparación <span>por dentro</span></h2>
        <p>Una plataforma. Tu contenido organizado. Un punto de partida claro.</p>
        <MiniVsl />
        <div className="mt-6">
          <OfferLink>Quiero preparar mi cuerpo para el parto</OfferLink>
          <p className="birth-micro">Acceso inmediato · 100% online · 15–20 minutos para tu rutina</p>
        </div>
      </section>

      <section className="birth-pain new-pain">
        <div className="birth-wrap">
          <div className="birth-section-heading"><p className="birth-eyebrow">EL MIEDO ES REAL. TU PREPARACIÓN TAMBIÉN PUEDE SERLO.</p><h2>Cuando llegan las contracciones,<br /><span>quieres tener herramientas.</span></h2><p>Imaginar ese momento sin saber cómo respirar, moverte o relajarte puede llenarte de dudas. No necesitas seguir buscando respuestas sueltas hasta el último día.</p></div>
          <div className="new-pain-copy"><p>El trabajo de parto puede ser intenso. Cada mujer lo vive de forma distinta, incluso cuando se ha preparado.</p><p><strong>Conoce tu cuerpo. Practica. Resuelve tus dudas con tu equipo de salud.</strong> Esa preparación puede empezar antes de llegar al hospital.</p></div>
          <div className="new-pain-videos">
            <figure><video src="/videos/experiencia-parto-1.mp4" poster="/images/labor-1.webp" controls playsInline preload="none" aria-label="Escena de contracciones durante el trabajo de parto" /><figcaption>El trabajo de parto puede sentirse intenso.</figcaption></figure>
            <figure><video src="/videos/experiencia-parto-2.mp4" poster="/images/labor-2.webp" controls playsInline preload="none" aria-label="Escena de una mujer durante el trabajo de parto" /><figcaption>Cada experiencia es diferente.</figcaption></figure>
          </div>
          <p className="new-context-note">Escenas de trabajo de parto. No muestran si estas mujeres se prepararon ni permiten atribuir la intensidad del dolor a su preparación.</p>
        </div>
      </section>

      <section className="new-truth birth-wrap" aria-labelledby="amplify-title">
        <p className="birth-eyebrow">LO QUE CASI NADIE TE EXPLICA</p>
        <h2 id="amplify-title">Cuando el cuerpo no está preparado para dilatar… <span>el dolor se multiplica</span></h2>
        <p>La mayoría de las mujeres llega al parto sin haber trabajado el cuello del útero ni la pelvis.</p>
        <p>Cuando el bebé empieza a bajar y no encuentra paso fácil, el cuerpo se resiste con fuerza. Es ahí donde el dolor se vuelve mucho más intenso de lo necesario.</p>
        <div className="birth-highlight">Y la mayoría solo lo descubre cuando ya está en trabajo de parto… demasiado tarde.</div>
      </section>

      <section className="new-truth birth-wrap" aria-labelledby="bridge-title">
        <p className="birth-eyebrow">LA BUENA NOTICIA</p>
        <h2 id="bridge-title">Todavía estás a tiempo <span>de cambiar eso</span></h2>
        <p>Preparar tu cuerpo antes del parto puede marcar una diferencia real.</p>
        <p>Con ejercicios específicos de dilatación, alimentación que ayuda a suavizar los tejidos y técnicas de relajación pélvica, muchas mujeres reportan menos resistencia, menos miedo y una experiencia de parto mucho más llevadera.</p>
        <p><strong>No se trata de magia. Se trata de preparación.</strong></p>
        <OfferLink>Quiero empezar mi preparación</OfferLink>
      </section>

      <section className="new-truth birth-wrap">
        <p className="birth-eyebrow">LA VERDAD QUE NADIE TE CUENTA</p><h2>No puedes controlar todo.<br /><span>Sí puedes prepararte.</span></h2>
        <div className="birth-highlight">Tu preparación merece algo mejor que videos guardados al azar.</div>
        <p>Reunir movimiento, alimentación y relajación en una rutina te ayuda a dejar de improvisar. La plataforma organiza esos contenidos para que sepas qué tienes disponible y lo revises con tu profesional.</p>
        <p className="new-clinical-note">La dilatación es un proceso fisiológico. Ninguna rutina ni receta garantiza abrir el cuello del útero, reducir el dolor o evitar intervenciones.</p>
      </section>

      <section className="birth-benefits new-benefits">
        <div className="birth-wrap"><div className="birth-section-heading"><p className="birth-eyebrow">ESTO ES LO QUE TE LLEVAS</p><h2>Tu preparación completa.<br /><span>Todo en un solo lugar.</span></h2><p>Abre la plataforma y encuentra tus contenidos, sin perderte entre publicaciones.</p></div>
          <div className="birth-benefit-grid">{benefits.map(({number,title,text,icon:Icon}) => <article className="birth-benefit" key={title}><div className="birth-benefit-top"><strong>{number}</strong><Icon size={26} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
          <div className="new-routine"><div><strong>Según tu semana</strong><p>Contenido organizado para consultar por etapa.</p></div><div><strong>Desde tu celular</strong><p>Dedica 15–20 minutos a revisar y organizar tu preparación.</p></div></div>
          <div className="birth-center"><OfferLink>Quiero ver mi acceso completo</OfferLink></div>
        </div>
      </section>

      <section className="new-confidence birth-wrap">
        <img src="/images/calm-mother.webp" width={576} height={720} loading="lazy" decoding="async" alt="Mujer embarazada tranquila mirando su celular" />
        <div><p className="birth-eyebrow">MENOS BÚSQUEDAS. MÁS CLARIDAD.</p><h2>Ya estás preparando todo para tu bebé.<br /><span>Ahora piensa en ti.</span></h2><p>Imagina abrir tu plataforma y encontrar el contenido de tu etapa. Elegir un momento, dejar el celular de lado después y sentir que ya diste un paso en tu preparación.</p><p><strong>No tienes que saberlo todo hoy. Necesitas un lugar por donde empezar.</strong></p><span className="new-access-pill"><ShieldCheck size={18} aria-hidden="true" />Acceso online · Pago único · Hotmart</span></div>
      </section>

      <FeedbackCarousel />

      <section id="oferta" className="birth-final" aria-labelledby="offer-title"><div className="birth-wrap birth-final-layout"><div className="birth-final-copy"><p className="birth-eyebrow">EL PRIMER PASO PUEDE SER HOY</p><h2 id="offer-title">Deja de posponer<br /><span>tu preparación.</span></h2><p>No necesitas esperar a tener más miedo. Empieza a conocer tu cuerpo, organiza tu rutina y llega con más herramientas a ese momento.</p><p><strong>Tu bebé tiene su lista. Tú también mereces la tuya.</strong></p></div><div className="birth-offer"><span className="birth-offer-label">PLATAFORMA COMPLETA · PAGO ÚNICO</span><h3>Preparación Completa para el Parto Natural</h3><ul>{includes.map(item=><li key={item}><Check size={18} aria-hidden="true" />{item}</li>)}</ul><div className="birth-price"><span>Todo tu acceso por</span><strong><small>US$</small> 4,00</strong></div><button type="button" className="birth-cta" onClick={()=>setCheckoutOpen(true)}><span>Quiero preparar mi cuerpo ahora</span><ArrowRight size={22} aria-hidden="true" /></button><p className="birth-micro">Revisa tu acceso antes de continuar al pago</p><div className="birth-payment"><ShieldCheck size={17} aria-hidden="true" />Pago seguro a través de Hotmart</div></div></div></section>
    </main>
    <ProofBar />
    <footer className="birth-footer birth-wrap"><p>Preparación Completa para el Parto Natural</p><p>Contenido educativo. Consulta con tu profesional de salud antes de iniciar ejercicios o modificar tu alimentación. No sustituye la atención prenatal ni garantiza dilatación, un parto sin dolor o un tipo de parto.</p></footer>

    <Dialog.Root open={checkoutOpen} onOpenChange={setCheckoutOpen}>
      <Dialog.Portal><Dialog.Overlay className="new-modal-overlay" /><Dialog.Content className="new-checkout-modal" aria-describedby="checkout-description">
        <Dialog.Close className="new-modal-close" aria-label="Cerrar resumen de la oferta"><X size={24} /></Dialog.Close>
        <span className="birth-eyebrow">TU PREPARACIÓN EMPIEZA CON UNA DECISIÓN</span>
        <Dialog.Title className="new-modal-title">Último paso para preparar tu cuerpo</Dialog.Title>
        <Dialog.Description id="checkout-description">Deja de buscar cada contenido por separado. Ten ejercicios, recetas y relajación organizados para empezar a planear tu rutina hoy.</Dialog.Description>
        <div className="new-modal-summary"><strong>Tu plataforma completa incluye:</strong><ul>{includes.map(item=><li key={item}><Check size={18} aria-hidden="true" />{item}</li>)}</ul></div>
        <p className="new-modal-start">No tienes que resolver todas tus dudas ahora. Puedes dar el primer paso y revisar el contenido con tu profesional de salud.</p>
        <div className="new-modal-price"><span>Un solo pago · Acceso online</span><strong>US$ 4,00</strong></div>
        <a className="birth-cta birth-checkout" href={checkoutUrl} onClick={openCheckout}><span>Continuar al pago seguro</span><ArrowRight size={22} aria-hidden="true" /></a>
        <p className="new-modal-security"><ShieldCheck size={17} aria-hidden="true" />Serás dirigida al checkout de Hotmart.</p>
      </Dialog.Content></Dialog.Portal>
    </Dialog.Root>
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
        <span className="birth-vsl-live" aria-hidden="true"><i />Muchas mujeres están viendo esto ahora</span>
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
            <a href="/mini-vsl-parto-natural.mp4" target="_blank" rel="noopener noreferrer">Abrir el video</a>
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



function FeedbackCarousel() {
  const [paused, setPaused] = useState(false);
  return (
    <section className={`birth-testimonials birth-feedback ${paused ? "birth-feedback-paused" : ""}`} aria-labelledby="feedback-title">
      <div className="birth-wrap">
        <div className="birth-section-heading">
          <p className="birth-eyebrow">EXPERIENCIAS COMPARTIDAS</p>
          <h2 id="feedback-title">Lo que dicen las mamás que ya <span>prepararon su cuerpo</span></h2>
        </div>
        <div className="birth-feedback-toolbar"><p>Lee sus relatos, a tu ritmo.</p><button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? "Reanudar testimonios automáticos" : "Pausar testimonios automáticos"}>{paused ? "Reanudar" : "Pausar"}</button></div>
      </div>
      <div className="birth-feedback-window" role="region" aria-label="Testimonios en movimiento" tabIndex={0}>
        <div className="birth-feedback-track">
          {[0,1].map((group) => (
            <div className="birth-feedback-group" key={group} aria-hidden={group === 1 ? true : undefined}>
              {testimonials.map((item,index) => (
                <figure className="birth-testimonial" key={item.name}>
                  <div className="birth-testimonial-photo"><img src={`/images/mama-${index+1}.webp`} alt={`Fotografía de la galería de maternidad ${index+1}`} width={480} height={600} loading="lazy" decoding="async" /><span>GALERÍA DE MATERNIDAD</span></div>
                  <div className="birth-testimonial-text"><span className="birth-quote-mark" aria-hidden="true">“</span><blockquote>{item.quote}</blockquote><figcaption><span className="birth-avatar" aria-hidden="true">{item.initials}</span><span><strong>{item.name}</strong><span>{item.country}</span></span></figcaption></div>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="birth-wrap"><p className="birth-testimonial-note">Relatos e imágenes facilitados por la marca. Las fotos de galería no identifican a las autoras. Las experiencias individuales no garantizan resultados.</p></div>
    </section>
  );
}


const proofMessages = ["🔥 Varias mujeres están preparando su cuerpo ahora", "⚡ Acceso inmediato disponible", "⏳ Oferta por tiempo limitado", "✨ Últimas plazas con acceso inmediato"];
function ProofBar() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % proofMessages.length), 4500);
    return () => window.clearInterval(id);
  }, []);
  return <a href="#oferta" className="birth-proof-bar" aria-live="polite"><span key={index}>{proofMessages[index]}</span></a>;
}
