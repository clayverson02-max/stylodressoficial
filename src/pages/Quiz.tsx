import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowRight, Baby, Check, ChevronDown, Heart, Moon, Play, ShieldCheck, Smartphone, Soup, X, MessageCircle, Search, HandHeart, LockKeyhole } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { FamilyScene } from "@/components/sos/FamilyScene";
import { quizTestimonials } from "@/data/sosQuiz";
import { quizOffer } from "@/data/sosQuizOffer";
import { sosOffer, includes } from "@/data/sosOffer";
import { beginBirthCheckout, checkoutDestination } from "@/lib/birthCheckout";
import { trackStandard } from "@/lib/metaPixel";
import { OfferLink } from "@/components/sos/OfferLink";
import { MiniVsl } from "@/components/sos/MiniVsl";
import { SituationVideos } from "@/components/sos/SituationVideos";

function CheckoutLink({ children = "QUERO O SOS BEBÊ AGORA", location }: { children?: ReactNode; location: string }) {
  const pending = useRef(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const checkout = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    const destination = checkoutDestination(event.currentTarget.href, window.location.search);
    timer.current = beginBirthCheckout(destination, url => { pending.current = false; window.location.assign(url); }, quizOffer.price);
  };
  return <a className="sos-cta" href={quizOffer.checkout} onClick={checkout} data-checkout-cta={location}><span>{children}</span><ArrowRight size={21} aria-hidden="true" /></a>;
}
function PurchaseNote() { return <p className="micro">Pagamento único de R$ 4,99 · Acesso após confirmar o pagamento · Garantia de 7 dias</p>; }
function Title({ label, children }: { label?: string; children: ReactNode }) { return <header className="section-title">{label && <span className="eyebrow">{label}</span>}<h2>{children}</h2></header>; }
function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) { return <section className={`section ${className}`} id={id}><div className="wrap reveal">{children}</div></section>; }

