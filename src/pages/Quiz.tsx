import { useRef, useState, type MouseEvent } from "react";
import { ArrowRight, Check, ShieldCheck, Play, BookOpen, Flower2, LoaderCircle } from "lucide-react";
import { trackInitiateCheckout } from "@/lib/metaPixel";

const checkoutUrl = import.meta.env.VITE_CHECKOUT_URL || "https://pay.hotmart.com/D108067220C?checkoutMode=10";

const testimonials = [
  { initials: "CR", name: "Camila R.", country: "México", quote: "Estaba súper asustada con el dolor. Empecé a las 28 semanas con los ejercicios. Llegué al hospital con 4 cm ya y el parto fue mucho más corto de lo que me imaginaba." },
  { initials: "VM", name: "Valentina M.", country: "Colombia", quote: "Yo casi no hacía nada de ejercicio. Después de seguir el protocolo noté una diferencia real. El parto natural fue posible y con mucho menos dolor del que esperaba." },
  { initials: "FS", name: "Fernanda S.", country: "Argentina", quote: "Pensaba que la dilatación era solo suerte. Mi matrona se sorprendió de lo blando que estaba el cuello del útero. Todavía no parí, pero ya siento que mi cuerpo está listo." },
];

const benefits = [
  { number: "250+", icon: Play, title: "Ejercicios de preparación", text: "Una biblioteca para conocer tu cuerpo y organizar tu preparación física. Encuentra el contenido según tu semana de gestación.", detail: "Encuentra por dónde empezar." },
  { number: "100+", icon: BookOpen, title: "Recetas caseras", text: "Ideas de alimentación reunidas para consultar desde tu celular. Adáptalas a tus necesidades con tu profesional de salud.", detail: "Menos búsquedas. Más ideas a mano." },
  { number: "Relajación", icon: Flower2, title: "Técnicas de relajación pélvica", text: "Masajes y prácticas de relajación para incorporar a tu preparación. Un momento para bajar el ritmo y conectar contigo.", detail: "Herramientas para tu rutina." },
];

function OfferLink({ children }: { children: string }) {
  return <a className="birth-cta" href="#oferta"><span>{children}</span><ArrowRight size={22} aria-hidden="true" /></a>;
}

