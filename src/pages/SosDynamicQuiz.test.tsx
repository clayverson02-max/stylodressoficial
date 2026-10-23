import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SosDynamicQuiz from './SosDynamicQuiz';
import { quizKey, readQuiz, resultFor } from '@/data/sosQuiz';
import { trackCustom, trackStandard, trackInitiateCheckout } from '@/lib/metaPixel';

vi.mock('@/lib/metaPixel',()=>({trackCustom:vi.fn(),trackStandard:vi.fn(),trackInitiateCheckout:vi.fn()}));
const observers:{callback:IntersectionObserverCallback;observe:ReturnType<typeof vi.fn>}[]=[];
beforeEach(()=>{
  vi.useFakeTimers();sessionStorage.clear();vi.clearAllMocks();observers.length=0;
  vi.stubGlobal('scrollTo',vi.fn());
  vi.stubGlobal('IntersectionObserver',class {callback:IntersectionObserverCallback;observe=vi.fn();disconnect=vi.fn();unobserve=vi.fn();constructor(callback:IntersectionObserverCallback){this.callback=callback;observers.push(this);}});
  vi.spyOn(HTMLMediaElement.prototype,'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype,'pause').mockImplementation(()=>{});
  window.history.replaceState({},'', '/quiz?utm_source=test&fbclid=abc');
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.restoreAllMocks();vi.useRealTimers();});
const advance=()=>act(()=>vi.advanceTimersByTime(350));
const choose=(name:string)=>{fireEvent.click(screen.getByRole('button',{name}));advance();};
const next=()=>fireEvent.click(screen.getByRole('button',{name:'CONTINUAR →'}));
const completeAnswers={1:1,2:2,3:2,4:2,5:1,6:0,7:2,8:[0,3]};

describe('SOS Bebê quiz funnel',()=>{
  it('follows all eight questions, handles multiple feelings, and completes only once without firing checkout',()=>{
    render(<SosDynamicQuiz/>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/Assistir agora à apresentação/}));
    fireEvent.ended(screen.getByLabelText('Vídeo de apresentação SOS Bebê'));
    fireEvent.click(screen.getByRole('button',{name:'MONTAR MEU PLANO DE APOIO →'}));
    choose('Sou pai de primeiro filho →');choose('1 a 3 meses →');
    choose('😰 Não sei. Entro em pânico →');
    expect(screen.getByText('Na madrugada, mais palpites só aumentam a confusão.')).toBeInTheDocument();next();
    choose('✅ Sei acolher e reconhecer quando buscar ajuda →');
    expect(screen.getByRole('heading',{name:'Você merece mais clareza do que “tenta isso”.'})).toBeInTheDocument();next();
    choose('😬 Conheço uma posição, mas não tenho certeza →');next();
    choose('😰 Fico sem saber como ajudar →');
    choose('😰 Não tenho um guia e fico sem saber por onde começar →');next();
    expect(screen.getByRole('button',{name:'CONTINUAR →'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button',{name:'Pânico →'}));fireEvent.click(screen.getByRole('button',{name:'Culpa →'}));next();
    expect(screen.getByText('Pai, a culpa não é sua.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'VER MEU RESULTADO →'}));
    act(()=>vi.advanceTimersByTime(3500));
    expect(screen.getByRole('heading',{level:1})).toHaveTextContent('vulnerável em 4 de 5');
    expect(vi.mocked(trackCustom).mock.calls.filter(c=>c[0]==='Quiz_Answer')).toHaveLength(8);
    expect(vi.mocked(trackStandard).mock.calls.filter(c=>c[0]==='Lead')).toHaveLength(1);
    expect(trackInitiateCheckout).not.toHaveBeenCalled();
    expect(document.querySelectorAll('[data-checkout-cta]')).toHaveLength(1);
    expect(document.querySelector('[data-checkout-cta]')?.closest('#oferta')).not.toBeNull();
    expect(sessionStorage.getItem(quizKey)).toContain('result');
    for(const name of ['Juliana Moreira','Rafael Silva','Larissa Sousa']) expect(screen.getByText(name)).toBeInTheDocument();
  });
  it('restores answers, supports native history back, and cancels pending automatic advances',()=>{
    sessionStorage.setItem(quizKey,JSON.stringify({step:'q3',answers:{1:0,2:1}}));
    render(<SosDynamicQuiz/>);
    expect(screen.getByRole('heading',{level:1})).toHaveTextContent('São 3 da manhã');
    fireEvent.click(screen.getByRole('button',{name:'😬 Mais ou menos, vou tentando →'}));
    act(()=>window.dispatchEvent(new PopStateEvent('popstate',{state:{sosQuiz:{step:'q2'}}})));
    advance();expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Em que fase');
    expect(screen.getByRole('button',{name:'0 a 1 mês ✓'})).toHaveAttribute('aria-pressed','true');
    expect(trackInitiateCheckout).not.toHaveBeenCalled();
  });
  it('fires ViewContent at the offer and does not repeat the opening VSL',()=>{
    sessionStorage.setItem(quizKey,JSON.stringify({step:'result',answers:completeAnswers}));
    render(<SosDynamicQuiz/>);
    const offerObserver=observers.find(o=>o.observe.mock.calls.some(c=>c[0].id==='oferta'))!;
    act(()=>offerObserver.callback([{isIntersecting:true} as IntersectionObserverEntry],{} as IntersectionObserver));
    expect(trackStandard).toHaveBeenCalledWith('ViewContent',expect.objectContaining({value:9.9,currency:'BRL'}));
    expect(screen.queryByRole('button',{name:/Assistir agora à apresentação/})).not.toBeInTheDocument();
    expect(document.querySelector('[data-checkout-cta]')).toHaveAttribute('href','https://pay.cakto.com.br/gwvroes_1229714');
  });
  it('starts with only the VSL, downloads no video before play, and offers a fallback after failure',()=>{
    render(<SosDynamicQuiz/>);
    expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Seu bebê chora');
    expect(screen.queryByRole('button',{name:/COMEÇAR|CONTINUAR/})).not.toBeInTheDocument();
    expect(document.querySelectorAll('video[src]')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button',{name:/Assistir agora à apresentação/}));
    const video=screen.getByLabelText('Vídeo de apresentação SOS Bebê') as HTMLVideoElement;
    expect(video).not.toHaveAttribute('controls');
    expect(video.muted).toBe(false);
    fireEvent.error(video);
    fireEvent.click(screen.getByRole('button',{name:'CONTINUAR PARA AS PERGUNTAS →'}));
    expect(screen.getByRole('heading',{level:1})).toHaveTextContent('quem está ali com o bebê');
    expect(trackInitiateCheckout).not.toHaveBeenCalled();
  });
  it('validates saved state and computes only the five preparation answers',()=>{
    expect(resultFor(completeAnswers)).toMatchObject({total:3,vulnerable:4});
    sessionStorage.setItem(quizKey,JSON.stringify({step:'result',answers:{1:99,3:12,8:['invalid']}}));
    expect(readQuiz()).toMatchObject({step:'q1',answers:{8:[]}});
  });
});
