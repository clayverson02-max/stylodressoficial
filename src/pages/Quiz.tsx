import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, Check, Clock3, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import heroImg from "@/assets/quiz-hero.jpg";
import truthImg from "@/assets/quiz-truth.jpg";
import resultImg from "@/assets/quiz-result.jpg";
import coverImg from "@/assets/parto-natural.jpg";
import logoImg from "@/assets/offer-logo.png";
import { trackCustom, trackInitiateCheckout } from "@/lib/metaPixel";

type Answers = {
  week?: string;
  pain?: string;
  activity?: string;
  knowledge?: string;
};

const TOTAL_STEPS = 7;
const CHECKOUT_URL = import.meta.env.VITE_CHECKOUT_URL || "https://pay.hotmart.com/D108067220C?checkoutMode=10";

const weekOptions = [
  "Entre 20 y 28 semanas",
  "Entre 29 y 34 semanas",
  "Entre 35 y 38 semanas",
  "39 semanas o más",
];

const painOptions = [
  "Muy preocupada, es mi mayor miedo",
  "Bastante preocupada",
  "Un poco preocupada",
  "Casi no me preocupa",
];

const activityOptions = [
  "Sí, hago ejercicios regularmente",
  "Hago algo, pero no de forma constante",
  "Casi nada",
  "Nada en absoluto",
];

const knowledgeOptions = [
  "Sí, lo sabía",
  "Había escuchado algo",
  "No, no lo sabía",
  "Nunca me lo habían dicho",
];

const feedbackByStep: Record<number, string> = {
  2: "Estás en el momento perfecto para actuar. Cada semana que pasa sin preparar tu cuerpo es una semana menos de ventaja.",
  3: "El miedo al dolor es el más común… y el más justificado. Porque la mayoría llega al hospital sin haber preparado su cuerpo para dilatar. La buena noticia: gran parte de ese dolor se puede reducir con la preparación correcta.",
  4: "Esto es más común de lo que crees. Y es exactamente por eso que tantas mujeres sufren más de lo necesario en el parto. Todavía estás a tiempo de cambiarlo.",
  5: "La mayoría de las mujeres no lo sabe… hasta que ya es demasiado tarde.",
};

const ProgressBar = ({ step }: { step: number }) => (
  <div className="fixed inset-x-0 top-0 z-50 bg-background/95 backdrop-blur-sm">
    <div className="h-2 bg-secondary">
      <div
        className="gradient-rose h-full transition-all duration-700 ease-out"
        style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
      />
    </div>
    <div className="mx-auto max-w-xl px-5 py-2 text-right text-xs font-bold text-muted-foreground">
      {step < 6 ? `Paso ${Math.min(step, 4)} de 4` : step === 6 ? "Tu resultado" : "Oferta especial"}
    </div>
  </div>
);

const OptionButton = ({
  label,
  onClick,
  delay,
}: {
  label: string;
  onClick: () => void;
  delay: number;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{ animationDelay: `${delay}ms` }}
    className="animate-fade-up flex min-h-[72px] w-full items-center rounded-2xl border-2 border-border bg-card px-5 py-5 text-left text-lg font-bold leading-snug text-foreground shadow-card transition-smooth hover:border-primary hover:bg-accent active:scale-[0.98] sm:min-h-[78px] sm:text-xl"
  >
    {label}
  </button>
);

