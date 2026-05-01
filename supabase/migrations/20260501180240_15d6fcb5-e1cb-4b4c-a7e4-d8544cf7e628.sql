UPDATE public.products
SET variants = '[
  {"hex": "#7a3a2c", "color": "Marrom", "sizes": [{"size": "P", "stock": 10}, {"size": "M", "stock": 10}, {"size": "G", "stock": 10}], "image_url": "https://ulfcqidjjbelymfgtnkb.supabase.co/storage/v1/object/public/product-images/lara-marrom.jpeg"},
  {"hex": "#d6336c", "color": "Pink", "sizes": [{"size": "P", "stock": 10}, {"size": "M", "stock": 10}, {"size": "G", "stock": 10}], "image_url": "https://ulfcqidjjbelymfgtnkb.supabase.co/storage/v1/object/public/product-images/lara-pink.jpeg"},
  {"hex": "#b94a2c", "color": "Telha", "sizes": [{"size": "P", "stock": 10}, {"size": "M", "stock": 10}, {"size": "G", "stock": 10}], "image_url": "https://ulfcqidjjbelymfgtnkb.supabase.co/storage/v1/object/public/product-images/lara-telha.jpeg"}
]'::jsonb
WHERE name = 'Vestido Lara';