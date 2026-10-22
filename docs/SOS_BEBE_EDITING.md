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
Somente o botão no card da oferta dispara InitiateCheckout com value 17.9 e currency BRL e redireciona à Cakto após 150 ms, na mesma aba. Os quatro links de rolagem, a barra mobile e o pop-up desktop disparam ClickParaOferta com o parâmetro local e rolam à oferta.
A VSL dispara VSL_Play, VSL_25, VSL_50, VSL_75 e VSL_Complete uma vez por marco enquanto o componente permanece montado. A conclusão é lembrada na sessão para permitir fechar futuras reproduções.
A query string inteira é anexada, sem substituir parâmetros já presentes no checkout. Não há disparo de Purchase na landing page.
A integração existente com meta-capi foi preservada; não foram adicionados tokens no frontend.

## Responsabilidade editorial
O conteúdo educativo não substitui atendimento médico. A página não ensina receitas, não recomenda chás para bebês e não apresenta manobras médicas. Inclui avisos sobre faixa etária e procura de atendimento. Os vídeos e receitas entregues precisam de validação do profissional responsável.
A garantia anunciada é de sete dias, conforme especificação do produto; configure e cumpra essa condição no checkout.

## Performance
Sem VSL antiga, bibliotecas adicionais de animação ou imagens de gestação na página. A nova VSL carrega metadados e só toca com som após o gesto de clique. Somente a prévia ativa recebe src quando a seção fica visível; pausa fora da tela e enquanto a VSL está aberta.
Layout responsive a partir de 320 px; tabela com colunas limitadas, CTAs amplos e barra fixa somente no mobile após passar pela seção de desejo, escondida enquanto a oferta está visível. As animações respeitam prefers-reduced-motion.
O peso total transferido depende também dos scripts externos preservados e das condições de rede; não equivale a um resultado de teste em 4G real.

## Vídeos confirmados
Todos os caminhos, capas, proporção e nomes dos originais estão centralizados em `src/data/sosMedia.ts`.
Mapeamento confirmado pelo responsável: 00.36.48 = VSL (72 s); 00.44.54 = choro; 00.44.57 = cólica; 00.45.04 = cocô, arroto e gases; 00.45.07 = imprevistos.
Os vídeos foram convertidos para H.264/AAC, yuv420p e faststart, com posters WebP do primeiro frame. Os originais foram preservados.
A VSL usa overlay 100dvh, vídeo contain, sem controles nativos, barra de progresso real e saída visual ao terminar, em erro ou após 8 s sem progresso. Escape continua disponível como saída de acessibilidade.
Ao terminar há links para a oferta e para continuar abaixo do hero; nenhum deles abre o checkout. As prévias avançam automaticamente até a primeira interação com chip ou som, quando passam a repetir a seleção.
As compatibilidades implementadas (playsInline, gesto de som, safe areas) precisam de conferência em aparelhos físicos iPhone/Android; os testes automatizados não substituem esses dispositivos.
