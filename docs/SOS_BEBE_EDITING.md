# SOS Bebê — informações editáveis

A página principal foi substituída pela oferta SOS Bebê, em português do Brasil.
Checkout: https://pay.cakto.com.br/gwvroes_1229714
Preço anunciado: R$ 17,90, pagamento único. Confira o mesmo preço no painel da Cakto.

## Campos pendentes
Edite `src/data/sosOffer.ts`. Os campos não confirmados não são publicados como fatos:
- `doctorPhoto`: usa o retrato enviado no commit e21e92b, otimizado em /images/dra-valentina.webp. O arquivo original contém marca d’água, preservada. Substitua por uma foto autorizada de melhor qualidade quando disponível.
- `doctorCredentials`: especialidade, CRM e experiência confirmados.
- `accessDuration`: prazo real do acesso (a pergunta só aparece após preencher).
- `paymentMethods`: Pix, cartão e PicPay, confirmados no checkout. A oferta informa a taxa de serviço de R$ 0,99 observada na Cakto, total R$ 18,89; atualize o aviso caso a plataforma altere essa taxa.
- `contactEmail`, `privacyText`, `termsText`: contato e textos jurídicos aprovados pelo responsável. Os modais atuais avisam que os documentos estão em preparação.
- `testimonials`: depoimentos autorizados com nome, cidade, imagem e texto. A seção só aparece com pelo menos três.
- `bonuses`: somente bônus realmente entregues.
- `priceChangeNotice`: preencher apenas se houver reajuste real programado.

A foto real deve ser WebP, idealmente até 80 KB, com corte adequado ao círculo. Todas as ilustrações são SVGs leves em `src/components/sos/FamilyScene.tsx`, substituíveis sem alterar a copy.

## Rastreamento
O Meta Pixel original 2149847235657959 continua no index.html com PageView.
ViewContent dispara uma vez ao atingir 50% do trecho rolável.
Todos os CTAs de compra passam pelo mesmo componente, disparam InitiateCheckout com value 17.9 e currency BRL e redirecionam após 150 ms, na mesma aba.
A query string inteira é anexada, sem substituir parâmetros já presentes no checkout. Não há disparo de Purchase na landing page.
A integração existente com meta-capi foi preservada; não foram adicionados tokens no frontend.

## Responsabilidade editorial
O conteúdo educativo não substitui atendimento médico. A página não ensina receitas, não recomenda chás para bebês e não apresenta manobras médicas. Inclui avisos sobre faixa etária e procura de atendimento. Os vídeos e receitas entregues precisam de validação do profissional responsável.
A garantia anunciada é de sete dias, conforme especificação do produto; configure e cumpra essa condição no checkout.

## Performance
Sem VSL antiga, autoplay, bibliotecas adicionais de animação ou imagens de gestação na página.
Layout responsive a partir de 320 px; tabela com colunas limitadas, CTAs amplos e barra fixa somente no mobile após sair do hero. As animações respeitam prefers-reduced-motion.
O peso total transferido depende também dos scripts externos preservados e das condições de rede; não equivale a um resultado de teste em 4G real.
