UPDATE products
SET image_url = 'https://ulfcqidjjbelymfgtnkb.supabase.co/storage/v1/object/public/product-images/lara-marrom.jpeg',
    variants = '[
      {"color":"Marrom","hex":"#7a3a2c","image_url":"https://ulfcqidjjbelymfgtnkb.supabase.co/storage/v1/object/public/product-images/lara-marrom.jpeg","sizes":[{"size":"P","stock":10},{"size":"M","stock":10},{"size":"G","stock":10}]},
      {"color":"Pink","hex":"#d6336c","image_url":"https://ulfcqidjjbelymfgtnkb.supabase.co/storage/v1/object/public/product-images/lara-pink.jpeg","sizes":[{"size":"P","stock":10},{"size":"M","stock":10},{"size":"G","stock":10}]}
    ]'::jsonb
WHERE name = 'Vestido Lara';