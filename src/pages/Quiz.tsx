import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ArrowRight, Baby, Check, ChevronDown, Heart, Moon, Play, ShieldCheck, Smartphone, Soup, X, MessageCircle, Search, HandHeart, LockKeyhole } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { FamilyScene } from "@/components/sos/FamilyScene";
import { sosOffer, includes } from "@/data/sosOffer";
import { beginBirthCheckout, checkoutDestination } from "@/lib/birthCheckout";
import { trackStandard } from "@/lib/metaPixel";

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
    timer.current = beginBirthCheckout(destination, url => { pending.current = false; window.location.assign(url); });
  };
  return <a className="sos-cta" href={sosOffer.checkout} onClick={checkout} data-checkout-cta={location}><span>{children}</span><ArrowRight size={21} aria-hidden="true" /></a>;
}
function PurchaseNote() { return <p className="micro">Pagamento único de R$ 17,90 · Acesso após confirmar o pagamento · Garantia de 7 dias</p>; }
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
      const step = (time: number) => { const ratio = Math.min((time - start) / 650, 1); node.textContent = `+${Math.round(value * (1 - (1 - ratio) ** 3))}`; if (ratio < 1) frame = requestAnimationFrame(step); };
      frame = requestAnimationFrame(step);
    });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <span ref={element}>+{value}</span>;
}
function PhoneMockup() {
  return <figure className="hero-art"><FamilyScene /><div className="phone"><div className="notch"/><div className="phone-logo"><Baby size={21}/><b>SOS Bebê</b></div><small>Um passo de cada vez.</small><h3>Como podemos<br/>te apoiar hoje?</h3>{[["Choro intenso",Heart],["Gases e arroto",Baby],["Cólicas e conforto",HandHeart]].map(([text, Icon]) => { const I = Icon as typeof Heart; return <div className="phone-row" key={String(text)}><span><I size={21}/></span><b>{String(text)}</b><Play size={15}/></div>; })}<div className="phone-hint"><ShieldCheck size={16}/>Cuidados por faixa etária</div></div><figcaption>Interface e ilustrações demonstrativas da organização do guia.</figcaption></figure>;
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
      if (!sent && ratio >= .5) { sent = true; try { trackStandard("ViewContent", { content_name: sosOffer.name, content_type: "product", value: 17.90, currency: "BRL" }); } catch { /* Analytics cannot block reading. */ } }
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
function StickyCheckout({ hero }: { hero: React.RefObject<HTMLElement> }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = hero.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0));
    observer.observe(element); return () => observer.disconnect();
  }, [hero]);
  if (!visible) return null;
  return <aside className="sticky-buy" aria-label="Comprar SOS Bebê"><div><b>SOS Bebê</b><span>R$ 17,90</span></div><CheckoutLink location="sticky">QUERO AGORA</CheckoutLink></aside>;
}
function ExitOffer() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onExit = (e: globalThis.MouseEvent) => {
      if (e.relatedTarget || e.clientY > 0 || !window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches) return;
      try { if (sessionStorage.getItem("sos-exit-v1")) return; sessionStorage.setItem("sos-exit-v1", "1"); } catch { return; }
      setOpen(true);
    };
    document.addEventListener("mouseout", onExit); return () => document.removeEventListener("mouseout", onExit);
  }, []);
  return <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className="modal-overlay"/><Dialog.Content className="sos-modal"><Dialog.Close className="modal-close" aria-label="Fechar aviso"><X/></Dialog.Close><Baby className="modal-icon" size={42}/><Dialog.Title>Um apoio para a próxima noite difícil.</Dialog.Title><Dialog.Description>O SOS Bebê está em condição especial de lançamento. Tenha seu guia organizado no celular por R$ 17,90.</Dialog.Description><CheckoutLink location="exit"/><PurchaseNote/></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