export default function SalesPage() {
  const openCheckout = (event: MouseEvent<HTMLAnchorElement>) => {
    try { trackInitiateCheckout(4); } catch { /* Tracking must not interrupt navigation. */ }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const destination = new URL(event.currentTarget.href);
    const params = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "sck", "xcod"].forEach((key) => {
      const value = params.get(key);
      if (value && !destination.searchParams.has(key)) destination.searchParams.set(key, value);
    });
    event.preventDefault();
    window.location.assign(destination.toString());
  };

  return (
    <div className="birth-page">
      <a className="birth-skip" href="#contenido">Ir al contenido</a>
      <div className="birth-urgency" role="note"><span aria-hidden="true">⚠️</span><span>Cada semana que pasa sin preparación es una semana menos de ventaja</span></div>
      <main id="contenido">
        <section className="birth-hero birth-wrap" aria-labelledby="hero-title">
          <header className="birth-hero-heading">
            <p className="birth-eyebrow">PREPARACIÓN REAL PARA EL PARTO</p>
            <h1 id="hero-title">¡NO SUFRAS PARA TENER <span>A TU BEBÉ!</span></h1>
          </header>
          <div className="birth-hero-stage">
            <div className="birth-hero-copy">
              <p className="birth-lead">No dejes toda tu preparación para el hospital. Conoce tu cuerpo y empieza hoy con una rutina organizada.</p>
              <p className="birth-hero-support">La preparación empieza antes del parto. Y todavía estás a tiempo.</p>
              <div className="birth-hero-photo">
                <img src="/images/pain-belly.webp" alt="Mujer embarazada sentada con expresión de preocupación y una mano sobre el vientre" width={584} height={388} loading="lazy" decoding="async" />
                <p>Deja de guardar consejos sueltos.<strong>Empieza a dedicarte tiempo.</strong></p>
              </div>
              <div className="birth-hero-action">
                <OfferLink>Quiero preparar mi cuerpo ahora</OfferLink>
                <p className="birth-micro">Acceso inmediato · 100% online · Solo 15–20 min al día</p>
              </div>
            </div>
            <MiniVsl />
          </div>
        </section>

        <section className="birth-pain">
          <div className="birth-wrap birth-split">
            <div>
              <p className="birth-eyebrow">NO LO DEJES PARA EL ÚLTIMO MOMENTO</p>
              <h2>La verdad que nadie te cuenta <span>a tiempo</span></h2>
              <p>Buscar videos al azar no te da una preparación organizada. Guardas consejos, acumulas dudas y sigues sin saber por dónde empezar.</p>
              <p>Tu bebé se acerca. Haz espacio para conocer tu cuerpo, practicar la relajación y organizar tu rutina con tu profesional de salud.</p>
              <div className="birth-highlight">Prepararte también es una forma de cuidarte.</div>
            </div>
            <img className="birth-pain-image" src="/images/pain-back.webp" alt="Mujer embarazada sintiendo molestias en la espalda, recostada en un sofá" width={800} height={519} loading="lazy" decoding="async" />
          </div>
        </section>

        <section className="birth-benefits birth-wrap">
          <div className="birth-section-heading">
            <p className="birth-eyebrow">UNA PLATAFORMA. TODO ORGANIZADO.</p>
            <h2>Lo que vas a tener para <span>llegar preparada:</span></h2>
            <p>Ejercicios, recetas y relajación. Deja de buscar cada contenido por separado.</p>
          </div>
          <div className="birth-benefit-grid">
            {benefits.map(({number, icon: Icon, title, text, detail}) => (
              <article className="birth-benefit" key={title}>
                <div className="birth-benefit-top"><strong>{number}</strong><Icon size={25} aria-hidden="true" /></div>
                <h3>{title}</h3><p>{text}</p><span className="birth-benefit-detail"><Check size={17} aria-hidden="true" />{detail}</span>
              </article>
            ))}
          </div>
          <p className="birth-delivery-line">Por semana de gestación · Desde tu celular · A tu ritmo</p>
          <div className="birth-center"><OfferLink>Quiero acceso completo ahora</OfferLink></div>
        </section>

        <section className="birth-desire">
          <div className="birth-wrap birth-split">
            <img src="/images/calm-mother.webp" alt="Mujer embarazada tranquila consultando contenido desde su celular" width={576} height={720} loading="lazy" decoding="async" />
            <div>
              <p className="birth-eyebrow">HAZ QUE TU PREPARACIÓN SEA PARTE DE LA ESPERA</p>
              <h2>Imagina llegar al parto <span>con más herramientas</span></h2>
              <p className="birth-desire-punch">Menos dudas. Más preparación. <strong>Más confianza.</strong></p>
              <p>Abres tu plataforma, encuentras tu etapa y eliges un momento para ti. Todo a mano, sin perderte entre publicaciones guardadas.</p>
              <p className="birth-desire-close">Ya estás preparando todo para tu bebé.<br /><strong>Ahora haz espacio para ti.</strong></p>
            </div>
          </div>
        </section>

        <FeedbackCarousel />

        <section id="oferta" className="birth-final" aria-labelledby="offer-title">
          <div className="birth-wrap birth-final-layout">
            <div className="birth-final-copy">
              <p className="birth-eyebrow">TU PREPARACIÓN PUEDE EMPEZAR HOY</p>
              <h2 id="offer-title">Cada semana que pasa sin preparación es una semana menos <span>de ventaja.</span></h2>
              <p>Todavía estás a tiempo de hacer espacio para tu preparación. Da el primer paso desde casa, con todo organizado en un solo lugar.</p>
            </div>
            <div className="birth-offer">
              <span className="birth-offer-label">PLATAFORMA COMPLETA · UN SOLO PAGO</span>
              <h3>Preparación Completa para el Parto Natural</h3>
              <ul>{["+250 ejercicios de preparación", "+100 recetas caseras", "Masajes y relajación pélvica", "Contenido organizado por semana"].map((item) => <li key={item}><Check size={18} aria-hidden="true" />{item}</li>)}</ul>
              <div className="birth-price"><span>Todo tu acceso por</span><strong><small>US$</small> 4,00</strong></div>
              <a className="birth-cta birth-checkout" href={checkoutUrl} onClick={openCheckout}><span>Quiero preparar mi cuerpo ahora</span><ArrowRight size={22} aria-hidden="true" /></a>
              <p className="birth-micro">Acceso inmediato · Desde tu celular · 100% online</p>
              <div className="birth-payment"><ShieldCheck size={17} aria-hidden="true" />Pago procesado por Hotmart</div>
            </div>
          </div>
        </section>
      </main>
      <footer className="birth-footer birth-wrap">
        <p>Preparación Completa para el Parto Natural</p>
        <p>Contenido educativo. Consulta con tu profesional de salud antes de iniciar ejercicios. La preparación no garantiza dilatación, un parto sin dolor ni un tipo de parto. No sustituye la atención prenatal.</p>
      </footer>
    </div>
  );
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
