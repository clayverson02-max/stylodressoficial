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
export const quizKey = 'sos-dynamic-quiz-v2';
export const questionOptions = [
  ['Sou mãe de primeira viagem', 'Sou pai de primeiro filho', 'Já tenho filhos, mas cada bebê é diferente', 'Sou avó, tia ou ajudo a cuidar'],
  ['Ainda estou grávida', '0 a 1 mês', '1 a 3 meses', '3 a 6 meses', 'Mais de 6 meses'],
];
export const knowledgeOptions = ["Eu paro, observo e sigo os cuidados que já conheço","Vou do colo à fralda e à internet, sem ter uma sequência","Eu travo e fico com medo de fazer alguma coisa errada"];
/** Index 0/1/2 always means confident/partial/unsure; wording changes by situation. */
export const situationOptions: Record<number,string[]> = {
  3: knowledgeOptions,
  4: ["Sigo a orientação do pediatra e sei quando pedir ajuda","Tento acalmar, mas não sei se estou ajudando","Cada pessoa fala uma coisa e isso aumenta minha confusão"],
  5: ["Sei como apoiar e respeitar os limites do bebê","Tento uma posição, mas fico conferindo se está certo","Mudo de posição sem saber qual cuidado preciso ter"],
  6: ["Evito receitas e manobras por conta própria e falo com o pediatra","Peço opinião, mas não sei separar uma dica de um cuidado seguro","Quase sigo qualquer dica porque só quero ajudar"],
  7: ["Reconheço quando procurar atendimento, sem esperar pelo guia","Peço ajuda, mas tenho dificuldade para reconhecer sinais de alerta","Não consigo distinguir as situações e tenho medo de escolher errado"],
};
export const quizTestimonials = [
  {name:'Juliana Moreira',quote:'Eu travava completamente quando meu filho começava a chorar sem parar. Depois que fiz o teste e segui o guia da Dra. Valentina, finalmente entendi o que fazer em cada situação. Hoje consigo acalmar ele bem mais rápido e sem entrar em desespero.'},
  {name:'Rafael Silva',quote:'Eu achava que era só ‘deixar chorar’ ou pegar no colo. Depois do teste vi que eu estava vulnerável em várias situações. Com o SOS Bebê consegui ter mais segurança e meu bebê passou a acalmar muito mais fácil.'},
  {name:'Larissa Sousa',quote:'Toda vez que meu bebê chorava eu entrava em pânico e não sabia por onde começar. Depois que fiz o teste e usei o guia da Dra. Valentina, finalmente consegui entender os sinais dele. Hoje resolvo a maioria das crises em poucos minutos e sem stress.'},
];
export const feelings = ["E se eu estiver fazendo alguma coisa errada?","Eu só queria entender do que ele precisa","Tenho medo de não perceber que preciso pedir ajuda","O cansaço não me deixa pensar direito","Parece que nada do que eu tento ajuda"];
export const questions = ["Depois de mais uma noite mal dormida, quem está ali com o bebê quando o choro começa?","Em que fase você está vivendo essas noites e essas dúvidas?","São 3 da manhã. Você trocou a fralda, deu colo, tentou acalmar. O choro continua. O que acontece com você nessa hora?","Ele encolhe as perninhas e chora no seu colo. Vem o pensamento: “Será que é cólica?”. O que você faz?","A mamada terminou. Você tenta colocar para arrotar e não sabe se está segurando direito. Como lida com essa dúvida?","Seu bebê faz força e parece incomodado. No grupo, sugerem receitas e manobras. Você sabe o que NÃO tentar por conta própria?","O choro está diferente do habitual e você sente que algo não está bem. Como decide se é hora de procurar atendimento?","Quando o bebê chora e você já está no limite do cansaço, o que passa pela sua cabeça?"];
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

/** A concrete delivery benefit follows each concern; no diagnosis or treatment instructions. */
export const questionBenefits: Record<number,string> = {"1":"Você não precisa acertar tudo sozinha. Vamos olhar para as situações que mais pesam na sua rotina.","2":"Cada fase tem seus cuidados. Responda pensando no que você vive hoje ou no que mais teme enfrentar quando o bebê chegar.","3":"Na hora do aperto, procurar dica atrás de dica só cansa mais. O SOS Bebê reúne os assuntos em vídeo para você saber onde consultar.","4":"Você quer acolher seu bebê, não testar palpites. No guia, os vídeos vêm com cuidados e sinais de alerta para consultar com o pediatra.","5":"O guia tem +100 movimentos em vídeo. Você enxerga a demonstração e os cuidados, em vez de tentar imaginar uma posição lendo uma mensagem.","6":"Nem toda dica de família ou da internet é adequada ao seu bebê. Receitas e movimentos precisam respeitar a idade e a orientação do pediatra.","7":"Se algo te preocupa, procure atendimento. Nenhum vídeo deve atrasar a ajuda que o bebê precisa. Reconhecer esse limite faz parte do cuidado.","8":"Pode marcar mais de uma. Aqui não tem julgamento. A ideia é entender onde você mais precisa de apoio."};
export const situationBenefits: Record<number,{title:string;body:string}> = {"3":{"title":"Seu braço cansa. E você continua sem direção.","body":"Você pega o celular com o bebê no colo e encontra mais um palpite. No SOS Bebê, você abre a situação de choro e vê o conteúdo organizado em vídeo, com cuidados e sinais de alerta. Um lugar para consultar, sem juntar dicas espalhadas."},"4":{"title":"Colo, balanço, opinião de todo lado. E a dúvida continua.","body":"Quando você suspeita de cólica, o que mais quer é entender por onde começar. Veja esta prévia do guia. Na plataforma, o assunto está organizado com demonstrações, cuidados e limites para conversar melhor com o pediatra."},"5":{"title":"Falar “coloca para arrotar” é fácil. Ver os cuidados ajuda mais.","body":"Com o bebê nos braços, uma mensagem solta nem sempre esclarece sua dúvida. O guia mostra posições e movimentos em vídeo para você enxergar a demonstração, respeitar os limites e consultar o pediatra sobre o que é adequado à idade."},"7":{"title":"Nem todo momento pede mais uma tentativa em casa.","body":"No desespero, é fácil continuar procurando uma dica que resolva. O SOS Bebê reúne cuidados e sinais de alerta, sem substituir atendimento. Se algo te preocupa, procure ajuda imediatamente. O guia é um apoio, não um motivo para esperar."}};
