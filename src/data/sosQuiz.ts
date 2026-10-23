import { sosMedia } from './sosMedia';
import { sosOffer } from './sosOffer';

/** All quiz assets reuse the confirmed source manifest. No unverified feedback photos are published. */
export const quizMedia = {
  vsl: sosMedia.vsl,
  doctor: sosOffer.doctorPhoto,
  choro: sosMedia.situations[0],
  colica: sosMedia.situations[1],
  gases: sosMedia.situations[2],
  coco: sosMedia.situations[2],
  imprevistos: sosMedia.situations[3],
  feedbacks: [] as {src: string; alt: string}[], // Real authorized message screenshots only.
};
export const quizKey = 'sos-dynamic-quiz-v1';
export const questionOptions = [
  ['Sou mãe de primeira viagem', 'Sou pai de primeiro filho', 'Já tenho filhos, mas cada bebê é diferente', 'Sou avó, tia ou ajudo a cuidar'],
  ['Ainda estou grávida', '0 a 1 mês', '1 a 3 meses', '3 a 6 meses', 'Mais de 6 meses'],
];
export const knowledgeOptions = ['✅ Sei exatamente o que fazer', '😬 Mais ou menos, vou tentando', '😰 Não sei. Entro em pânico'];
/** Index 0/1/2 always means confident/partial/unsure; wording changes by situation. */
export const situationOptions: Record<number,string[]> = {
  3: knowledgeOptions,
  4: ['✅ Sei acolher e reconhecer quando buscar ajuda', '😬 Tento algumas coisas, mas fico em dúvida', '😰 Não sei como agir com segurança'],
  5: ['✅ Conheço as posições e os cuidados', '😬 Conheço uma posição, mas não tenho certeza', '😰 Não sei qual posição usar'],
  6: ['✅ Sei os cuidados e quando falar com o pediatra', '😬 Tenho dúvidas sobre o que é seguro fazer', '😰 Fico sem saber como ajudar'],
  7: ['✅ Tenho um guia e sei quando procurar atendimento', '😬 Busco na internet, mas fico sem uma direção', '😰 Não tenho um guia e fico sem saber por onde começar'],
};
export const quizTestimonials = [
  {name:'Juliana Moreira',quote:'Eu travava completamente quando meu filho começava a chorar sem parar. Depois que fiz o teste e segui o guia da Dra. Valentina, finalmente entendi o que fazer em cada situação. Hoje consigo acalmar ele bem mais rápido e sem entrar em desespero.'},
  {name:'Rafael Silva',quote:'Eu achava que era só ‘deixar chorar’ ou pegar no colo. Depois do teste vi que eu estava vulnerável em várias situações. Com o SOS Bebê consegui ter mais segurança e meu bebê passou a acalmar muito mais fácil.'},
  {name:'Larissa Sousa',quote:'Toda vez que meu bebê chorava eu entrava em pânico e não sabia por onde começar. Depois que fiz o teste e usei o guia da Dra. Valentina, finalmente consegui entender os sinais dele. Hoje resolvo a maioria das crises em poucos minutos e sem stress.'},
];
export const feelings = ['Pânico', 'Culpa', 'Impotência', 'Medo de estar errando', 'Cansaço extremo'];
export const questions = [
  'Quem vai cuidar do bebê nas horas difíceis?', 'Qual a idade do bebê?',
  'São 3 da manhã. O bebê chora sem parar e nada acalma. Você sabe exatamente o que fazer?',
  'O bebê se contorce, chora forte e você suspeita de cólica. Você sabe o que fazer para ajudar a aliviar?',
  'Você sabe qual posição ajuda o bebê a arrotar e a soltar os gases?',
  'O bebê está desconfortável e não consegue fazer cocô. Você sabe como ajudar com segurança?',
  'Acontece algo inesperado de madrugada. Você tem um guia para agir com calma e saber quando procurar atendimento?',
  'O que você sente quando o bebê chora e nada funciona?',
];
export const situations = [
  {question:3, label:'Choro intenso', clip:quizMedia.choro},
  {question:4, label:'Cólica', clip:quizMedia.colica},
  {question:5, label:'Gases e arroto', clip:quizMedia.gases},
  {question:6, label:'Cocô', clip:quizMedia.coco},
  {question:7, label:'Imprevistos', clip:quizMedia.imprevistos},
];
export const steps = ['cover','q1','q2','q3','video3','q4','video4','q5','video5','q6','q7','video7','q8','support','analysis','result'] as const;
export type Step = typeof steps[number];
export type Answers = Record<string, number | number[]>;
export const scoreFor = (answers: Answers, q: number) => typeof answers[q] === 'number' ? 2 - (answers[q] as number) : 0;
export function resultFor(answers: Answers) {
  const scores = situations.map(s => scoreFor(answers,s.question));
  const total = scores.reduce((a,b)=>a+b,0);
  const vulnerable = scores.filter(s=>s<2).length;
  return {total, vulnerable, scores};
}
export function personaFor(answers: Answers) {
  if(answers[1]===0) return {name:'Mãe', tired:'exausta', ready:'preparada'};
  if(answers[1]===1) return {name:'Pai', tired:'exausto', ready:'preparado'};
  return {name:'Você', tired:'sem descansar', ready:'com preparo'};
}
export function validAnswers(value: unknown): Answers {
  if(!value || typeof value!=='object') return {};
  const out: Answers={};
  for(let q=1;q<=8;q++) {
    const answer=(value as Answers)[q];
    const max=q===1?4:q===2?5:3;
    if(q===8 && Array.isArray(answer)) out[q]=[...new Set(answer.filter(n=>Number.isInteger(n)&&n>=0&&n<feelings.length))];
    else if(q<8&&Number.isInteger(answer)&&Number(answer)>=0&&Number(answer)<max) out[q]=answer;
  }
  return out;
}
export function readQuiz() {
  try {
    const saved=JSON.parse(sessionStorage.getItem(quizKey)||'null');
    const answers=validAnswers(saved?.answers);
    const requested=steps.includes(saved?.step)?saved.step:'cover';
    const index=steps.indexOf(requested);
    const missing=Array.from({length:8},(_,i)=>i+1).find(q => steps.indexOf(`q${q}` as Step)<index && (answers[q]===undefined || (q===8 && !(answers[q] as number[]).length)));
    return {step:missing?`q${missing}` as Step:requested as Step,answers};
  } catch { return {step:'cover' as Step,answers:{}}; }
}
