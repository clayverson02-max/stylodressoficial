import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Heart, Sparkles } from "lucide-react";
import heroImg from "@/assets/quiz-hero.jpg";
import truthImg from "@/assets/quiz-truth.jpg";
import resultImg from "@/assets/quiz-result.jpg";

type Answers = {
  week?: string;
  pain?: string;
  activity?: string;
  knowledge?: string;
};

const TOTAL_STEPS = 7;

const weekMessages: Record<string, string> = {
  "Entre 20 y 28 semanas": "Estás en el momento perfecto para empezar. Tu cuerpo todavía tiene tiempo de prepararse bien.",
  "Entre 29 y 34 semanas": "Todavía estás a tiempo, pero conviene empezar ya. Cada semana de preparación cuenta.",
  "Entre 35 y 38 semanas": "Estás en la recta final. Cada día cuenta.",
  "39 semanas o más": "Tu bebé puede llegar en cualquier momento. Lo que hagas hoy puede marcar la diferencia.",
};

const painMessages: Record<string, string> = {
  "Muy preocupada, es mi mayor miedo": "Es el miedo más común entre las mamás primerizas. Y la buena noticia es que gran parte de ese dolor se puede reducir con preparación.",
  "Bastante preocupada": "Es completamente normal. La mayoría de las mujeres siente lo mismo, y pocas saben que el cuerpo se puede preparar.",
  "Un poco preocupada": "Aunque no sea tu mayor miedo, preparar tu cuerpo puede hacer que todo sea mucho más llevadero.",
  "Casi no me preocupa": "Me alegra leer eso. Aun así, llegar preparada puede hacer que tu parto sea más corto y con menos complicaciones.",
};

