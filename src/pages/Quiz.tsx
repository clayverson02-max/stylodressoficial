import { useEffect, useRef, type MouseEvent } from "react";
import { ArrowRight, Check, Heart, ShieldCheck, Smartphone, Play, BookOpen, Flower2, Clock3 } from "lucide-react";
import heroImg from "@/assets/quiz-hero.jpg";
import truthImg from "@/assets/quiz-truth.jpg";
import coverImg from "@/assets/parto-natural.jpg";
import { trackInitiateCheckout } from "@/lib/metaPixel";

const checkoutUrl = import.meta.env.VITE_CHECKOUT_URL || "https://pay.hotmart.com/D108067220C?checkoutMode=10";

const benefits = [
  { number: "250+", icon: Play, title: "Ejercicios de preparación", text: "Una biblioteca de ejercicios para conocer tu cuerpo y acompañar tu preparación física durante el embarazo." },
  { number: "100+", icon: BookOpen, title: "Recetas para tu día a día", text: "Ideas caseras de alimentación, organizadas en un solo lugar para que no tengas que buscar por todas partes." },
  { number: "03", icon: Flower2, title: "Relajación y bienestar", text: "Masajes y técnicas de relajación pélvica para incorporar a tu preparación." },
  { number: "04", icon: Heart, title: "Según tu etapa", text: "Contenido organizado según tu semana de gestación, fácil de encontrar y de seguir." },
  { number: "15–20", icon: Smartphone, title: "Minutos al día, desde casa", text: "Accede desde tu celular y organiza tu rutina a tu ritmo, sin desplazamientos." },
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
    try { trackInitiateCheckout(5.5); } catch { /* Continue navigation. */ }
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const destination = new URL(checkoutUrl);
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
        <section className="birth-hero birth-wrap">
          <div className="birth-hero-copy">
            <p className="birth-eyebrow"><span /> PREPARACIÓN COMPLETA PARA EL PARTO NATURAL</p>
            <h1>¡NO SUFRAS PARA TENER A <span>TU BEBÉ!</span></h1>
            <p className="birth-lead">El miedo al parto no tiene por qué acompañarte hasta el último día. Empieza a conocer tu cuerpo y a prepararte con más confianza.</p>
            <p>Este es el momento de construir tu preparación, paso a paso. Desde casa, con todo el contenido organizado en una sola plataforma.</p>
            <OfferLink>Quiero preparar mi cuerpo ahora</OfferLink>
            <p className="birth-micro">Acceso inmediato · 100% online · Solo 15–20 minutos al día</p>
          </div>
          <div className="birth-hero-visual">
            <div className="birth-image-frame">
              <img src={heroImg} alt="Mujer embarazada en un ambiente tranquilo en casa" width={1024} height={1280} fetchPriority="high" />
            </div>
            <div className="birth-photo-note"><Heart aria-hidden="true" /><div><strong>Más información. Más confianza.</strong><span>Una preparación que empieza contigo.</span></div></div>
            <span className="birth-visual-label">TU CUERPO. TU PREPARACIÓN.</span>
          </div>
        </section>

        <section className="birth-pain">
          <div className="birth-wrap birth-split birth-reveal">
            <div className="birth-pain-visual"><img src={truthImg} alt="Preparación física durante el embarazo" width={1024} height={1280} loading="lazy" decoding="async" /></div>
            <div>
              <p className="birth-eyebrow">CONOCE TU CUERPO ANTES DEL GRAN DÍA</p>
              <h2>La verdad que nadie <span>te cuenta…</span></h2>
              <p>Es normal sentir miedo cuando no sabes qué esperar. Buscar consejos sueltos en internet puede dejarte con más preguntas que respuestas.</p>
              <p>La preparación puede ayudarte a conocer tu cuerpo, practicar la relajación y llegar con más herramientas al momento del parto.</p>
              <div className="birth-highlight">Tu preparación empieza hoy. Paso a paso, con más confianza.</div>
              <p className="birth-context">Cada embarazo y cada parto son diferentes. La dilatación depende de varios factores; ningún ejercicio o alimento garantiza abrir el cuello del útero ni un parto sin dolor.</p>
            </div>
          </div>
        </section>

        <section className="birth-benefits birth-wrap birth-reveal">
          <div className="birth-section-heading">
            <p className="birth-eyebrow">UNA PLATAFORMA. TODO ORGANIZADO.</p>
            <h2>Lo que vas a recibir hoy para llegar al parto <span>preparada:</span></h2>
            <p>Deja de acumular información suelta. Encuentra tu preparación en un solo lugar.</p>
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
          <div className="birth-center"><OfferLink>Quiero acceder a la plataforma ahora</OfferLink></div>
        </section>

        <section className="birth-testimonials">
          <div className="birth-wrap birth-reveal">
            <div className="birth-section-heading">
              <p className="birth-eyebrow">CADA EXPERIENCIA ES ÚNICA</p>
              <h2>Lo que dicen las mamás que ya <span>prepararon su cuerpo</span></h2>
            </div>
            <div className="birth-testimonial-grid">
              {testimonials.map((item) => (
                <figure className="birth-testimonial" key={item.name}>
                  <span className="birth-quote-mark" aria-hidden="true">“</span>
                  <blockquote>{item.quote}</blockquote>
                  <figcaption><span className="birth-avatar" aria-hidden="true">{item.initials}</span><span><strong>{item.name}</strong><span>{item.country}</span></span></figcaption>
                </figure>
              ))}
            </div>
            <p className="birth-testimonial-note">Testimonios proporcionados por la marca. Son experiencias individuales y no garantizan resultados. Avatares con iniciales; no son fotografías de las participantes.</p>
          </div>
        </section>

        <section className="birth-momentum">
          <div className="birth-wrap birth-reveal">
            <p className="birth-eyebrow">HAZ ESPACIO PARA TU PREPARACIÓN</p>
            <h2>Cada semana que pasa sin preparación es una semana menos de ventaja.</h2>
            <p>No necesitas tener todas las respuestas para empezar. Necesitas un lugar donde encontrarlas, a tu ritmo.</p>
            <div className="birth-momentum-details"><span><Smartphone size={20} aria-hidden="true" /> Desde tu celular</span><span><Clock3 size={20} aria-hidden="true" /> Una rutina corta al día</span><span><Play size={20} aria-hidden="true" /> Contenido organizado</span></div>
          </div>
        </section>

        <section className="birth-final birth-wrap birth-reveal" id="oferta" aria-labelledby="offer-title">
          <div className="birth-section-heading">
            <p className="birth-eyebrow">TU SIGUIENTE PASO EMPIEZA AQUÍ</p>
            <h2 id="offer-title">Todavía estás a tiempo de vivir tu preparación <span>con más confianza</span></h2>
            <p>No dejes que el miedo sea tu única compañía. Empieza hoy con información, práctica y una rutina organizada desde tu celular.</p>
          </div>
          <div className="birth-offer">
            <div className="birth-offer-art">
              <img src={coverImg} alt="Plataforma Completa de Preparación al Parto Natural, más de 250 ejercicios y 100 recetas" width={1672} height={941} loading="lazy" decoding="async" />
              <span className="birth-offer-caption"><Heart size={18} aria-hidden="true" /> Un espacio para prepararte y cuidarte</span>
            </div>
            <div className="birth-offer-copy">
              <span className="birth-offer-label">ACCESO COMPLETO</span>
              <h3>Preparación Completa para el Parto Natural</h3>
              <ul>
                {["+250 ejercicios de preparación", "+100 recetas caseras", "Masajes y técnicas de relajación", "Organizado según tu semana de gestación"].map((item) => <li key={item}><Check size={20} aria-hidden="true" />{item}</li>)}
              </ul>
              <div className="birth-price"><span>Un solo pago de</span><strong><small>US$</small> 5,50</strong></div>
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
