/** Editable offer fields. Keep unverified placeholders null/empty so they stay hidden. */
export type VerifiedTestimonial = {
  name: string;
  country: string;
  quote: string;
  image: string;
};

export const birthOffer = {
  name: "Preparación Completa para el Parto Natural",
  price: 4,
  checkout: import.meta.env.VITE_CHECKOUT_URL || "https://pay.hotmart.com/D108067220C?checkoutMode=10",
  // Confirmed in this product's Hotmart checkout data: warrantyDays = 7.
  guaranteeDays: 7,
  // [PLACEHOLDER] Add the actual verified number of customers; never simulate it.
  mothersStarted: null as number | null,
  // [PLACEHOLDER] Set a genuine reference price only when one is documented.
  referencePrice: null as number | null,
  // [PLACEHOLDER] Add only bonuses that are actually delivered with this product.
  bonuses: [] as { title: string; description: string }[],
  // [PLACEHOLDER] Add 3–6 approved real testimonials, with their own photos/prints.
  testimonials: [] as VerifiedTestimonial[],
};

export const offerIncludes = [
  "Más de 250 ejercicios en video",
  "Más de 100 recetas caseras",
  "Masajes y relajación pélvica",
  "Contenido organizado por semana de embarazo",
  "Acceso desde celular, tablet o computadora",
  "Acceso tras la confirmación de tu compra",
];
