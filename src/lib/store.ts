import { Database } from "@/integrations/supabase/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];

export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductVariant {
  color: string;
  hex: string;
  image_url: string;
  sizes: ProductSize[];
}

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const PIX_KEY = "85997341095";
export const MIN_ORDER_QUANTITY = 2;
export const ADMIN_PASSWORD_KEY = "stylo-admin-auth";

export const getVariants = (p: Product): ProductVariant[] =>
  Array.isArray(p.variants) ? (p.variants as unknown as ProductVariant[]) : [];
