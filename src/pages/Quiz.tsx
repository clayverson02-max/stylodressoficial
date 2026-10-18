import { useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowRight, Check, Heart, ShieldCheck, Smartphone, Play, BookOpen, Flower2, Clock3, LoaderCircle } from "lucide-react";
import truthImg from "@/assets/quiz-truth.jpg";
import coverImg from "@/assets/parto-natural.jpg";
import { trackInitiateCheckout } from "@/lib/metaPixel";

const checkoutUrl = import.meta.env.VITE_CHECKOUT_URL || "https://pay.hotmart.com/D108067220C?checkoutMode=10";

const benefits = [
  { number: "250+", icon: Play, title: "Ejercicios para tu preparación", text: "Deja de preguntarte por dónde empezar. Encuentra una biblioteca completa de ejercicios de preparación para el embarazo, reunidos para que puedas organizar tu rutina con más claridad." },
  { number: "100+", icon: BookOpen, title: "Recetas caseras, a tu alcance", text: "Más ideas para cuidar tu alimentación sin pasar horas buscando. Un recetario que puedes consultar desde tu celular y adaptar a tus necesidades con tu profesional de salud." },
  { number: "Calma", icon: Flower2, title: "Relajación y conexión con tu cuerpo", text: "Aprende técnicas de relajación pélvica y conoce los masajes incluidos. Haz espacio para bajar el ritmo y dedicarte un momento durante esta etapa." },
  { number: "Tu etapa", icon: Heart, title: "Todo organizado por semana", text: "Encuentra el contenido de tu etapa sin perderte entre consejos sueltos. Consulta tu semana de gestación y prepara tu propia rutina, a tu ritmo." },
  { number: "15–20", icon: Smartphone, title: "Minutos para ti, desde casa", text: "Un espacio en tu día para prepararte, sin desplazamientos. Abre la plataforma desde tu celular y retoma el contenido cuando lo necesites." },
];

const testimonials = [
  { initials: "CR", name: "Camila R.", country: "México", quote: "Estaba súper asustada con el dolor. Empecé a las 28 semanas con los ejercicios. Llegué al hospital con 4 cm ya y el parto fue mucho más corto de lo que me imaginaba." },
  { initials: "VM", name: "Valentina M.", country: "Colombia", quote: "Yo casi no hacía nada de ejercicio. Después de seguir el protocolo noté una diferencia real. El parto natural fue posible y con mucho menos dolor del que esperaba." },
  { initials: "FS", name: "Fernanda S.", country: "Argentina", quote: "Pensaba que la dilatación era solo suerte. Mi matrona se sorprendió de lo blando que estaba el cuello del útero. Todavía no parí, pero ya siento que mi cuerpo está listo." },
];

const OfferLink = ({ children, className = "" }: { children: string; className?: string }) => (
  <a className={`birth-cta ${className}`} href="#oferta">
    <span>{children}</span><ArrowRight size={22} aria-hidden="true" />
  </a>
);

