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
    choose('Eu travo e fico com medo de fazer alguma coisa errada →');
    expect(screen.getByText('Seu braço cansa. E você continua sem direção.')).toBeInTheDocument();next();
    choose('Sigo a orientação do pediatra e sei quando pedir ajuda →');
    expect(screen.getByRole('heading',{name:'Colo, balanço, opinião de todo lado. E a dúvida continua.'})).toBeInTheDocument();next();
    choose('Tento uma posição, mas fico conferindo se está certo →');next();
    choose('Quase sigo qualquer dica porque só quero ajudar →');
    choose('Não consigo distinguir as situações e tenho medo de escolher errado →');next();
    expect(screen.getByRole('button',{name:'CONTINUAR →'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button',{name:'E se eu estiver fazendo alguma coisa errada? →'}));fireEvent.click(screen.getByRole('button',{name:'Eu só queria entender do que ele precisa →'}));next();
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
    fireEvent.click(screen.getByRole('button',{name:'Vou do colo à fralda e à internet, sem ter uma sequência →'}));
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
    expect(trackStandard).toHaveBeenCalledWith('ViewContent',expect.objectContaining({value:4.99,currency:'BRL'}));
    expect(screen.queryByRole('button',{name:/Assistir agora à apresentação/})).not.toBeInTheDocument();
    expect(document.querySelector('[data-checkout-cta]')).toHaveAttribute('href','https://pay.wiapy.com/PtucXof_7bZD');
  });
  it('uses the promotional checkout value only when the offer is clicked',()=>{
    sessionStorage.setItem(quizKey,JSON.stringify({step:'result',answers:completeAnswers}));
    render(<SosDynamicQuiz/>);
    expect(trackInitiateCheckout).not.toHaveBeenCalled();
    expect(document.querySelector('#oferta')?.textContent).toContain('R$ 4,99');
    expect(document.querySelector('#oferta')?.textContent).not.toMatch(/Cakto|0,99|10,89|9,90/);
    fireEvent.click(screen.getByRole('link',{name:'QUERO O SOS BEBÊ AGORA →'}));
    expect(trackInitiateCheckout).toHaveBeenCalledWith(4.99);
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
