/** Editable product facts. Null fields stay hidden until real information is supplied. */
export const sosOffer = {
  name: "SOS Bebê – Guia Completo da Dra. Valentina",
  checkout: "https://pay.cakto.com.br/gwvroes_1229714",
  price: 17.90,
  guaranteeDays: 7,
  doctorPhoto: "/images/dra-valentina.webp" as string | null, // Supplied portrait; keep source watermark intact.
  doctorCredentials: null as string | null, // [PLACEHOLDER] validated specialty, CRM and experience
  accessDuration: null as string | null, // [PLACEHOLDER]
  priceChangeNotice: null as string | null, // [PLACEHOLDER] only add if an actual price change is scheduled
  paymentMethods: ["Pix", "Cartão", "PicPay"] as string[], // Verified in the linked Cakto checkout.
  contactEmail: null as string | null, // [PLACEHOLDER]
  privacyText: null as string | null, // [PLACEHOLDER] business-approved legal text
  termsText: null as string | null, // [PLACEHOLDER]
  bonuses: [] as string[], // [PLACEHOLDER] real bonuses only
  testimonials: [] as { name: string; city: string; quote: string; image: string }[],
};
export const includes = [
  ["+250 receitas caseiras em vídeo", "Você vê ingredientes, preparo, faixa etária e cuidados. Sempre com orientação do pediatra antes de oferecer qualquer preparo ao bebê."],
  ["+100 movimentos em vídeo", "Um passo a passo visual de posições e movimentos de apoio para os momentos de desconforto."],
  ["Arroto, posições, cocô e cólica", "Os momentos mais comuns reunidos em vídeo, com cuidados e sinais de alerta."],
  ["Organizado por situação", "Você encontra o assunto de que precisa sem se perder em dicas espalhadas."],
  ["Acesso pelo celular", "Seu guia vai com você. Até nas madrugadas mais difíceis."],
  ["Acesso após confirmar o pagamento", "As instruções chegam por e-mail para você começar a explorar o conteúdo."],
];