const checklist = ["Já entrei em pânico sem saber o que fazer quando ele chorou", "Já fiquei horas procurando no celular e saí mais confusa", "Já senti culpa por não conseguir acalmá-lo", "Já corri pra farmácia só para tentar ‘fazer alguma coisa’", "Já recebi mil palpites e não sabia em quem confiar", "Já me senti sozinha nas noites difíceis"];
function Identification() {
  const [selected, setSelected] = useState<string[]>([]);
  return <Section className="cream"><div className="split"><div><Title label="Você se identifica?">Marque o que já aconteceu com você</Title><div className="checklist">{checklist.map(item => <label key={item}><input type="checkbox" checked={selected.includes(item)} onChange={() => setSelected(old => old.includes(item) ? old.filter(x => x !== item) : [...old, item])}/><span>{item}</span></label>)}</div><p className="selection-count" role="status">Você marcou {selected.length} de 6</p></div><FamilyScene variant="community"/></div>{selected.length > 0 && <div className="reassurance" role="status"><Heart size={28}/><p><b>Você não está sozinha, e a culpa não é sua.</b><br/>O SOS Bebê foi feito para te dar apoio nesses momentos.</p><CheckoutLink location="checklist"/></div>}</Section>;
}
const situations = ["Choro intenso", "Cólicas", "Gases e arroto", "Cocô", "Imprevistos"];
function SituationSelector() {
  const [active, setActive] = useState(situations[0]);
  return <Section><Title label="Escolha. Assista. Faça.">Abriu. Viu. Fez.</Title><div className="steps">{["Escolha a situação", "Assista ao vídeo", "Faça com mais segurança"].map((text,i) => <div key={text}><b>0{i+1}</b><span>{text}</span></div>)}</div><div className="situation-demo"><div className="chips" role="tablist" aria-label="Situações do guia">{situations.map((text,i) => <button key={text} type="button" role="tab" id={`situation-${i}`} aria-selected={active===text} aria-controls="situation-content" onClick={()=>setActive(text)} onKeyDown={e => { if (["ArrowRight","ArrowLeft","Home","End"].includes(e.key)) { e.preventDefault(); const index=e.key==="Home"?0:e.key==="End"?4:(i+(e.key==="ArrowRight"?1:4))%5; setActive(situations[index]); document.getElementById(`situation-${index}`)?.focus(); } }} tabIndex={active===text?0:-1}>{text}</button>)}</div><div role="tabpanel" id="situation-content" aria-labelledby={`situation-${situations.indexOf(active)}`} className="situation-card"><div className="demo-preview"><Play size={34}/><span>Passo a passo em vídeo</span></div><div><span className="eyebrow">Organização por situação</span><h3>{active}</h3><ul className="icon-list"><li><Play/>Vídeo passo a passo</li><li><Soup/>Conteúdos de alimentação por faixa etária</li><li><HandHeart/>Movimentos de apoio e acolhimento</li><li><ShieldCheck/>Cuidados e sinais de alerta</li></ul><CheckoutLink location="situations"/></div></div><p className="micro">Exemplo ilustrativo da organização da plataforma. Não é uma orientação médica.</p></div></Section>;
}
const faq = [
  ["Como recebo o acesso?", "Logo após a confirmação do pagamento, você recebe as instruções de acesso por e-mail."],
  ["Funciona pelo celular?", "Sim, celular, tablet ou computador."],
  ["É pagamento único?", "Sim, R$ 17,90, sem mensalidade."],
  ["Serve para recém-nascido?", "A adequação depende do conteúdo e da idade. Converse sempre com o pediatra. Não ofereça receitas, chás ou outros preparos a recém-nascidos por conta própria."],
  ["Substitui o pediatra ou o remédio?", "Não. É um conteúdo educativo e complementar de apoio. Em caso de dúvida ou sinal de alerta, procure atendimento médico. Não interrompa um tratamento prescrito."],
  ["Os vídeos são fáceis de seguir?", "São apresentados passo a passo, com uma organização simples para mães, pais e responsáveis."],
  ["Tem garantia?", "Sim, 7 dias para solicitar reembolso caso não seja o que você esperava."],
  ...(sosOffer.accessDuration ? [["Por quanto tempo tenho acesso?", sosOffer.accessDuration]] : []),
];
function LegalLinks() {
  return <div className="legal-links">{[["Política de Privacidade",sosOffer.privacyText],["Termos de Uso",sosOffer.termsText]].map(([title,text]) => <Dialog.Root key={title}><Dialog.Trigger asChild><button type="button">{title}</button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="modal-overlay"/><Dialog.Content className="sos-modal"><Dialog.Close className="modal-close" aria-label="Fechar documento"><X/></Dialog.Close><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{text || "Documento em preparação. O texto completo será disponibilizado pelo responsável pelo SOS Bebê. Consulte também os termos apresentados no checkout antes de comprar."}</Dialog.Description></Dialog.Content></Dialog.Portal></Dialog.Root>)}</div>;
}
export default function SalesPage() {
  const hero = useRef<HTMLElement>(null);
  return <div className="sos-page"><RevealSections/><ReadingProgress/><div className="top-bar">👶 Bebê chorando sem parar? Tenha um guia para agir com mais segurança.</div><main>
    <section className="hero dark" ref={hero}><div className="wrap hero-grid"><div><a className="brand" href="#inicio" aria-label="SOS Bebê, início"><Baby size={30}/><span>SOS <b>Bebê</b></span></a><span className="pill" id="inicio">CRIADO PELA DRA. VALENTINA</span><h1>Bebê chorando sem parar e você sem saber o que fazer? <mark>Chega de improvisar no desespero.</mark></h1><p className="lead">Um guia completo em vídeo para mães e pais de primeira viagem: <strong>+250 receitas caseiras e +100 movimentos</strong> para apoiar o cuidado com mais segurança. Escolha, assista, faça.</p><CheckoutLink location="hero"/><PurchaseNote/><p className="hero-care">Conteúdo educativo. Receitas e movimentos dependem da faixa etária e da orientação do pediatra.</p></div><PhoneMockup/></div><div className="wrap"><div className="trust-strip"><div><Soup/><b><Count value={250}/> receitas</b></div><div><Play/><b><Count value={100}/> movimentos em vídeo</b></div><div><Smartphone/><b>Acesso no celular</b></div></div><p className="hero-ending">Feito para quem é de primeira viagem e ainda se sente inseguro. <strong>Isso é normal. Você pode contar com um guia.</strong></p></div></section>
    <Section className="dark night"><div className="split"><div><Title label="A madrugada">Ninguém te prepara para a noite em que o bebê não para de chorar</Title><ol className="timeline">{[["02:47","O choro começa. Você acorda de susto, com o coração acelerado."],["03:10","Colo, balanço, canto… você já tentou tudo o que sabia. Nada parece acalmar."],["03:40","Sua mão treme no celular. Um vídeo diz uma coisa. O grupo diz outra."],["04:15","Cansada e com culpa: ‘será que eu estou fazendo algo errado?’"],["05:00","O dia amanhece. Você não dormiu. De novo."]].map(([time,text])=><li key={time}><time>{time}</time><p>{text}</p></li>)}</ol></div><div><FamilyScene variant="night"/><p className="statement"><mark>Você não precisa enfrentar essa insegurança sozinha.</mark></p><CheckoutLink location="night"/></div></div></Section>
    <Identification/>
    <Section className="sky"><div className="split"><div><Title label="A confusão dos palpites">Todo mundo tem uma opinião. Só que o seu bebê é um só.</Title><p>Cada fonte diz uma coisa. E quando o bebê chora, você não tem cabeça para mais confusão.</p><p>Você precisa de <strong>um lugar organizado, em vídeo</strong>, para encontrar apoio e reconhecer quando buscar ajuda.</p></div><FamilyScene variant="confusion"/></div><div className="grid four">{[[Moon,"Noites sem dormir","Você exausta."],[Heart,"Insegurança","Você sem saber por onde começar."],[MessageCircle,"Dicas soltas","Você sem saber em quem confiar."],[Search,"Tentativas no impulso","Mais dúvidas e gastos que pesam."]].map(([Icon,title,text])=>{const I=Icon as typeof Heart;return <article className="card" key={String(title)}><I className="card-icon"/><h3>{String(title)}</h3><p>{String(text)}</p></article>;})}</div><p className="statement"><mark>Mais calma começa com uma orientação clara — não com mais um palpite.</mark></p><CheckoutLink location="confusion"/></Section>
    <Section className="turning"><Title label="Do caos a um próximo passo">Existe um caminho mais simples: o SOS Bebê</Title><div className="calm-wave" aria-hidden="true"><svg viewBox="0 0 800 100"><path d="M0 50h40l10-30 10 65 12-76 12 80 14-55 13 32 12-16h60q40-50 80 0t80 0q40-25 80 0t80 0q40-10 80 0t80 0h150" fill="none" stroke="currentColor" strokeWidth="4"/></svg><b>SOS Bebê</b></div><p className="center-copy">Criado pela Dra. Valentina, o guia reúne conteúdos em vídeo <strong>organizados por situação</strong>. Para você saber onde encontrar apoio quando mais precisa.</p><p className="center-copy">Não é mais um monte de dicas salvas. É um lugar para consultar com calma, entender os cuidados e conversar melhor com o pediatra.</p></Section>
    <SituationSelector/>
    <Section className="sky authority"><div className="split"><div className="doctor-portrait">{sosOffer.doctorPhoto ? <img src={sosOffer.doctorPhoto} alt="Dra. Valentina, criadora do SOS Bebê" width={400} height={400} loading="lazy" decoding="async"/> : <div className="doctor-placeholder"><HandHeart size={80}/><b>Dra. Valentina</b><span>Criadora do SOS Bebê</span></div>}<span className="portrait-seal"><ShieldCheck/>Guia educativo</span></div><div><Title label="Por trás do guia">Quem está por trás do SOS Bebê</Title><p><strong>Criado pela Dra. Valentina.</strong>{sosOffer.doctorCredentials ? ` ${sosOffer.doctorCredentials}` : ""}</p><p>Uma proposta simples: reunir a preparação em um guia visual para que mães e pais não se sintam perdidos entre tantos palpites.</p><p><strong>Mais clareza para consultar. Mais confiança para pedir ajuda.</strong> E o pediatra sempre como referência no cuidado com seu bebê.</p></div></div></Section>
    <Section><Title label="Os dois pilares">Dois pilares. Uma só plataforma.</Title><div className="grid two pillars"><article className="card"><Soup size={40}/><div className="big-number"><Count value={250}/></div><h3>RECEITAS CASEIRAS</h3><p>Ingredientes, preparo, faixa etária e cuidados, em vídeo. <strong>Consulte o pediatra antes de oferecer qualquer preparo.</strong></p></article><article className="card"><HandHeart size={40}/><div className="big-number"><Count value={100}/></div><h3>MOVIMENTOS EM VÍDEO</h3><p>Posições e movimentos de apoio para acolher o bebê nos momentos difíceis, respeitando seus limites e os cuidados de cada idade.</p></article></div><p className="statement">Tudo organizado para você encontrar o assunto <strong>sem ficar procurando por horas.</strong></p><CheckoutLink location="pillars"/></Section>
    <Section className="cream"><div className="split"><FamilyScene variant="morning"/><div><Title label="Mais calma. Mais confiança.">Imagine a próxima vez que ele chorar…</Title><ul className="check-list">{["Em vez de se perder nos palpites, você respira e abre seu guia", "Sabe onde encontrar o assunto que está procurando", "Vê o passo a passo e entende os cuidados", "Reconhece seus limites e quando é hora de buscar ajuda", "Se sente mais acompanhada no cuidado com seu bebê"].map(text=><li key={text}><Check/>{text}</li>)}</ul><p><strong>Essa é a sensação de ter um apoio organizado ao seu lado.</strong></p><CheckoutLink location="desire"/></div></div></Section>
    <Section><Title label="Seu pacote completo">O que você vai receber</Title><div className="grid three">{includes.map(([title,text],i)=>{const Icon=[Soup,HandHeart,Baby,Search,Smartphone,Play][i];return <article className="card deliverable" key={title}><span className="numbered-icon"><Icon/></span><h3>{title}</h3><p>{text}</p></article>;})}</div>{sosOffer.bonuses.length>0&&<ul className="check-list">{sosOffer.bonuses.map(text=><li key={text}><Check/>{text}</li>)}</ul>}<CheckoutLink location="includes"/></Section>
    <Section className="sky"><Title label="Uma escolha mais clara">Continuar no improviso vs. ter tudo em um só lugar</Title><div className="comparison"><table><caption className="sr-only">Comparação entre buscar dicas dispersas e usar o SOS Bebê</caption><thead><tr><th scope="col">No dia a dia</th><th scope="col">Dicas soltas</th><th scope="col">SOS Bebê</th></tr></thead><tbody>{["Guia criado pela Dra. Valentina", "Passo a passo em vídeo", "Receitas + movimentos juntos", "Organizado por situação", "Um ponto de partida para consultar", "Acesso centralizado no celular"].map(text=><tr key={text}><th scope="row">{text}</th><td><span aria-label="Varia conforme a fonte">—</span></td><td><Check aria-label="Incluído"/></td></tr>)}<tr><th scope="row">Custo</th><td>Varia por fonte e tentativa</td><td><b>R$ 17,90</b><br/>Pagamento único</td></tr></tbody></table></div></Section>
    <Section className="cream"><Title label="Para quem é">Você não precisa saber tudo. Só não precisa ficar sem apoio.</Title><div className="grid four audience">{["Mãe ou pai de primeira viagem", "Quem se sente inseguro com o bebê", "Quem teme a próxima crise de choro", "Quem cansou de dicas contraditórias"].map(text=><div className="card" key={text}><Heart/><h3>{text}</h3></div>)}</div></Section>
    <Section className="safety" id="seguranca"><div className="safety-card"><ShieldCheck size={44}/><div><Title>O cuidado com o seu bebê vem em primeiro lugar</Title><p>O SOS Bebê é um <strong>conteúdo educativo e complementar</strong>. Não substitui consulta, diagnóstico ou tratamento médico. A adequação de cada conteúdo depende da faixa etária e da orientação do pediatra.</p><p><strong>Em caso de febre, dificuldade para respirar, engasgo, vômitos persistentes, recusa em se alimentar, sonolência excessiva, choro muito diferente do habitual ou qualquer sinal que te preocupe, procure atendimento médico imediatamente.</strong></p><p>Não ofereça chás, receitas ou outros preparos ao bebê por conta própria. Não faça manobras para estimular a evacuação sem orientação profissional. Converse sempre com o pediatra do seu bebê.</p></div></div></Section>
    {sosOffer.testimonials.length>=3&&<Section><Title>Famílias que compartilharam sua experiência</Title><div className="grid three">{sosOffer.testimonials.map(t=><figure className="card" key={t.name}><img src={t.image} alt={t.name} width={72} height={72} loading="lazy"/><blockquote>{t.quote}</blockquote><figcaption>{t.name} · {t.city}</figcaption></figure>)}</div></Section>}
    <Section className="dark offer-section" id="oferta"><div className="offer-grid"><div><span className="pill yellow">CONDIÇÃO ESPECIAL DE LANÇAMENTO</span><Title>Um guia inteiro.<br/><mark>Ao alcance da sua mão.</mark></Title><p>Mais de 350 conteúdos em vídeo, organizados para apoiar sua rotina. Sem juntar dicas espalhadas. Sem mensalidade.</p><div className="stack-visual" aria-label="Pacote SOS Bebê"><div><Soup/><strong>+250 receitas</strong><span>Preparo, cuidados e faixa etária</span></div><div><HandHeart/><strong>+100 movimentos em vídeo</strong><span>Apoio para os momentos difíceis</span></div><div><Smartphone/><strong>Seu guia no celular</strong><span>Arroto, posições, cocô e cólica</span></div></div></div><div className="offer-card"><Baby size={34}/><span className="eyebrow">SOS Bebê · Pacote completo</span><h3>Seu próximo passo para cuidar com mais confiança.</h3><ul className="check-list">{["+250 receitas caseiras em vídeo", "+100 movimentos em vídeo", "Organização por situação", "Acesso pelo celular", "Garantia de 7 dias"].map(text=><li key={text}><Check/>{text}</li>)}</ul><p className="price-label">Hoje por apenas</p><div className="price"><span>R$</span>17<small>,90</small></div><p className="price-note">Pagamento único · Sem mensalidade</p><p className="per-video"><b>Menos de 6 centavos por conteúdo.</b><br/>Um apoio que você pode consultar no dia a dia.</p>{sosOffer.priceChangeNotice&&<p className="price-alert">{sosOffer.priceChangeNotice}</p>}<CheckoutLink location="offer"/><p className="secure"><LockKeyhole size={15}/>Pagamento no ambiente seguro da Cakto</p><p className="micro checkout-fee">No checkout consultado, a Cakto acrescenta R$ 0,99 de taxa de serviço: total de R$ 18,89. Confira o total antes de pagar.</p>{sosOffer.paymentMethods.length>0&&<p className="micro">{sosOffer.paymentMethods.join(" · ")}</p>}<PurchaseNote/></div></div></Section>
    <Section className="cream"><div className="guarantee"><div className="guarantee-seal"><ShieldCheck size={48}/><b>7</b><span>DIAS</span></div><div><Title>Entre e veja com calma.<br/>Você tem 7 dias de garantia.</Title><p>Se não for o que você esperava, solicite o reembolso dentro de 7 dias pelos canais da compra.</p><CheckoutLink location="guarantee"/></div></div></Section>
    <Section className="cream faq"><Title label="Dúvidas frequentes">Para começar sem dúvidas</Title><div className="faq-list">{faq.map(([q,a])=><details key={q}><summary>{q}<ChevronDown size={21}/></summary><p>{a}</p></details>)}</div></Section>
    <Section className="dark final"><Baby size={38}/><Title>A próxima noite difícil pode ser hoje. <mark>Tenha um apoio ao seu lado.</mark></Title><p>Na tela do seu celular, um guia organizado para os momentos em que você mais precisa de clareza.</p><CheckoutLink location="final"/><PurchaseNote/><p className="micro">Conteúdo educativo. O pediatra continua sendo sua referência.</p></Section>
  </main><footer className="footer"><div className="wrap"><div className="brand"><Baby/><span>SOS <b>Bebê</b></span></div><p>© SOS Bebê · Conteúdo educativo, não substitui orientação médica.</p><LegalLinks/>{sosOffer.contactEmail&&<p>{sosOffer.contactEmail}</p>}</div></footer><StickyCheckout hero={hero}/><ExitOffer/></div>;
}