const ProgressBar = ({ step }: { step: number }) => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
    <div className="h-1.5 bg-secondary">
      <div
        className="h-full gradient-rose transition-all duration-700 ease-out"
        style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
      />
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
    onClick={onClick}
    style={{ animationDelay: `${delay}ms` }}
    className="animate-fade-up w-full text-left bg-card border-2 border-border hover:border-primary hover:bg-accent rounded-2xl px-5 py-4 text-base sm:text-lg font-medium text-foreground transition-smooth active:scale-[0.98] shadow-card"
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

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));

  const answer = (key: keyof Answers, value: string, message?: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    if (message) {
      setMicroMessage(message);
      setTimeout(() => {
        setMicroMessage(null);
        goNext();
      }, 2600);
    } else {
      goNext();
    }
  };

  const personalizedLine = useMemo(() => {
    const parts: string[] = [];
    if (answers.week === "35 semanas o más" || answers.week === "39 semanas o más") {
      parts.push("estás en la recta final de tu embarazo");
    } else if (answers.week) {
      parts.push("todavía tienes semanas valiosas por delante");
    }
    if (answers.activity === "Nada en absoluto" || answers.activity === "Casi nada") {
      parts.push("tu cuerpo aún no ha empezado a prepararse para dilatar");
    }
    if (parts.length === 0) return "Según tus respuestas, tu cuerpo puede estar mucho más preparado de lo que crees.";
    return `Según tus respuestas, ${parts.join(" y ")}. La buena noticia: todavía puedes cambiarlo.`;
  }, [answers]);

  return (
    <div className="min-h-screen gradient-soft">
      <ProgressBar step={step} />

      {/* Micro mensaje personalizado */}
      {microMessage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/95 backdrop-blur-sm px-6">
          <div className="animate-scale-in max-w-md text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-full gradient-rose flex items-center justify-center">
              <Heart className="h-7 w-7 text-primary-foreground" />
            </div>
            <p className="font-display text-2xl sm:text-3xl font-semibold text-foreground leading-snug">
              {microMessage}
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-xl px-5 pt-14 pb-16">
        {/* ============ SCREEN 1 — WELCOME ============ */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="animate-fade-up overflow-hidden rounded-3xl shadow-elegant">
              <img
                src={heroImg}
                alt="Mujer embarazada tranquila y segura"
                className="w-full h-72 sm:h-96 object-cover"
                width={1024}
                height={1280}
              />
            </div>
            <h1 className="animate-fade-up font-display text-4xl sm:text-5xl font-extrabold leading-[1.05] text-foreground" style={{ animationDelay: "100ms" }}>
              ¡NO SUFRAS PARA TENER A TU BEBÉ!
            </h1>
            <p className="animate-fade-up text-lg sm:text-xl font-semibold text-primary" style={{ animationDelay: "200ms" }}>
              La mayoría de las mujeres llega al parto sin dilatar. Y cuando no hay paso… el dolor se multiplica.
            </p>
            <p className="animate-fade-up text-muted-foreground leading-relaxed" style={{ animationDelay: "300ms" }}>
              Este quiz de 60 segundos te va a mostrar exactamente qué tan preparado está tu cuerpo para el parto natural y qué puedes hacer ahora para cambiarlo.
            </p>
            <button
              onClick={goNext}
              style={{ animationDelay: "400ms" }}
              className="animate-fade-up w-full gradient-rose text-primary-foreground font-bold text-lg rounded-2xl py-5 px-6 flex items-center justify-center gap-2 shadow-elegant hover:opacity-95 active:scale-[0.98] transition-smooth"
            >
              Empezar el quiz <ArrowRight className="h-5 w-5" />
            </button>
            <p className="animate-fade-up text-center text-xs text-muted-foreground" style={{ animationDelay: "500ms" }}>
              Solo 60 segundos • 100% gratuito
            </p>
          </div>
        )}

        {/* ============ SCREEN 2 — SEMANA ============ */}
        {step === 2 && (
          <div className="space-y-6">
            <span className="animate-fade-up inline-block text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Pregunta 1 de 4
            </span>
            <h2 className="animate-fade-up font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight" style={{ animationDelay: "100ms" }}>
              ¿En qué semana de embarazo estás actualmente?
            </h2>
            <div className="space-y-3 pt-2">
              {Object.keys(weekMessages).map((opt, i) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  delay={200 + i * 80}
                  onClick={() => answer("week", opt, weekMessages[opt])}
                />
              ))}
            </div>
          </div>
        )}

        {/* ============ SCREEN 3 — DOLOR ============ */}
        {step === 3 && (
          <div className="space-y-6">
            <span className="animate-fade-up inline-block text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Pregunta 2 de 4
            </span>
            <h2 className="animate-fade-up font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight" style={{ animationDelay: "100ms" }}>
              ¿Qué tan preocupada estás por el dolor del parto?
            </h2>
            <div className="space-y-3 pt-2">
              {Object.keys(painMessages).map((opt, i) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  delay={200 + i * 80}
                  onClick={() => answer("pain", opt, painMessages[opt])}
                />
              ))}
            </div>
          </div>
        )}

        {/* ============ SCREEN 4 — ACTIVIDAD ============ */}
        {step === 4 && (
          <div className="space-y-6">
            <span className="animate-fade-up inline-block text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Pregunta 3 de 4
            </span>
            <h2 className="animate-fade-up font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight" style={{ animationDelay: "100ms" }}>
              ¿Practicas actualmente algún tipo de ejercicio o actividad física específica para el embarazo?
            </h2>
            <div className="space-y-3 pt-2">
              {[
                "Sí, hago ejercicios regularmente",
                "Hago algo, pero no de forma constante",
                "Casi nada",
                "Nada en absoluto",
              ].map((opt, i) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  delay={200 + i * 80}
                  onClick={() => answer("activity", opt)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ============ SCREEN 5 — CONOCIMIENTO ============ */}
        {step === 5 && (
          <div className="space-y-6">
            <span className="animate-fade-up inline-block text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Pregunta 4 de 4
            </span>
            <h2 className="animate-fade-up font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight" style={{ animationDelay: "100ms" }}>
              ¿Sabías que la dilatación del cuello del útero se puede preparar con ejercicios específicos antes del parto?
            </h2>
            <div className="space-y-3 pt-2">
              {[
                "Sí, lo sabía",
                "Había escuchado algo",
                "No, no lo sabía",
                "Nunca me lo habían dicho",
              ].map((opt, i) => (
                <OptionButton
                  key={opt}
                  label={opt}
                  delay={200 + i * 80}
                  onClick={() => answer("knowledge", opt)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ============ SCREEN 6 — LA VERDAD ============ */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="animate-fade-up overflow-hidden rounded-3xl shadow-elegant">
              <img
                src={truthImg}
                alt="Mujer embarazada preparando su cuerpo con ejercicios"
                className="w-full h-64 sm:h-80 object-cover"
                loading="lazy"
                width={1024}
                height={1280}
              />
            </div>
            <h2 className="animate-fade-up font-display text-3xl sm:text-4xl font-extrabold text-foreground leading-tight" style={{ animationDelay: "100ms" }}>
              La verdad que nadie te cuenta…
            </h2>
            <div className="animate-fade-up space-y-4 text-foreground/85 leading-relaxed" style={{ animationDelay: "200ms" }}>
              <p>
                La mayoría de las mujeres llega al hospital sin haber preparado su cuerpo para dilatar. Cuando el bebé no tiene paso fácil, el dolor se intensifica y el riesgo de intervenciones aumenta.
              </p>
              <p className="font-semibold text-primary text-lg">
                La dilatación no es solo "suerte". Es preparación.
              </p>
              <p>
                Mujeres que preparan su cuerpo con ejercicios específicos, alimentación y técnicas de relajación pélvica reportan partos más cortos, menos dolorosos y con mayor probabilidad de ser naturales.
              </p>
            </div>
            <button
              onClick={goNext}
              style={{ animationDelay: "300ms" }}
              className="animate-fade-up w-full gradient-rose text-primary-foreground font-bold text-lg rounded-2xl py-5 px-6 flex items-center justify-center gap-2 shadow-elegant hover:opacity-95 active:scale-[0.98] transition-smooth"
            >
              Quiero preparar mi cuerpo <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ============ SCREEN 7 — RESULTADO + CTA ============ */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="animate-fade-up overflow-hidden rounded-3xl shadow-elegant relative">
              <img
                src={resultImg}
                alt="Mujer embarazada usando la plataforma desde su celular"
                className="w-full h-64 sm:h-80 object-cover"
                loading="lazy"
                width={1024}
                height={1280}
              />
              <div className="absolute top-4 left-4 bg-card/95 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2 shadow-soft">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Tu resultado está listo</span>
              </div>
            </div>

            <h2 className="animate-fade-up font-display text-3xl sm:text-4xl font-extrabold text-foreground leading-tight" style={{ animationDelay: "100ms" }}>
              Tu cuerpo puede estar mucho más preparado de lo que crees
            </h2>

            <p className="animate-fade-up text-primary font-semibold text-lg leading-snug" style={{ animationDelay: "200ms" }}>
              {personalizedLine}
            </p>

            <div className="animate-fade-up bg-card border border-border rounded-3xl p-6 space-y-4 shadow-card" style={{ animationDelay: "300ms" }}>
              <p className="font-semibold text-foreground">
                Creamos una plataforma 100% online para embarazadas de Latinoamérica que te guía paso a paso para:
              </p>
              <ul className="space-y-3">
                {[
                  "Activar ejercicios específicos de dilatación (los que realmente ayudan a abrir el cuello del útero)",
                  "Seguir un protocolo de alimentación que suaviza tejidos",
                  "Aprender masajes y técnicas de relajación pélvica",
                  "Todo organizado según tu semana de gestación",
                  "Desde tu celular, en casa, en solo 15-20 minutos al día",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-foreground/85">
                    <span className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full gradient-rose flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="animate-fade-up text-center font-bold text-foreground text-lg" style={{ animationDelay: "400ms" }}>
              Cada semana que pasa sin preparación es una semana menos de ventaja.
            </p>

            <button
              style={{ animationDelay: "500ms" }}
              className="animate-fade-up w-full gradient-rose text-primary-foreground font-extrabold text-lg sm:text-xl rounded-2xl py-5 px-6 flex items-center justify-center gap-2 shadow-elegant hover:opacity-95 active:scale-[0.98] transition-smooth"
            >
              Quiero acceder a la plataforma ahora <ArrowRight className="h-6 w-6" />
            </button>

            <p className="animate-fade-up text-center text-sm text-muted-foreground" style={{ animationDelay: "600ms" }}>
              Empieza hoy y llega al parto con el cuerpo listo.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Quiz;
