import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { ArrowLeft, Baby, Check, ChevronDown, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { MiniVsl } from '@/components/sos/MiniVsl';
import { QuizClip } from '@/components/sos-quiz/QuizClip';
import { answersForStorage, onceQuiz, safeQuizTrack } from '@/lib/sosQuizTracking';
import { quizMedia, quizKey, steps, questions, questionOptions, knowledgeOptions, feelings, situations, resultFor, personaFor, readQuiz, type Step, type Answers } from '@/data/sosQuiz';
import { sosOffer, includes } from '@/data/sosOffer';
import { beginBirthCheckout, checkoutDestination } from '@/lib/birthCheckout';
import { scrollToSection } from '@/lib/scrollToOffer';
import './sos-quiz.css';

function ScrollButton({to,children,local}: {to:string;children:ReactNode;local:string}) {
  return <button type="button" className="sq-cta" onClick={()=>{safeQuizTrack(to==='oferta'?'ClickParaOferta':'ClickParaPlano',{local});scrollToSection(to,to==='oferta');}}>{children}</button>;
}
function PreviewGallery() {
  const [active,setActive]=useState(0);
  const clips=[quizMedia.choro,quizMedia.colica,quizMedia.gases,quizMedia.imprevistos];
  const clip=clips[active];
  return <section className="sq-section sq-navy" aria-labelledby="sq-gallery"><span className="sq-kicker">VEJA POR DENTRO</span><h2 id="sq-gallery">Do palpite ao passo a passo.</h2><p>Veja uma prévia dos vídeos que organizam cada situação na plataforma.</p><div className="sq-tabs" role="tablist" aria-label="Prévias da plataforma">{clips.map((c,i)=><button id={`sq-tab-${i}`} aria-controls="sq-gallery-panel" role="tab" aria-selected={i===active} tabIndex={i===active?0:-1} key={c.id} onClick={()=>setActive(i)} onKeyDown={e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4;setActive(n);document.getElementById(`sq-tab-${n}`)?.focus();}}>{c.label}</button>)}</div><div role="tabpanel" id="sq-gallery-panel" aria-labelledby={`sq-tab-${active}`}><QuizClip key={clip.id} clip={clip}/></div><p className="sq-note">Exemplo ilustrativo do conteúdo da plataforma. Não é depoimento de cliente.</p></section>;
}
function RealFeedbacks() {
  const [image,setImage]=useState<string|null>(null);
  if(!quizMedia.feedbacks.length)return null;
  return <section className="sq-section"><h2>O que estão dizendo</h2><div className="sq-feedbacks">{quizMedia.feedbacks.map(item=><button type="button" key={item.src} onClick={()=>setImage(item.src)} aria-label={`Ampliar ${item.alt}`}><img src={item.src} alt={item.alt} loading="lazy"/></button>)}</div><Dialog.Root open={!!image} onOpenChange={open=>{if(!open)setImage(null);}}><Dialog.Portal><Dialog.Overlay className="modal-overlay"/><Dialog.Content className="sq-lightbox"><Dialog.Title className="sr-only">Depoimento ampliado</Dialog.Title><Dialog.Description className="sr-only">Imagem original, sem alterações.</Dialog.Description><Dialog.Close aria-label="Fechar imagem"><X/></Dialog.Close>{image&&<img src={image} alt="Depoimento original ampliado"/>}</Dialog.Content></Dialog.Portal></Dialog.Root></section>;
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
    <section className="sq-section sq-navy"><span className="sq-kicker">SEU RESULTADO ESTÁ PRONTO</span><h1 tabIndex={-1}>{headline}</h1><p>{total<=3?'Isso não é culpa sua. Mas na próxima noite difícil vai ser você ali, com o bebê chorando, sem saber por onde começar.':total<=7?'É nesses momentos que o desespero aparece. Ter um próximo passo claro pode trazer mais confiança.':'Ter o passo a passo à mão faz diferença.'}</p><p className="sq-note">Este resultado reflete apenas as suas respostas sobre preparo. Não avalia a saúde do bebê.</p><div className="sq-bars">{situations.map(s=><div key={s.question}><div><strong>{s.label}</strong><span>{status(s.question)}</span></div><div className="sq-bar-track"><div className={`sq-bar sq-status-${answers[s.question]}`} style={{width:answers[s.question]===0?'100%':answers[s.question]===1?'55%':'15%'}}/></div></div>)}</div><h2 className="sq-vsl-title">Assista: a Dra. Valentina explica como mudar isso em 1 minuto · {quizMedia.vsl.durationLabel}</h2><MiniVsl quizMode/><ScrollButton to="plano" local="result">VER MEU PLANO ↓</ScrollButton></section>
    <section className="sq-section" id="plano"><span className="sq-kicker">UM PRÓXIMO PASSO MAIS CLARO</span><h2>Seu plano com a Dra. Valentina</h2><p>Comece pelas situações em que você sente mais dificuldade. Um roteiro de consulta baseado nas suas respostas — não uma orientação médica individual.</p><div className="sq-plan-grid">{sorted.map(s=><article className="sq-plan-card" key={s.question}><span className={`sq-status sq-status-${answers[s.question]}`}>{status(s.question)}</span><h3>{s.label}</h3><QuizClip clip={s.clip} label={s.label}/><p>Na plataforma: vídeo passo a passo + cuidados + sinais de alerta.</p></article>)}</div><ScrollButton to="oferta" local="plan">VER COMO TER TUDO ISSO ↓</ScrollButton></section>
    <PreviewGallery/><RealFeedbacks/>
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
    setAnalysis(0);const a=window.setTimeout(()=>setAnalysis(1),800);const b=window.setTimeout(()=>setAnalysis(2),1800);const c=window.setTimeout(()=>setAnalysis(3),2700);const d=window.setTimeout(()=>go('result'),3500);
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
  const options=q>=1&&q<=2?questionOptions[q-1].map((option,i)=>q===2&&i===0&&answers[1]!==0?'O bebê ainda não nasceu':option):q===8?feelings:knowledgeOptions;
  const currentQuestion=q||videoQ||8;
  // Metadata only: prewarm the nearest upcoming clip without downloading every preview.
  const nextVideo=q>0?situations.find(s=>[3,4,5,7].includes(s.question)&&s.question>=q)?.clip:undefined;
  return <div className="sq-root">
    {step==='result'?<PersonalizedResult answers={answers}/>:<>
      {step!=='cover'&&<header className="sq-progress"><div><button aria-label="Voltar à etapa anterior" onClick={()=>window.history.back()}><ArrowLeft size={24}/></button><span>{step==='analysis'?'Preparando seu resultado':`Pergunta ${currentQuestion} de 8`}</span><span>{Math.round(currentQuestion/8*100)}%</span></div><div role="progressbar" aria-label="Progresso do teste" aria-valuemin={0} aria-valuemax={8} aria-valuenow={currentQuestion}><i style={{width:`${currentQuestion/8*100}%`}}/></div></header>}
      <main key={step} className={`sq-screen ${step==='cover'||videoQ||step==='support'?'sq-navy':''}`}>
        <div className="sq-screen-inner">
          {step==='cover'&&<><span className="sq-kicker">TESTE RÁPIDO · 1 MINUTO · GRATUITO</span><h1 ref={heading} tabIndex={-1}>Você sabe o que fazer quando o seu bebê não para de chorar?</h1><p>Muita mãe e muito pai de primeira viagem trava nessa hora. Descubra em 1 minuto em quais situações você ainda está vulnerável.</p><div className="sq-doctor">{quizMedia.doctor&&<img src={quizMedia.doctor} alt="Dra. Valentina" width={72} height={88}/>}<p>Teste do guia <strong>SOS Bebê</strong>, da Dra. Valentina{sosOffer.doctorCredentials&&<span>{sosOffer.doctorCredentials}</span>}</p></div><button className="sq-cta" onClick={()=>{onceQuiz('start',()=>safeQuizTrack('Quiz_Start'));go('q1');}}>COMEÇAR O TESTE →</button><p className="sq-note">Menos de 1 minuto para responder · Sem cadastro</p></>}
          {!!q&&<><span className="sq-kicker">{q<=2?'PARA CONHECER SUA ROTINA':q===8?'SEM JULGAMENTO. DE VERDADE.':'PENSE NA SUA ROTINA REAL'}</span><h1 ref={heading} tabIndex={-1}>{questions[q-1]}</h1>{q===8&&<p>Você pode escolher mais de uma opção.</p>}<div className="sq-options">{options.map((option,i)=>{const selected=q===8?((answers[8]||[]) as number[]).includes(i):answers[q]===i;return <button type="button" aria-pressed={selected} className={selected?'selected':''} disabled={busy} onClick={()=>choose(q,i)} key={option}>{option}<span>{selected?'✓':'→'}</span></button>;})}</div>{q===8&&<button className="sq-cta" disabled={!((answers[8]||[]) as number[]).length} onClick={()=>{safeQuizTrack('Quiz_Answer',{pergunta:8,resposta:answers[8]});next();}}>CONTINUAR →</button>}</>}
          {!!videoQ&&clip&&<><h1 ref={heading} tabIndex={-1}>{answers[videoQ]===0?'Saber é importante. Ter o passo a passo à mão também.':'É exatamente aqui que muita gente trava.'}</h1><p>{answers[videoQ]===0?`Ótimo. Mas será que você consegue fazer isso com calma, às 3 da manhã, ${persona.tired}, com o bebê gritando? Veja como a Dra. Valentina mostra isso, passo a passo.`:'Na plataforma, cada situação tem um vídeo passo a passo, com cuidados e sinais de alerta. Veja um exemplo.'}</p><QuizClip clip={clip}/><p className="sq-note">Exemplo ilustrativo do conteúdo da plataforma.</p><button className="sq-cta" onClick={next}>CONTINUAR →</button></>}
          {step==='support'&&<><div className="sq-bubbles" aria-hidden="true">{['Faz assim!','Não faz isso!','Vi no TikTok…','Na minha época…'].map(t=><span key={t}>{t}</span>)}</div><h1 ref={heading} tabIndex={-1}>{persona.name}, a culpa não é sua.</h1><p>Ninguém te entregou um guia claro para esses momentos. <strong>E o seu bebê é um só.</strong></p><button className="sq-cta" onClick={next}>VER MEU RESULTADO →</button></>}
          {step==='analysis'&&<div role="status" aria-live="polite"><div className="sq-loader" aria-hidden="true"/><h1 ref={heading} tabIndex={-1}>Analisando suas respostas…</h1><ul className="sq-analysis">{['Mapeando as 5 situações','Calculando seu nível de preparo','Montando seu plano com a Dra. Valentina'].map((text,i)=><li key={text}>{analysis>i?<Check/>:<span className="sq-dot"/>}{text}</li>)}</ul></div>}
        </div>
      </main>
      {nextVideo&&<video className="sq-preload" key={nextVideo.src} src={nextVideo.src} preload="metadata" muted playsInline aria-hidden="true" tabIndex={-1}/>}
    </>}
  </div>;
}
