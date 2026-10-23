import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { ArrowLeft, Baby, Check, ChevronDown, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { MiniVsl } from '@/components/sos/MiniVsl';
import { QuizClip } from '@/components/sos-quiz/QuizClip';
import { answersForStorage, onceQuiz, safeQuizTrack } from '@/lib/sosQuizTracking';
import { quizMedia, quizKey, steps, questions, questionBenefits, situationBenefits, questionOptions, situationOptions, quizTestimonials, feelings, situations, resultFor, personaFor, readQuiz, type Step, type Answers } from '@/data/sosQuiz';
import { sosOffer, includes } from '@/data/sosOffer';
import { beginBirthCheckout, checkoutDestination } from '@/lib/birthCheckout';
import { scrollToSection } from '@/lib/scrollToOffer';
import './sos-quiz.css';

function ScrollButton({to,children,local}: {to:string;children:ReactNode;local:string}) {
  return <button type="button" className="sq-cta" onClick={()=>{safeQuizTrack(to==='oferta'?'ClickParaOferta':'ClickParaPlano',{local});scrollToSection(to,to==='oferta');}}>{children}</button>;
}
function RealFeedbacks() {
  const [image,setImage]=useState<string|null>(null);
  const [active,setActive]=useState(0);
  const rail=useRef<HTMLDivElement>(null);
  const paused=useRef(false);
  const count=quizTestimonials.length+quizMedia.feedbacks.length;
  const select=useCallback((index:number)=>{
    const node=rail.current;if(!node)return;
    const child=node.children[index] as HTMLElement|undefined;
    if(!child)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollTo({left:child.offsetLeft,behavior:reduced?'auto':'smooth'});
  },[]);
  useEffect(()=>{
    if(!count||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=window.setInterval(()=>{
      if(document.hidden||paused.current||image)return;
      const node=rail.current;if(!node)return;
      const bounds=node.getBoundingClientRect();
      if(bounds.bottom<0||bounds.top>window.innerHeight)return;
      select((active+1)%count);
    },6500);
    return()=>window.clearInterval(timer);
  },[active,count,image,select]);
  if(!count)return null;
  return <section className="sq-section" aria-labelledby="sq-feedback-title"><span className="sq-kicker">EXPERIÊNCIAS COMPARTILHADAS</span><h2 id="sq-feedback-title">O que estão dizendo</h2><div className="sq-feedbacks" ref={rail} tabIndex={0} aria-label="Depoimentos. Deslize para ver mais" onMouseEnter={()=>{paused.current=true;}} onMouseLeave={()=>{paused.current=false;}} onFocusCapture={()=>{paused.current=true;}} onBlurCapture={()=>{paused.current=false;}} onTouchStart={()=>{paused.current=true;}} onTouchEnd={()=>{paused.current=false;}} onScroll={()=>{const node=rail.current;if(!node)return;let closest=0;let distance=Infinity;Array.from(node.children).forEach((child,i)=>{const d=Math.abs((child as HTMLElement).offsetLeft-node.scrollLeft);if(d<distance){distance=d;closest=i;}});setActive(closest);}}>
    {quizTestimonials.map(item=><figure className="sq-testimonial" key={item.name}><figcaption><span className="sq-avatar" aria-hidden="true">{item.name.split(' ').map(n=>n[0]).join('')}</span><strong>{item.name}</strong></figcaption><blockquote>“{item.quote}”</blockquote></figure>)}
    {quizMedia.feedbacks.map(item=><button type="button" key={item.src} onClick={()=>setImage(item.src)} aria-label={`Ampliar ${item.alt}`}><img src={item.src} alt={item.alt} loading="lazy"/></button>)}
  </div><div className="sq-carousel-controls"><button type="button" onClick={()=>select((active+count-1)%count)} aria-label="Depoimento anterior">←</button><span>{active+1} de {count}</span><button type="button" onClick={()=>select((active+1)%count)} aria-label="Próximo depoimento">→</button></div><p className="sq-note">Relatos individuais. Cada bebê e cada experiência são diferentes. O guia não substitui o pediatra.</p><Dialog.Root open={!!image} onOpenChange={open=>{if(!open)setImage(null);}}><Dialog.Portal><Dialog.Overlay className="modal-overlay"/><Dialog.Content className="sq-lightbox"><Dialog.Title className="sr-only">Depoimento ampliado</Dialog.Title><Dialog.Description className="sr-only">Imagem original, sem alterações.</Dialog.Description><Dialog.Close aria-label="Fechar imagem"><X/></Dialog.Close>{image&&<img src={image} alt="Depoimento original ampliado"/>}</Dialog.Content></Dialog.Portal></Dialog.Root></section>;
}

function Legal() {
  return <footer className="sq-footer"><p>SOS Bebê · Conteúdo educativo</p>{[['Privacidade',sosOffer.privacyText],['Termos',sosOffer.termsText]].map(([title,text])=><Dialog.Root key={title}><Dialog.Trigger asChild><button type="button">{title}</button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="modal-overlay"/><Dialog.Content className="sos-modal"><Dialog.Close className="modal-close" aria-label="Fechar documento"><X/></Dialog.Close><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{text||'Documento em preparação. Consulte os termos apresentados na página de pagamento antes de comprar.'}</Dialog.Description></Dialog.Content></Dialog.Portal></Dialog.Root>)}</footer>;
}
function PersonalizedResult({answers}: {answers:Answers}) {
  const {total,vulnerable}=resultFor(answers);
  const offer=useRef<HTMLElement>(null);
  const pending=useRef(false);
  const timer=useRef<number>();
  useEffect(()=>{
    onceQuiz('complete',()=>{safeQuizTrack('Quiz_Complete');safeQuizTrack('Lead',undefined,true);});
    const node=offer.current;if(!node)return;
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){onceQuiz('offer',()=>safeQuizTrack('ViewContent',{content_name:sosOffer.name,value:sosOffer.price,currency:'BRL'},true));observer.disconnect();}},{threshold:.15});
    observer.observe(node);return()=>{observer.disconnect();if(timer.current)clearTimeout(timer.current);};
  },[]);
  const checkout=(event:MouseEvent<HTMLAnchorElement>)=>{
    event.preventDefault();if(pending.current)return;pending.current=true;
    timer.current=beginBirthCheckout(checkoutDestination(event.currentTarget.href,window.location.search),url=>window.location.assign(url));
  };
  const headline=total<=3?`⚠️ ALERTA: você está vulnerável em ${vulnerable} de 5 situações`:total<=7?`ATENÇÃO: você sabe parte do caminho, mas ainda trava em ${vulnerable} de 5 situações`:'Você tem uma boa base. Mas bebê muda, e na hora do aperto a calma some.';
  const sorted=[...situations].sort((a,b)=>resultFor(answers).scores[a.question-3]-resultFor(answers).scores[b.question-3]);
  const status=(q:number)=>answers[q]===0?'Sei exatamente':answers[q]===1?'Mais ou menos':'Não sei por onde começar';
  return <main className="sq-result">
    <section className="sq-section sq-navy"><span className="sq-kicker">SEU RESULTADO ESTÁ PRONTO</span><h1 tabIndex={-1}>{headline}</h1><p>{total<=3?'Isso não é culpa sua. Mas na próxima noite difícil vai ser você ali, com o bebê chorando, sem saber por onde começar.':total<=7?'É nesses momentos que o desespero aparece. Ter um próximo passo claro pode trazer mais confiança.':'Ter o passo a passo à mão faz diferença.'}</p><p className="sq-note">Este resultado reflete apenas as suas respostas sobre preparo. Não avalia a saúde do bebê.</p><div className="sq-bars">{situations.map(s=><div key={s.question}><div><strong>{s.label}</strong><span>{status(s.question)}</span></div><div className="sq-bar-track"><div className={`sq-bar sq-status-${answers[s.question]}`} style={{width:answers[s.question]===0?'100%':answers[s.question]===1?'55%':'15%'}}/></div></div>)}</div><div className="sq-result-promise"><strong>Seu próximo passo não precisa ser mais uma tentativa no escuro.</strong><p>Veja abaixo como o SOS Bebê reúne os vídeos, cuidados e sinais de alerta para consultar nas situações que você marcou.</p></div><ScrollButton to="plano" local="result">VER MEU PLANO ↓</ScrollButton></section>
    <section className="sq-section" id="plano"><span className="sq-kicker">UM PRÓXIMO PASSO MAIS CLARO</span><h2>Seu plano com a Dra. Valentina</h2><p>Comece pelas situações em que você sente mais dificuldade. Um roteiro de consulta baseado nas suas respostas. Ele não é uma orientação médica individual.</p><div className="sq-plan-grid">{sorted.map(s=><article className="sq-plan-card" key={s.question}><span className={`sq-status sq-status-${answers[s.question]}`}>{status(s.question)}</span><h3>{s.label}</h3><QuizClip clip={s.clip} label={s.label}/><p>Na plataforma: vídeo passo a passo + cuidados + sinais de alerta.</p></article>)}</div><ScrollButton to="oferta" local="plan">VER COMO TER TUDO ISSO ↓</ScrollButton></section>
    <RealFeedbacks/>
    <section className="sq-section sq-authority">{quizMedia.doctor&&<img src={quizMedia.doctor} alt="Dra. Valentina, apresentada como criadora do SOS Bebê" width={640} height={1007} loading="lazy"/>}<div><span className="sq-kicker">POR TRÁS DO GUIA</span><h2>Quem está por trás do SOS Bebê</h2><p>Criado pela Dra. Valentina.</p><p>Uma proposta simples: reunir a preparação em um guia visual para que mães e pais não se sintam perdidos entre tantos palpites.</p>{sosOffer.doctorCredentials&&<p>{sosOffer.doctorCredentials}</p>}<p><strong>Mais clareza para consultar. Mais confiança para pedir ajuda.</strong> E o pediatra sempre como referência no cuidado com seu bebê.</p></div></section>
    <section className="sq-section"><h2>Tudo em um só lugar. Para consultar quando precisar.</h2><div className="sq-includes">{includes.map(([title,description])=><article key={title}><Check/><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></section>
    <section className="sq-section sq-navy" id="oferta" ref={offer}><h2>Seu acesso completo ao SOS Bebê</h2><div className="sq-receipt offer-card"><Baby size={40}/><h3>SOS Bebê · Pacote completo</h3><ul>{['+250 receitas caseiras em vídeo','+100 movimentos em vídeo','Vídeos de arrotar, posições, cocô e cólica','Tudo organizado por situação','Acesso pelo celular'].map(t=><li key={t}><Check size={22}/>{t}</li>)}</ul><dl><div><dt>Preço de hoje</dt><dd>R$ 9,90</dd></div><div><dt>+ Taxa do checkout (Cakto)</dt><dd>R$ 0,99</dd></div><div className="sq-total"><dt>TOTAL</dt><dd>R$ 10,89</dd></div></dl><p>Sem pegadinha: você vê o total antes de pagar. <strong>Pagamento único, sem mensalidade.</strong> Cerca de 3 centavos por conteúdo.</p><a className="sq-cta" data-checkout-cta="quiz-offer" href={sosOffer.checkout} onClick={checkout}>QUERO O SOS BEBÊ AGORA →</a><p className="sq-note"><LockKeyhole size={18}/> Pix e cartão · Acesso após confirmar o pagamento · Garantia de 7 dias</p><p className="sq-guarantee"><ShieldCheck/>Você tem 7 dias de garantia para conhecer o conteúdo e solicitar reembolso se não for o que esperava.</p></div></section>
    <section className="sq-section"><h2>Antes de começar, tire suas dúvidas</h2>{[
      ['Como recebo o acesso?','Após a confirmação do pagamento, você recebe as instruções de acesso por e-mail.'],
      ['Funciona no celular?','Sim. Você pode acessar pelo celular, tablet ou computador.'],
      ['É pagamento único?','Sim. R$ 9,90 pelo produto, mais R$ 0,99 de taxa de serviço: total de R$ 10,89. Sem mensalidade.'],
      ['Serve para a idade do meu bebê?','A adequação depende do conteúdo e da faixa etária. Converse com o pediatra antes de aplicar qualquer receita ou movimento.'],
      ['Substitui o pediatra?','Não. É conteúdo educativo e complementar. Não substitui consulta, diagnóstico, remédio ou tratamento prescrito.'],
    ].map(([q,a])=><details className="sq-faq" key={q}><summary>{q}<ChevronDown size={22}/></summary><p>{a}</p></details>)}</section>
    <section className="sq-section sq-safety"><ShieldCheck size={40}/><h2>O cuidado com o seu bebê vem primeiro</h2><p>O SOS Bebê é um conteúdo educativo e complementar. Não substitui consulta, diagnóstico ou tratamento médico. Em caso de febre, dificuldade para respirar, engasgo, vômitos persistentes, recusa em se alimentar, sonolência excessiva, choro muito diferente do habitual ou qualquer sinal que te preocupe, procure atendimento médico imediatamente. Converse sempre com o pediatra do seu bebê.</p><p>Não ofereça receitas, chás ou outros preparos e não faça manobras por conta própria. Respeite a faixa etária e a orientação profissional.</p></section><Legal/>
  </main>;
}
export default function SosDynamicQuiz() {
  const [initial]=useState(readQuiz);
  const [step,setStep]=useState<Step>(initial.step);
  const [answers,setAnswers]=useState<Answers>(initial.answers);
  const [busy,setBusy]=useState(false);
  const [canContinue,setCanContinue]=useState(false);
  const [analysis,setAnalysis]=useState(0);
  const heading=useRef<HTMLHeadingElement>(null);
  const advancing=useRef(false);
  const timer=useRef<number>();
  const go=useCallback((next:Step)=>{
    const route={...(window.history.state||{}),sosQuiz:{step:next}};
    window.history.pushState(route,'',window.location.href);
    setStep(next);setBusy(false);advancing.current=false;
  },[]);
  useEffect(()=>{
    // Keep BrowserRouter's existing state keys and its history index intact.
    window.history.replaceState({...window.history.state,sosQuiz:{step:initial.step}},'',window.location.href);
    const back=(event:PopStateEvent)=>{
      const target=event.state?.sosQuiz?.step;
      if(steps.includes(target)){if(timer.current)clearTimeout(timer.current);advancing.current=false;setBusy(false);setStep(target);}
    };
    window.addEventListener('popstate',back);return()=>{window.removeEventListener('popstate',back);if(timer.current)clearTimeout(timer.current);};
  },[initial.step]);
  useEffect(()=>{
    try{sessionStorage.setItem(quizKey,JSON.stringify(answersForStorage(step,answers)));}catch{/* Continue without browser storage. */}
  },[step,answers]);
  useEffect(()=>{
    window.scrollTo({top:0,behavior:'instant' as ScrollBehavior});heading.current?.focus({preventScroll:true});
  },[step]);
  useEffect(()=>{
    if(step!=='analysis')return;
    setAnalysis(0);const a=window.setTimeout(()=>setAnalysis(1),250);const b=window.setTimeout(()=>setAnalysis(2),550);const c=window.setTimeout(()=>setAnalysis(3),900);const d=window.setTimeout(()=>go('result'),1200);
    return()=>{[a,b,c,d].forEach(clearTimeout);};
  },[step,go]);
  const next=()=>{if(busy)return;go(steps[steps.indexOf(step)+1]||'result');};
  const choose=(q:number,index:number)=>{
    if(advancing.current)return;
    try{navigator.vibrate?.(10);}catch{/* Optional device capability. */}
    if(q===8){const selected=(answers[8]||[]) as number[];setAnswers({...answers,8:selected.includes(index)?selected.filter(i=>i!==index):[...selected,index]});return;}
    advancing.current=true;setBusy(true);setAnswers({...answers,[q]:index});
    safeQuizTrack('Quiz_Answer',{pergunta:q,resposta:index});
    timer.current=window.setTimeout(()=>{go(steps[steps.indexOf(step)+1]);},350);
  };
  const persona=personaFor(answers);
  const q=step.startsWith('q')?Number(step.slice(1)):0;
  const videoQ=step.startsWith('video')?Number(step.slice(5)):0;
  const clip=situations.find(s=>s.question===videoQ)?.clip;
  const options=q>=1&&q<=2?questionOptions[q-1].map((option,i)=>q===2&&i===0&&answers[1]!==0?'O bebê ainda não nasceu':option):q===8?feelings:situationOptions[q]||[];
  const currentQuestion=q||videoQ||8;
  return <div className="sq-root">
    {step==='result'?<PersonalizedResult answers={answers}/>:<>
      {step!=='cover'&&<header className="sq-progress"><div><button aria-label="Voltar à etapa anterior" onClick={()=>window.history.back()}><ArrowLeft size={24}/></button><span>{step==='analysis'?'Preparando seu resultado':`Pergunta ${currentQuestion} de 8`}</span><span>{Math.round(currentQuestion/8*100)}%</span></div><div role="progressbar" aria-label="Progresso do teste" aria-valuemin={0} aria-valuemax={8} aria-valuenow={currentQuestion}><i style={{width:`${currentQuestion/8*100}%`}}/></div></header>}
      <main key={step} className={`sq-screen ${step==='cover'||videoQ||step==='support'?'sq-navy':''} ${step==='cover'?'sq-vsl-first':''}`}>
        <div className="sq-screen-inner">
          {step==='cover'&&<><h1 ref={heading} tabIndex={-1}>Seu bebê chora. Você tenta de tudo. E continua sem saber o que fazer?</h1><p className="sq-opening-copy">Antes da próxima madrugada difícil, assista a este vídeo de 1 minuto. Veja como ter um passo a passo no celular para consultar com mais calma e saber quando pedir ajuda.</p><MiniVsl quizMode onComplete={()=>setCanContinue(true)} onExit={()=>setCanContinue(true)} onContinue={()=>{onceQuiz('start',()=>safeQuizTrack('Quiz_Start',{variant:'vsl-first'}));go('q1');}}/>{canContinue&&<button type="button" className="sq-cta" onClick={()=>{onceQuiz('start',()=>safeQuizTrack('Quiz_Start',{variant:'vsl-first'}));go('q1');}}>CONTINUAR PARA MEU PLANO →</button>}</>}
          {!!q&&<><span className="sq-kicker">{q<=2?'PARA CONHECER SUA ROTINA':q===8?'SEM JULGAMENTO. DE VERDADE.':'PENSE NA SUA ROTINA REAL'}</span><h1 ref={heading} tabIndex={-1}>{questions[q-1]}</h1><p className="sq-question-benefit">{questionBenefits[q]}</p>{q===8&&<p>Você pode escolher mais de uma opção.</p>}<div className="sq-options">{options.map((option,i)=>{const selected=q===8?((answers[8]||[]) as number[]).includes(i):answers[q]===i;return <button type="button" aria-pressed={selected} className={selected?'selected':''} disabled={busy} onClick={()=>choose(q,i)} key={option}>{option}<span>{selected?'✓':'→'}</span></button>;})}</div>{q===8&&<button className="sq-cta" disabled={!((answers[8]||[]) as number[]).length} onClick={()=>{safeQuizTrack('Quiz_Answer',{pergunta:8,resposta:answers[8]});next();}}>CONTINUAR →</button>}</>}
          {!!videoQ&&clip&&<><span className="sq-kicker">{answers[videoQ]===0?'REFORCE O QUE VOCÊ JÁ SABE':'DA DÚVIDA A UM APOIO CONCRETO'}</span><h1 ref={heading} tabIndex={-1}>{situationBenefits[videoQ].title}</h1><p>{answers[videoQ]===0?'Você já se sente com preparo para essa situação. Ter uma referência organizada pode apoiar sua rotina. ':''}{situationBenefits[videoQ].body}</p><QuizClip clip={clip}/><p className="sq-note">Prévia real da organização do guia. Conteúdo educativo, não orientação individual.</p><button className="sq-cta" onClick={next}>CONTINUAR →</button></>}
          {step==='support'&&<><div className="sq-bubbles" aria-hidden="true">{['Faz assim!','Não faz isso!','Vi no TikTok…','Na minha época…'].map(t=><span key={t}>{t}</span>)}</div><h1 ref={heading} tabIndex={-1}>{persona.name}, a culpa não é sua.</h1><p>Ninguém te entregou um guia claro para esses momentos. <strong>E o seu bebê é um só.</strong></p><button className="sq-cta" onClick={next}>VER MEU RESULTADO →</button></>}
          {step==='analysis'&&<div role="status" aria-live="polite"><div className="sq-loader" aria-hidden="true"/><h1 ref={heading} tabIndex={-1}>Analisando suas respostas…</h1><ul className="sq-analysis">{['Mapeando as 5 situações','Calculando seu nível de preparo','Montando seu plano com a Dra. Valentina'].map((text,i)=><li key={text}>{analysis>i?<Check/>:<span className="sq-dot"/>}{text}</li>)}</ul></div>}
        </div>
      </main>
    </>}
  </div>;
}