function Count({ value }: { value: number }) {
  const element = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = element.current;
    if (!node || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = (time: number) => { const ratio = Math.min(1, Math.max(0, (time - start) / 650)); node.textContent = `+${Math.round(value * (1 - (1 - ratio) ** 3))}`; if (ratio < 1) frame = requestAnimationFrame(step); };
      frame = requestAnimationFrame(step);
    });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <span ref={element}>+{value}</span>;
}
function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    let sent = false;
    const update = () => {
      frame = 0;
      const available = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${ratio})`;
      if (!sent && ratio >= .5) { sent = true; try { trackStandard("ViewContent", { content_name: sosOffer.name, content_type: "product", value: quizOffer.price, currency: "BRL" }); } catch { /* Analytics cannot block reading. */ } }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule); update();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);
  return <div className="scroll-progress" aria-hidden="true"><div ref={bar}/></div>;
}
function RevealSections() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .05 });
    document.querySelectorAll(".reveal").forEach(node => { node.classList.add("will-reveal"); observer.observe(node); });
    return () => { observer.disconnect(); document.querySelectorAll(".will-reveal").forEach(node => node.classList.remove("will-reveal")); };
  }, []);
  return null;
}
function StickyCheckout() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const desire = document.getElementById("desejo");
    const offer = document.getElementById("oferta");
    if (!desire || !offer || !("IntersectionObserver" in window)) return;
    let passedDesire = false;
    let offerVisible = false;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === desire) passedDesire = entry.boundingClientRect.bottom <= 0;
        if (entry.target === offer) offerVisible = entry.isIntersecting;
      }
      setVisible(passedDesire && !offerVisible);
    });
    observer.observe(desire); observer.observe(offer);
    return () => observer.disconnect();
  }, []);
  if (!visible) return null;
  return <aside className="sticky-buy" aria-label="Ver oferta SOS Bebê"><div><b>SOS Bebê</b><span>R$ 4,99</span></div><OfferLink location="sticky">VER OFERTA</OfferLink></aside>;
}
const checklist = ["Já entrei em pânico sem saber o que fazer quando ele chorou", "Já fiquei horas procurando no celular e saí mais confusa", "Já senti culpa por não conseguir acalmá-lo", "Já corri pra farmácia só para tentar ‘fazer alguma coisa’", "Já recebi mil palpites e não sabia em quem confiar", "Já me senti sozinha nas noites difíceis"];
function Identification() {
  const [selected, setSelected] = useState<string[]>([]);
  return <Section className="cream"><div className="split"><div><Title label="Você se identifica?">Marque o que já aconteceu com você</Title><div className="checklist">{checklist.map(item => <label key={item}><input type="checkbox" checked={selected.includes(item)} onChange={() => setSelected(old => old.includes(item) ? old.filter(x => x !== item) : [...old, item])}/><span>{item}</span></label>)}</div><p className="selection-count" role="status">Você marcou {selected.length} de 6</p></div><FamilyScene variant="community"/></div>{selected.length > 0 && <div className="reassurance" role="status"><Heart size={28}/><p><b>Você não está sozinha, e a culpa não é sua.</b><br/>O SOS Bebê foi feito para te dar apoio nesses momentos.</p></div>}</Section>;
}
const faq = [
  ["Como recebo o acesso?", "Logo após a confirmação do pagamento, você recebe as instruções de acesso por e-mail."],
  ["Funciona pelo celular?", "Sim, celular, tablet ou computador."],
  ["É pagamento único?", "Sim, R$ 4,99, sem mensalidade."],
  ["Serve para recém-nascido?", "A adequação depende do conteúdo e da idade. Converse sempre com o pediatra. Não ofereça receitas, chás ou outros preparos a recém-nascidos por conta própria."],
  ["Substitui o pediatra ou o remédio?", "Não. É um conteúdo educativo e complementar de apoio. Em caso de dúvida ou sinal de alerta, procure atendimento médico. Não interrompa um tratamento prescrito."],
  ["Os vídeos são fáceis de seguir?", "São apresentados passo a passo, com uma organização simples para mães, pais e responsáveis."],
  ["Tem garantia?", "Sim, 7 dias para solicitar reembolso caso não seja o que você esperava."],
  ...(sosOffer.accessDuration ? [["Por quanto tempo tenho acesso?", sosOffer.accessDuration]] : []),
];
function LegalLinks() {
  return <div className="legal-links">{[["Política de Privacidade",sosOffer.privacyText],["Termos de Uso",sosOffer.termsText]].map(([title,text]) => <Dialog.Root key={title}><Dialog.Trigger asChild><button type="button">{title}</button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="modal-overlay"/><Dialog.Content className="sos-modal"><Dialog.Close className="modal-close" aria-label="Fechar documento"><X/></Dialog.Close><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{text || "Documento em preparação. O texto completo será disponibilizado pelo responsável pelo SOS Bebê. Consulte também os termos apresentados no checkout antes de comprar."}</Dialog.Description></Dialog.Content></Dialog.Portal></Dialog.Root>)}</div>;
}
function SalesFeedbacks() {
  const rail = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const node = rail.current;
      if (!node || paused.current || document.hidden) return;
      const bounds = node.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const items = Array.from(node.children) as HTMLElement[];
      const current = items.reduce((best, item, i) => Math.abs(item.offsetLeft - node.scrollLeft) < Math.abs(items[best].offsetLeft - node.scrollLeft) ? i : best, 0);
      node.scrollTo({left: items[(current + 1) % items.length].offsetLeft, behavior: "smooth"});
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);
  return <Section className="cream"><Title label="Experiências compartilhadas">O que estão dizendo</Title><div ref={rail} role="region" tabIndex={0} aria-label="Depoimentos. Deslize para ver mais" style={{display:"flex", gap:20, overflowX:"auto", scrollSnapType:"x mandatory", position:"relative", paddingBottom:16}} onMouseEnter={()=>{paused.current=true;}} onMouseLeave={()=>{paused.current=false;}} onFocusCapture={()=>{paused.current=true;}} onBlurCapture={()=>{paused.current=false;}} onTouchStart={()=>{paused.current=true;}} onTouchEnd={()=>{paused.current=false;}}>{quizTestimonials.map(t=><figure className="card" key={t.name} style={{flex:"0 0 min(88%, 420px)",scrollSnapAlign:"start",margin:0}}><figcaption><strong>{t.name}</strong></figcaption><blockquote style={{margin:"16px 0",fontSize:18,lineHeight:1.6}}>“{t.quote}”</blockquote></figure>)}</div><p className="micro">Relatos individuais. Cada bebê e cada experiência são diferentes. O guia não substitui o pediatra.</p></Section>;
}

export default function SalesPage() {
  return <div className="sos-page"><RevealSections/><ReadingProgress/><div className="top-bar">👶 Bebê chorando sem parar? Tenha um guia para agir com mais segurança.</div><main>
    <section className="hero dark"><div className="wrap hero-vsl-layout"><span className="pill" id="inicio">CRIADO PELA DRA. VALENTINA</span><h1>Seu bebê chora. Você tenta de tudo. <mark>E continua sem saber o que fazer?</mark></h1><p className="lead">Antes da próxima madrugada difícil, assista a este vídeo de 1 minuto. Veja como ter um passo a passo no celular para consultar com mais calma e saber quando pedir ajuda.</p><MiniVsl/><div className="trust-strip"><div><Soup/><b><Count value={250}/> receitas</b></div><div><Play/><b><Count value={100}/> movimentos em vídeo</b></div><div><Smartphone/><b>Acesso no celular</b></div></div><p className="hero-ending">Você troca a fralda, dá colo, tenta acalmar. O choro continua. <strong>Você não precisa procurar mais um palpite. Precisa saber onde consultar.</strong></p></div></section>
    <div className="after-hero-cta wrap" id="apos-hero"><OfferLink location="after-hero"/></div>
    <Section className="dark night" id="continuar-leitura"><div className="split"><div><Title label="A madrugada">Ninguém te prepara para a noite em que o bebê não para de chorar</Title><ol className="timeline">{[["02:47","O choro começa. Você acorda de susto, com o coração acelerado."],["03:10","Colo, balanço, canto… você já tentou tudo o que sabia. Nada parece acalmar."],["03:40","Sua mão treme no celular. Um vídeo diz uma coisa. O grupo diz outra."],["04:15","Cansada e com culpa: ‘será que eu estou fazendo algo errado?’"],["05:00","O dia amanhece. Você não dormiu. De novo."]].map(([time,text])=><li key={time}><time>{time}</time><p>{text}</p></li>)}</ol></div><div><FamilyScene variant="night"/><p className="statement"><mark>Você não precisa enfrentar essa insegurança sozinha.</mark></p></div></div></Section>
    <Identification/>
    <Section className="sky"><Title label="Pense na sua rotina real">Não é só o choro. É não saber qual é o próximo passo.</Title><div className="grid two">{[
      ["São 3 da manhã. E nada parece acalmar.", "Você já trocou a fralda, deu colo e abriu a internet. Cada dica manda tentar outra coisa. O braço cansa. E você continua sem direção."],
      ["Ele encolhe as perninhas. Será que é cólica?", "Você quer acolher seu bebê, mas não sabe se está ajudando. No guia, o assunto está organizado em vídeo, com demonstrações, cuidados e limites para conversar com o pediatra."],
      ["A mamada terminou. Estou segurando direito?", "Falar “coloca para arrotar” é fácil. Ver a demonstração e os cuidados ajuda mais do que tentar imaginar uma posição lendo uma mensagem."],
      ["No grupo, todo mundo sugere uma receita.", "No cansaço, dá vontade de tentar qualquer coisa. Nem toda dica é adequada ao seu bebê. O guia reforça os cuidados, a faixa etária e quando procurar ajuda."]
    ].map(([title,text])=><article className="card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div><p className="statement"><strong>A culpa não é sua. Ninguém te entregou um guia claro para esses momentos.</strong></p></Section>
    <Section className="sky"><div className="split"><div><Title label="A confusão dos palpites">Todo mundo tem uma opinião. Só que o seu bebê é um só.</Title><p>Cada fonte diz uma coisa. E quando o bebê chora, você não tem cabeça para mais confusão.</p><p>Você precisa de <strong>um lugar organizado, em vídeo</strong>, para encontrar apoio e reconhecer quando buscar ajuda.</p></div><FamilyScene variant="confusion"/></div><div className="grid four">{[[Moon,"Noites sem dormir","Você exausta."],[Heart,"Insegurança","Você sem saber por onde começar."],[MessageCircle,"Dicas soltas","Você sem saber em quem confiar."],[Search,"Tentativas no impulso","Mais dúvidas e gastos que pesam."]].map(([Icon,title,text])=>{const I=Icon as typeof Heart;return <article className="card" key={String(title)}><I className="card-icon"/><h3>{String(title)}</h3><p>{String(text)}</p></article>;})}</div><p className="statement"><mark>Mais calma começa com uma referência clara. Não com mais um palpite.</mark></p></Section>
    <Section className="turning"><Title label="Do caos a um próximo passo">Existe um caminho mais simples: o SOS Bebê</Title><div className="calm-wave" aria-hidden="true"><svg viewBox="0 0 800 100"><path d="M0 50h40l10-30 10 65 12-76 12 80 14-55 13 32 12-16h60q40-50 80 0t80 0q40-25 80 0t80 0q40-10 80 0t80 0h150" fill="none" stroke="currentColor" strokeWidth="4"/></svg><b>SOS Bebê</b></div><p className="center-copy">Criado pela Dra. Valentina, o guia reúne conteúdos em vídeo <strong>organizados por situação</strong>. Para você saber onde encontrar apoio quando mais precisa.</p><p className="center-copy">Não é mais um monte de dicas salvas. É um lugar para consultar com calma, entender os cuidados e conversar melhor com o pediatra.</p></Section>
    <SituationVideos/>
    <Section className="sky authority"><div className="split"><div className="doctor-portrait">{sosOffer.doctorPhoto ? <img src={sosOffer.doctorPhoto} alt="Dra. Valentina, criadora do SOS Bebê" width={400} height={400} loading="lazy" decoding="async"/> : <div className="doctor-placeholder"><HandHeart size={80}/><b>Dra. Valentina</b><span>Criadora do SOS Bebê</span></div>}<span className="portrait-seal"><ShieldCheck/>Guia educativo</span></div><div><Title label="Por trás do guia">Quem está por trás do SOS Bebê</Title><p><strong>Criado pela Dra. Valentina.</strong>{sosOffer.doctorCredentials ? ` ${sosOffer.doctorCredentials}` : ""}</p><p>Uma proposta simples: reunir a preparação em um guia visual para que mães e pais não se sintam perdidos entre tantos palpites.</p><p><strong>Mais clareza para consultar. Mais confiança para pedir ajuda.</strong> E o pediatra sempre como referência no cuidado com seu bebê.</p></div></div></Section>
    <Section><Title label="Os dois pilares">Dois pilares. Uma só plataforma.</Title><div className="grid two pillars"><article className="card"><Soup size={40}/><div className="big-number"><Count value={250}/></div><h3>RECEITAS CASEIRAS</h3><p>Ingredientes, preparo, faixa etária e cuidados, em vídeo. <strong>Consulte o pediatra antes de oferecer qualquer preparo.</strong></p></article><article className="card"><HandHeart size={40}/><div className="big-number"><Count value={100}/></div><h3>MOVIMENTOS EM VÍDEO</h3><p>Posições e movimentos de apoio para acolher o bebê nos momentos difíceis, respeitando seus limites e os cuidados de cada idade.</p></article></div><p className="statement">Tudo organizado para você encontrar o assunto <strong>sem ficar procurando por horas.</strong></p></Section>
    <Section className="cream" id="desejo"><div className="split"><FamilyScene variant="morning"/><div><Title label="Mais calma. Mais confiança.">Imagine a próxima vez que ele chorar…</Title><ul className="check-list">{["Em vez de se perder nos palpites, você respira e abre seu guia", "Sabe onde encontrar o assunto que está procurando", "Vê o passo a passo e entende os cuidados", "Reconhece seus limites e quando é hora de buscar ajuda", "Se sente mais acompanhada no cuidado com seu bebê"].map(text=><li key={text}><Check/>{text}</li>)}</ul><p><strong>Essa é a sensação de ter um apoio organizado ao seu lado.</strong></p><OfferLink location="after-desire"/></div></div></Section>
    <Section><Title label="Seu pacote completo">O que você vai receber</Title><div className="grid three">{includes.map(([title,text],i)=>{const Icon=[Soup,HandHeart,Baby,Search,Smartphone,Play][i];return <article className="card deliverable" key={title}><span className="numbered-icon"><Icon/></span><h3>{title}</h3><p>{text}</p></article>;})}</div>{sosOffer.bonuses.length>0&&<ul className="check-list">{sosOffer.bonuses.map(text=><li key={text}><Check/>{text}</li>)}</ul>}</Section>
    <Section className="sky"><Title label="Uma escolha mais clara">Continuar no improviso vs. ter tudo em um só lugar</Title><div className="comparison"><table><caption className="sr-only">Comparação entre buscar dicas dispersas e usar o SOS Bebê</caption><thead><tr><th scope="col">No dia a dia</th><th scope="col">Dicas soltas</th><th scope="col">SOS Bebê</th></tr></thead><tbody>{["Guia criado pela Dra. Valentina", "Passo a passo em vídeo", "Receitas + movimentos juntos", "Organizado por situação", "Um ponto de partida para consultar", "Acesso centralizado no celular"].map(text=><tr key={text}><th scope="row">{text}</th><td><span aria-label="Varia conforme a fonte">—</span></td><td><Check aria-label="Incluído"/></td></tr>)}<tr><th scope="row">Custo</th><td>Varia por fonte e tentativa</td><td><b>R$ 4,99</b><br/>Pagamento único</td></tr></tbody></table></div></Section>
    <Section className="cream"><Title label="Para quem é">Você não precisa saber tudo. Só não precisa ficar sem apoio.</Title><div className="grid four audience">{["Mãe ou pai de primeira viagem", "Quem se sente inseguro com o bebê", "Quem teme a próxima crise de choro", "Quem cansou de dicas contraditórias"].map(text=><div className="card" key={text}><Heart/><h3>{text}</h3></div>)}</div></Section>
    <Section className="safety" id="seguranca"><div className="safety-card"><ShieldCheck size={44}/><div><Title>O cuidado com o seu bebê vem em primeiro lugar</Title><p>O SOS Bebê é um <strong>conteúdo educativo e complementar</strong>. Não substitui consulta, diagnóstico ou tratamento médico. A adequação de cada conteúdo depende da faixa etária e da orientação do pediatra.</p><p><strong>Em caso de febre, dificuldade para respirar, engasgo, vômitos persistentes, recusa em se alimentar, sonolência excessiva, choro muito diferente do habitual ou qualquer sinal que te preocupe, procure atendimento médico imediatamente.</strong></p><p>Não ofereça chás, receitas ou outros preparos ao bebê por conta própria. Não faça manobras para estimular a evacuação sem orientação profissional. Converse sempre com o pediatra do seu bebê.</p></div></div></Section>
    <SalesFeedbacks/>
    <Section className="dark offer-section" id="oferta"><div className="offer-grid"><div><span className="pill yellow">OFERTA PROMOCIONAL</span><Title>A próxima madrugada não precisa começar com você perdida entre palpites.</Title><p>Mais de 350 conteúdos em vídeo, organizados para apoiar sua rotina. Sem juntar dicas espalhadas. Sem mensalidade.</p><div className="stack-visual" aria-label="Pacote SOS Bebê"><div><Soup/><strong>+250 receitas</strong><span>Preparo, cuidados e faixa etária</span></div><div><HandHeart/><strong>+100 movimentos em vídeo</strong><span>Apoio para os momentos difíceis</span></div><div><Smartphone/><strong>Seu guia no celular</strong><span>Arroto, posições, cocô e cólica</span></div></div></div><div className="offer-card"><Baby size={34}/><span className="eyebrow">SOS Bebê · Pacote completo</span><h3>Tenha um lugar para consultar. Não mais uma tentativa no escuro.</h3><ul className="check-list">{["+250 receitas caseiras em vídeo", "+100 movimentos em vídeo", "Organização por situação", "Acesso pelo celular", "Garantia de 7 dias"].map(text=><li key={text}><Check/>{text}</li>)}</ul><p className="price-label">Hoje por apenas</p><div className="price"><span>R$</span>4<small>,99</small></div><p className="price-note">Pagamento único · Sem mensalidade</p><p className="per-video"><b>Menos de 2 centavos por conteúdo.</b><br/>Um apoio que você pode consultar no dia a dia.</p>{sosOffer.priceChangeNotice&&<p className="price-alert">{sosOffer.priceChangeNotice}</p>}<CheckoutLink location="offer"/><p className="secure"><LockKeyhole size={15}/>Pagamento seguro</p>{sosOffer.paymentMethods.length>0&&<p className="micro payment-methods">{sosOffer.paymentMethods.join(" · ")}</p>}<PurchaseNote/></div></div></Section>
    <Section className="cream"><div className="guarantee"><div className="guarantee-seal"><ShieldCheck size={48}/><b>7</b><span>DIAS</span></div><div><Title>Entre e veja com calma.<br/>Você tem 7 dias de garantia.</Title><p>Se não for o que você esperava, solicite o reembolso dentro de 7 dias pelos canais da compra.</p></div></div></Section>
    <Section className="cream faq"><Title label="Dúvidas frequentes">Para começar sem dúvidas</Title><div className="faq-list">{faq.map(([q,a])=><details key={q}><summary>{q}<ChevronDown size={21}/></summary><p>{a}</p></details>)}</div></Section>
    <Section className="dark final"><Baby size={38}/><Title>A próxima noite difícil pode ser hoje. <mark>Tenha um apoio ao seu lado.</mark></Title><p>Você não precisa acertar tudo sozinha. Tenha vídeos, cuidados e sinais de alerta organizados no celular. Para consultar com mais calma e reconhecer quando pedir ajuda.</p><OfferLink location="final">VER A OFERTA ↑</OfferLink><PurchaseNote/><p className="micro">Conteúdo educativo. O pediatra continua sendo sua referência.</p></Section>
  </main><footer className="footer"><div className="wrap"><div className="brand"><Baby/><span>SOS <b>Bebê</b></span></div><p>© SOS Bebê · Conteúdo educativo, não substitui orientação médica.</p><LegalLinks/>{sosOffer.contactEmail&&<p>{sosOffer.contactEmail}</p>}</div></footer><StickyCheckout/></div>;
}