export default function Quiz() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    page.classList.add("birth-animate");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("birth-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    page.querySelectorAll(".birth-reveal").forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); page.classList.remove("birth-animate"); };
  }, []);

  const openCheckout = (event: MouseEvent<HTMLAnchorElement>) => {
    // Tracking must never prevent the checkout from opening.
    try { trackInitiateCheckout(4); } catch { /* Continue navigation. */ }
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
    <div ref={pageRef} className="birth-page">
      <a href="#contenido" className="birth-skip">Ir al contenido</a>
      <div className="birth-urgency" role="note">
        <span aria-hidden="true">⚠</span>
        <span>Cada semana que pasa sin preparación es una semana menos de ventaja</span>
      </div>

      <main id="contenido">
        <section className="birth-vsl-hero birth-wrap">
          <p className="birth-eyebrow">PREPARACIÓN COMPLETA PARA EL PARTO NATURAL</p>
          <h1>¡NO DEJES TU PREPARACIÓN PARA <span>EL DÍA DEL PARTO!</span></h1>
          <MiniVsl />
          <div className="birth-vsl-intro">
            <p className="birth-lead">Más de 250 ejercicios + 100 recetas + relajación pélvica. Una sola plataforma para dejar de buscar consejos sueltos y empezar a prepararte con más confianza.</p>
            <p>Tu bebé se acerca. Dedícate un momento hoy: descubre qué incluye la plataforma y cómo hacer espacio para tu preparación, desde casa y a tu ritmo.</p>
            <p className="birth-micro">Acceso inmediato · 100% online · Solo 15–20 minutos al día</p>
          </div>
        </section>

        <section className="birth-pain">
          <div className="birth-wrap birth-split birth-reveal">
            <div className="birth-pain-visual"><img src={truthImg} alt="Preparación física durante el embarazo" width={1024} height={1280} loading="lazy" decoding="async" /></div>
            <div>
              <p className="birth-eyebrow">CONOCE TU CUERPO ANTES DEL GRAN DÍA</p>
              <h2>La verdad que nadie <span>te cuenta…</span></h2>
              <p>Es normal sentir miedo cuando no sabes qué esperar. Buscar consejos sueltos en internet puede dejarte con más preguntas que respuestas.</p>
              <p>Lo que deseas es llegar a ese día con más claridad: conocer tu cuerpo, haber practicado la relajación y saber que te dedicaste tiempo antes del nacimiento de tu bebé.</p>
              <p>Por eso reunimos ejercicios, recetas y técnicas de relajación en una plataforma fácil de consultar. Para que pases de guardar consejos a organizar tu preparación.</p>
              <div className="birth-highlight">Tu preparación empieza hoy. Paso a paso, con más confianza.</div>
              <p className="birth-context">Cada embarazo y cada parto son diferentes. La dilatación depende de varios factores; ningún ejercicio o alimento garantiza abrir el cuello del útero ni un parto sin dolor.</p>
            </div>
          </div>
        </section>

        <section className="birth-benefits birth-wrap birth-reveal">
          <div className="birth-section-heading">
            <p className="birth-eyebrow">UNA PLATAFORMA. TODO ORGANIZADO.</p>
            <h2>Lo que vas a recibir hoy para llegar al parto <span>preparada:</span></h2>
            <p>Una biblioteca completa para dejar de improvisar. Estos son los contenidos que tendrás a mano desde el primer día:</p>
          </div>
          <div className="birth-benefit-grid">
            {benefits.map(({ number, icon: Icon, title, text }, index) => (
              <article className={`birth-benefit ${index === 0 ? "birth-benefit-main" : ""}`} key={title}>
                <div className="birth-benefit-top"><span className="birth-number">{number}</span><Icon size={28} aria-hidden="true" /></div>
                <h3>{title}</h3><p>{text}</p>
                {index === 0 && <span className="birth-pill">Biblioteca completa · acceso online</span>}
              </article>
            ))}
          </div>
          <div className="birth-delivery-summary">
            <div><span>UNA SOLA PLATAFORMA</span><h3>Menos tiempo buscando.<br />Más tiempo preparándote.</h3></div>
            <p>Ejercicios, recetas y relajación en un mismo espacio. Contenido ordenado por semana para que encuentres lo que buscas y vuelvas a consultarlo cuando quieras.</p>
          </div>
          <div className="birth-center"><OfferLink>Quiero ver mi acceso completo</OfferLink><p className="birth-micro">Conoce todo lo incluido en el paquete antes de decidir.</p></div>
        </section>

        <section className="birth-method">
          <div className="birth-wrap birth-reveal">
            <div className="birth-section-heading">
              <p className="birth-eyebrow">ASÍ SE VE TU PREPARACIÓN DESDE CASA</p>
              <h2>Abres tu celular.<br /><span>Empiezas a dedicarte tiempo.</span></h2>
              <p>No necesitas resolverlo todo hoy. Solo dar un primer paso y construir una rutina que puedas sostener.</p>
            </div>
            <div className="birth-method-grid">
              <article><span>01</span><h3>Entras a tu plataforma</h3><p>Después de tu compra, accedes al contenido reunido en un solo lugar. Tu preparación deja de depender de lo que encuentres por casualidad.</p></article>
              <article><span>02</span><h3>Encuentras tu etapa</h3><p>Consulta los contenidos organizados por semana de gestación. Elige tu rutina con la orientación de tu profesional de salud.</p></article>
              <article><span>03</span><h3>Haces espacio para ti</h3><p>Dedica 15–20 minutos a conocer tu cuerpo, practicar y cuidarte. En casa, desde tu celular, a tu ritmo.</p></article>
            </div>
            <p className="birth-method-close">El día de conocer a tu bebé se acerca. Que tu preparación también forme parte de la espera.</p>
          </div>
        </section>

        <FeedbackCarousel />

        <section className="birth-momentum">
          <div className="birth-wrap birth-reveal">
            <p className="birth-eyebrow">HAZ ESPACIO PARA TU PREPARACIÓN</p>
            <h2>Cada semana que pasa sin preparación es una semana menos de ventaja.</h2>
            <p>Piensa en todo lo que ya estás preparando para recibir a tu bebé. Tú también mereces un espacio en esa lista. Hoy puedes empezar a dedicarte tiempo, con todo el contenido a mano.</p>
            <div className="birth-momentum-details"><span><Smartphone size={20} aria-hidden="true" /> Desde tu celular</span><span><Clock3 size={20} aria-hidden="true" /> Una rutina corta al día</span><span><Play size={20} aria-hidden="true" /> Contenido organizado</span></div>
          </div>
        </section>

        <section className="birth-final birth-wrap birth-reveal" id="oferta" aria-labelledby="offer-title">
          <div className="birth-section-heading">
            <p className="birth-eyebrow">TU SIGUIENTE PASO EMPIEZA AQUÍ</p>
            <h2 id="offer-title">Todavía estás a tiempo de vivir tu preparación <span>con más confianza</span></h2>
            <p>Más de 250 ejercicios, más de 100 recetas y técnicas de relajación. Una sola plataforma para transformar tus ganas de prepararte en una rutina que puedas empezar hoy.</p>
          </div>
          <div className="birth-offer">
            <div className="birth-offer-art">
              <img src={coverImg} alt="Plataforma Completa de Preparación al Parto Natural, más de 250 ejercicios y 100 recetas" width={1672} height={941} loading="lazy" decoding="async" />
              <span className="birth-offer-caption"><Heart size={18} aria-hidden="true" /> Un espacio para prepararte y cuidarte</span>
            </div>
            <div className="birth-offer-copy">
              <span className="birth-offer-label">TODO EL CONTENIDO EN UN SOLO ACCESO</span>
              <h3>Preparación Completa para el Parto Natural</h3>
              <ul>
                {["+250 ejercicios de preparación", "+100 recetas caseras", "Masajes y técnicas de relajación", "Organizado según tu semana de gestación"].map((item) => <li key={item}><Check size={20} aria-hidden="true" />{item}</li>)}
              </ul>
              <p className="birth-offer-value">Llévate toda tu biblioteca de preparación. Ten a mano los contenidos de tu etapa y vuelve a consultarlos sin buscar entre mensajes, publicaciones o consejos sueltos.</p>
              <div className="birth-price"><span>La plataforma completa por un solo pago de</span><strong><small>US$</small> 4,00</strong></div>
              <a href={checkoutUrl} onClick={openCheckout} className="birth-cta birth-checkout"><span>Quiero preparar mi cuerpo ahora</span><ArrowRight size={24} aria-hidden="true" /></a>
              <p className="birth-micro">Acceso inmediato · 100% online · Desde tu celular</p>
              <div className="birth-payment"><ShieldCheck size={19} aria-hidden="true" /> Pago procesado por Hotmart</div>
            </div>
          </div>
        </section>
      </main>
      <footer className="birth-footer birth-wrap">
        <p>Preparación Completa para el Parto Natural</p>
        <p>Contenido educativo. Consulta con tu profesional de salud antes de iniciar ejercicios durante el embarazo. No sustituye la atención prenatal.</p>
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
          <p className="birth-eyebrow">HISTORIAS DE UNA ETAPA INOLVIDABLE</p>
          <h2 id="feedback-title">Lo que dicen las mamás que ya <span>prepararon su cuerpo</span></h2>
          <p>Cada mujer vive una experiencia diferente. Estos son los relatos compartidos por la marca.</p>
        </div>
        <div className="birth-feedback-gallery" aria-label="Galería de maternidad compartida por la marca">
          {[1, 2, 3].map((number) => <div key={number}><img src={`/feedback-mama-${number}.png`} alt={`Fotografía de maternidad compartida por la marca ${number}`} width={480} height={600} loading="lazy" decoding="async" /></div>)}
        </div>
        <div className="birth-feedback-toolbar">
          <p>Historias que acompañan tu preparación</p>
          <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={paused ? "Reanudar testimonios automáticos" : "Pausar testimonios automáticos"}>{paused ? "Reanudar" : "Pausar"}</button>
        </div>
      </div>
      <div className="birth-feedback-window" role="region" aria-label="Testimonios en movimiento" tabIndex={0}>
        <div className="birth-feedback-track">
          {[0, 1].map((group) => (
            <div className="birth-feedback-group" key={group} aria-hidden={group === 1 ? true : undefined}>
              {testimonials.map((item) => (
                <figure className="birth-testimonial" key={item.name}>
                  <span className="birth-quote-mark" aria-hidden="true">“</span>
                  <blockquote>{item.quote}</blockquote>
                  <figcaption><span className="birth-avatar" aria-hidden="true">{item.initials}</span><span><strong>{item.name}</strong><span>{item.country}</span></span></figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="birth-wrap"><p className="birth-testimonial-note">Fotos y relatos compartidos por la marca. La galería no identifica a las autoras de los relatos. Las experiencias individuales no garantizan resultados.</p></div>
    </section>
  );
}
