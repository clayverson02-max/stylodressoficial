-- Adicionar coluna variants (cores com imagem e tamanhos por cor)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS original_price numeric;