const Quiz = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [microMessage, setMicroMessage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  useEffect(() => {
    trackCustom("QuizStart");
  }, []);

  useEffect(() => {
    if (step === 6) trackCustom("QuizTruthView");
    if (step === 7) trackCustom("QuizResultView");
  }, [step]);

  const goNext = () => setStep((current) => Math.min(current + 1, TOTAL_STEPS));

  const answer = (key: keyof Answers, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    trackCustom("QuizProgress", { step });
    const feedback = feedbackByStep[step];

    if (!feedback) {
      goNext();
      return;
    }

    setMicroMessage(feedback);
    window.setTimeout(() => {
      setMicroMessage(null);
      goNext();
    }, 3000);
  };

  const personalizedLine = useMemo(() => {
    const nearBirth = answers.week === "Entre 35 y 38 semanas" || answers.week === "39 semanas o más";
    const littleActivity = answers.activity === "Nada en absoluto" || answers.activity === "Casi nada";

    if (nearBirth && littleActivity) {
      return "Según tus respuestas, estás en la recta final y tu cuerpo aún no está siendo preparado para dilatar. La buena noticia: todavía puedes cambiar completamente tu experiencia de parto.";
    }
    if (nearBirth) {
      return "Según tus respuestas, estás en la recta final del embarazo. La buena noticia: todavía puedes preparar tu cuerpo para llegar con más seguridad y confianza.";
    }
    if (littleActivity) {
      return "Según tus respuestas, todavía tienes tiempo… pero tu cuerpo aún no está siendo preparado para dilatar. La buena noticia: todavía puedes cambiar completamente tu experiencia de parto.";
    }
    return "Según tus respuestas, todavía tienes tiempo… pero tu cuerpo aún puede prepararse mucho más para dilatar. La buena noticia: todavía puedes cambiar completamente tu experiencia de parto.";
  }, [answers]);

  const goToCheckout = () => {
    trackInitiateCheckout(5.5);
    if (CHECKOUT_URL) {
      window.location.href = CHECKOUT_URL;
      return;
    }
    toast.error("El checkout todavía no está configurado", {
      description: "Agrega VITE_CHECKOUT_URL en las variables de entorno del proyecto.",
    });
  };

  return (
    <div className="min-h-screen gradient-soft">
      <ProgressBar step={step} />

      {microMessage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/95 px-5 backdrop-blur-sm">
          <div className="animate-scale-in max-w-lg space-y-5 text-center">
            <div className="gradient-rose mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-elegant">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="font-display text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">
              {microMessage}
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-xl px-5 pb-16 pt-20 sm:max-w-2xl sm:px-8">
        {step === 1 && (
          <div className="space-y-7">
            <div className="animate-fade-up flex items-center gap-3 rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-card">
              <img src={logoImg} alt="Logo Preparación Completa para el Parto Natural" className="h-12 w-12 rounded-full object-cover" width={256} height={256} />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">Método completo</p>
                <p className="font-display text-base font-extrabold leading-tight text-foreground">Preparación Completa para el Parto Natural</p>
              </div>
            </div>
            <div className="animate-fade-up overflow-hidden rounded-3xl shadow-elegant">
              <img src={heroImg} alt="Mujer embarazada tranquila y segura" className="h-72 w-full object-cover sm:h-96" width={1024} height={1280} />
            </div>
            <h1 className="animate-fade-up font-display text-[38px] font-extrabold leading-[1.02] text-foreground sm:text-6xl">
              ¡NO SUFRAS PARA TENER A TU BEBÉ!
            </h1>
            <p className="animate-fade-up text-xl font-extrabold leading-snug text-primary sm:text-2xl">
              La mayoría de las mujeres llega al parto sin dilatar. Y cuando no hay paso… el dolor se multiplica.
            </p>
            <p className="animate-fade-up text-lg leading-relaxed text-foreground sm:text-xl">
              Este quiz de 60 segundos te va a mostrar la verdad sobre tu cuerpo y qué puedes hacer ahora para llegar al parto preparada (y con mucho menos dolor).
            </p>
            <button type="button" onClick={goNext} className="animate-fade-up flex min-h-[68px] w-full items-center justify-center gap-2 rounded-2xl gradient-rose px-6 py-5 text-xl font-extrabold text-primary-foreground shadow-elegant transition-smooth hover:opacity-95 active:scale-[0.98]">
              Empezar el quiz <ArrowRight className="h-6 w-6" />
            </button>
            <p className="text-center text-sm font-bold text-muted-foreground">Solo 60 segundos • 100% gratuito</p>
          </div>
        )}

        {step === 2 && (
          <Question title="¿En qué semana de embarazo estás actualmente?" questionNumber={1} options={weekOptions} onAnswer={(value) => answer("week", value)} />
        )}

        {step === 3 && (
          <Question title="¿Qué tan preocupada estás por el dolor del parto?" questionNumber={2} options={painOptions} onAnswer={(value) => answer("pain", value)} />
        )}

        {step === 4 && (
          <Question title="¿Practicas actualmente algún tipo de ejercicio o actividad física específica para el embarazo?" questionNumber={3} options={activityOptions} onAnswer={(value) => answer("activity", value)} />
        )}

        {step === 5 && (
          <Question title="¿Sabías que la dilatación del cuello del útero se puede preparar con ejercicios específicos antes del parto?" questionNumber={4} options={knowledgeOptions} onAnswer={(value) => answer("knowledge", value)} />
        )}

        {step === 6 && (
          <div className="space-y-7">
            <div className="animate-fade-up overflow-hidden rounded-3xl shadow-elegant">
              <img src={truthImg} alt="Mujer embarazada preparando su cuerpo" className="h-64 w-full object-cover sm:h-80" loading="lazy" width={1024} height={1280} />
            </div>
            <h2 className="animate-fade-up font-display text-[32px] font-extrabold leading-tight text-foreground sm:text-5xl">
              La verdad que nadie te cuenta…
            </h2>
            <div className="animate-fade-up space-y-5 text-lg leading-relaxed text-foreground sm:text-xl">
              <p>La mayoría de las mujeres llega al hospital sin haber preparado su cuerpo para dilatar.</p>
              <p>Cuando el bebé no tiene paso fácil, el dolor se intensifica y el riesgo de intervenciones aumenta.</p>
              <p className="rounded-2xl border-l-4 border-primary bg-accent px-5 py-4 text-xl font-extrabold text-primary sm:text-2xl">
                La dilatación no es suerte. Es preparación.
              </p>
              <p>Mujeres que preparan su cuerpo con ejercicios específicos, alimentación y técnicas de relajación pélvica reportan partos más cortos, menos dolorosos y con mayor probabilidad de ser naturales.</p>
            </div>
            <button type="button" onClick={goNext} className="flex min-h-[68px] w-full items-center justify-center gap-2 rounded-2xl gradient-rose px-6 py-5 text-xl font-extrabold text-primary-foreground shadow-elegant transition-smooth hover:opacity-95 active:scale-[0.98]">
              Quiero preparar mi cuerpo <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-7">
            <div className="relative animate-fade-up overflow-hidden rounded-3xl shadow-elegant">
              <img src={resultImg} alt="Mujer embarazada usando la plataforma" className="h-64 w-full object-cover sm:h-80" loading="lazy" width={1024} height={1280} />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-card/95 px-4 py-2 shadow-soft">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-extrabold text-foreground">Tu resultado está listo</span>
              </div>
            </div>

            <h2 className="animate-fade-up font-display text-[32px] font-extrabold leading-tight text-foreground sm:text-5xl">
              Tu cuerpo puede estar mucho más preparado de lo que crees
            </h2>

            <p className="animate-fade-up text-xl font-extrabold leading-snug text-primary sm:text-2xl">
              {personalizedLine}
            </p>

            <div className="animate-fade-up space-y-5 rounded-3xl border-2 border-border bg-card p-6 shadow-card sm:p-8">
              <p className="text-lg font-extrabold leading-relaxed text-foreground sm:text-xl">
                Creamos una plataforma 100% online para embarazadas de Latinoamérica que te guía paso a paso para:
              </p>
              <ul className="space-y-4">
                <Benefit>Acceder a <strong>más de 250 ejercicios específicos de dilatación</strong> (los que realmente ayudan a abrir el cuello del útero)</Benefit>
                <Benefit>Seguir un protocolo completo con <strong>más de 100 recetas caseras</strong> de alimentación que suavizan tejidos</Benefit>
                <Benefit>Aprender masajes y técnicas de relajación pélvica</Benefit>
                <Benefit>Todo organizado según tu semana de gestación</Benefit>
                <Benefit>Desde tu celular, en casa, en solo 15-20 minutos al día</Benefit>
              </ul>
            </div>

            <p className="rounded-2xl bg-primary px-5 py-4 text-center text-lg font-extrabold leading-snug text-primary-foreground sm:text-xl">
              Cada semana que pasa sin preparación es una semana menos de ventaja.
            </p>

            <section className="animate-fade-up overflow-hidden rounded-3xl border-2 border-primary bg-card shadow-elegant">
              <div className="bg-gradient-to-r from-primary-deep to-primary px-5 py-3 text-center text-sm font-extrabold uppercase tracking-[0.14em] text-primary-foreground">
                Oferta especial por tiempo limitado
              </div>
              <div className="space-y-5 p-5 sm:p-7">
                <img src={coverImg} alt="Preparación Completa para el Parto Natural" className="mx-auto max-h-72 w-full rounded-2xl object-contain sm:max-h-96" loading="lazy" />
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-7 w-7 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="font-display text-2xl font-extrabold leading-tight text-foreground sm:text-3xl">Preparación Completa para el Parto Natural</h3>
                    <p className="mt-2 text-base font-semibold text-muted-foreground">Todo organizado para que empieces desde casa, con acceso inmediato.</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-accent p-5 text-center">
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">Acceso completo</p>
                  <p className="mt-1 text-5xl font-black text-foreground">US$ 5,50</p>
                  <p className="mt-1 text-sm font-bold text-muted-foreground">Pago único • acceso digital</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-foreground">
                  <Clock3 className="h-5 w-5 text-primary" /> Empieza hoy desde tu celular
                </div>
                <button type="button" onClick={goToCheckout} className="flex min-h-[74px] w-full items-center justify-center gap-2 rounded-2xl gradient-rose px-5 py-5 text-lg font-black text-primary-foreground shadow-elegant transition-smooth hover:opacity-95 active:scale-[0.98] sm:text-xl">
                  Quiero acceder a la plataforma por US$ 5,50 <ArrowRight className="h-6 w-6 flex-shrink-0" />
                </button>
                <p className="text-center text-sm font-bold text-muted-foreground">Empieza hoy y llega al parto con el cuerpo listo.</p>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

const Question = ({
  title,
  questionNumber,
  options,
  onAnswer,
}: {
  title: string;
  questionNumber: number;
  options: string[];
  onAnswer: (value: string) => void;
}) => (
  <div className="space-y-7">
    <span className="animate-fade-up inline-block rounded-full bg-accent px-4 py-2 text-sm font-extrabold uppercase tracking-[0.16em] text-primary">
      Pregunta {questionNumber} de 4
    </span>
    <h2 className="animate-fade-up font-display text-[32px] font-extrabold leading-[1.08] text-foreground sm:text-5xl">
      {title}
    </h2>
    <div className="space-y-4 pt-1">
      {options.map((option, index) => (
        <OptionButton key={option} label={option} delay={180 + index * 75} onClick={() => onAnswer(option)} />
      ))}
    </div>
  </div>
);

const Benefit = ({ children }: { children: ReactNode }) => (
  <li className="flex gap-3 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
    <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full gradient-rose">
      <Check className="h-4 w-4 text-primary-foreground" />
    </span>
    <span>{children}</span>
  </li>
);

export default Quiz;
