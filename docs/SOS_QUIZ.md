# SOS Bebê — variante /quiz

A página de controle `/` e seus estilos permanecem intactos. `/quiz` é carregada sob demanda; não existe divisão automática de tráfego. Use URLs separadas nos anúncios.

## Inventário confirmado

- VSL 72,23 s: `/videos/sos/vsl.mp4`, capa `/images/sos/vsl.webp`.
- Choro 11,8 s: `/videos/sos/choro-intenso.mp4`.
- Cólica 24,43 s: `/videos/sos/colica.mp4`.
- Cocô, arroto e gases 82,77 s: `/videos/sos/coco-arroto-gases.mp4`.
- Imprevistos 36,76 s: `/videos/sos/imprevistos.mp4`.
- Retrato existente: `/images/dra-valentina.webp`; watermark original preservada.
- `/public/feedback-mama-1.png`, `2.png`, `3.png` são fotos sem mensagens. Não são usados como depoimentos.
- Arquivos antigos de gestação e moda não são usados na variante.

Os caminhos são importados pelo manifesto único `src/data/sosQuiz.ts` a partir dos manifestos existentes; nenhuma cópia pesada foi criada. Cocô e gases reutilizam o clipe combinado confirmado. As prévias estão nas etapas intermediárias e no plano; a galeria duplicada foi retirada. Os três depoimentos em texto (Juliana Moreira, Rafael Silva e Larissa Sousa) foram fornecidos pelo proprietário e estão em `quizTestimonials`, sem associação a fotos não identificadas. Carrossel com avanço a cada 6,5 s quando visível, pausa durante interação e sem avanço automático com movimento reduzido. Para prints reais autorizados, preencher `quizMedia.feedbacks`; carrossel e ampliação já estão preparados.

## Fluxo e estado

Abertura com headline + VSL, sem CTA de oferta nem botão inicial para o quiz. O término do vídeo oferece o botão para começar as perguntas. Em falha/fechamento há alternativa para continuar sem travar o funil. 8 perguntas com prévias após Q3, Q4, Q5 e Q7, acolhimento, análise de 1,2 segundo e resultado. Somente Q3–Q7 pontuam (0–10). Vermelho/amarelo vêm primeiro no plano. O resultado é sobre preparo declarado, não diagnóstico. Perguntas simples avançam em 350 ms e são protegidas contra toques duplicados; Q8 aceita múltiplas opções e exige continuar.

Respostas e etapa em sessionStorage, chave sos-dynamic-quiz-v2, com validação na restauração. Cada avanço cria uma entrada no histórico; popstate retorna à etapa correspondente. Sem dados identificadores ou cadastro. Especialidade, CRM, termos e depoimentos permanecem campos editáveis, sem fatos inventados.

VSL reutiliza MiniVsl com quizMode: não altera os padrões de `/`. Fechamento visual no término ou falha/8 segundos sem progresso; Escape preservado como saída acessível. Conclusão da VSL de entrada começa as perguntas, sem compra. Não há segunda VSL no resultado. Prévias usam metadata/none, observadores e coordenação para não tocar simultaneamente. A capa usa apenas o poster: nenhum vídeo recebe src antes do gesto de play. Removido o preload oculto entre perguntas. Prévias começam ao cruzar 15% de visibilidade, em vez de 60%, sem aguardar a reprodução para liberar o avanço.

## Oferta e eventos

R$ 9,90 + taxa R$ 0,99 = R$ 10,89. Apenas um link de compra, dentro da oferta, mesma aba, parâmetros preservados e InitiateCheckout antes do redirecionamento de 150 ms. O preço da variante está nesta seção; manter alinhado a sosOffer e ao checkout.

Mesmo pixel e PageView existentes. Quiz_Start, Quiz_Answer, Quiz_Complete, Lead no resultado, ViewContent na oferta. Complete/Lead/ViewContent são deduplicados por sessão inclusive no reload. VSL mantém os cinco marcos existentes. Não dispara Purchase. Botões de navegação rolam e disparam ClickParaPlano/ClickParaOferta, sem iniciar checkout.

## Verificação

Testes automatizados cobrem fluxo completo, seleção múltipla, gênero, pontuação, cancelamento de avanço ao voltar, restauração validada, Lead único, oferta e VSL com saída de segurança. Suite anterior da página de controle permanece passando. Teste em aparelhos físicos iPhone Safari e Android Chrome é necessário; inspeção em navegador desktop não equivale a validação nesses aparelhos.

## Ajuste de UTMs e respostas
O código ofuscado enviado foi decodificado: latest.js oficial com prevent-subids e prevent-xcod-sck. O loader já existente é único; a configuração prevent-xcod-sck é aplicada somente na entrada direta em /quiz. O pixel UTMify e o Meta existentes foram preservados. Q3 a Q7 têm respostas próprias, mantendo índices 0/1/2 e pontuação 2/1/0.

## Abertura VSL e desempenho
O bootstrap `main.tsx` seleciona /quiz antes de importar App: a variante não baixa a página de controle, seus providers de dashboard nem o router. Não foram reencodados os arquivos de vídeo; nenhuma redução de tamanho de mídia é alegada. Fonte, Pixel, UTMify e Clarity mantidos. Os testes de regressão foram atualizados para VSL primeiro, sem vídeo antes do clique e alternativa após falha; execução depende do ambiente de testes. Conferir build e fluxo publicado após cada alteração.
