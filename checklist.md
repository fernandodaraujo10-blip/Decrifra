# Checklist de Implementação - Decifra

## [2026-04-28] Otimização UI/UX e Semântica

- [x] Corrigir carregamento de imagens (Pasta Public)
- [x] Aumentar densidade e profundidade das respostas da IA
- [x] Ajustar fontes e tamanhos para eliminar scroll e cortes
- [x] Refinar fluxo de visualização rica de comentários

## [2026-04-28] Diagnóstico e Correção de Latência (Geração de Resposta)

- [x] Renomear card de "Personagens" para "Visões" (Snippet de Pensadores)
- [x] Aumentar timeout da Cloud Function para 540s (GCP Max)
- [x] Incrementar memória da Cloud Function para 1GiB (Performance)
- [x] Otimizar prompt para concisão extrema no JSON
- [x] Implementar UI detalhada das "Visões" com capitular e seções (Conforme imagem)
- [x] Corrigir "Tela Preta": Adicionada segurança (optional chaining) em todos os acessos a dados da API no MusicResultScreen.
- [x] **Densidade da IA**: Configurado prompt para exigir mínimo de 3 frases densas por seção de análise.
- [x] Atualizar RESPONSE_SCHEMA para 10 pensadores com 8 campos cada
- [ ] Validar deploy e estabilidade da resposta (Aguardando deploy)
- [x] **Diagnóstico**: Identificado que o modelo primário (`gemini-2.5-flash`) não existe, causando falha e atraso por fallback automático.
- [x] **Diagnóstico**: A barra de progresso travava em 98% de forma rígida, dando a impressão de que o app havia parado.
- [x] **Correção**: Atualizado `MODEL_CANDIDATES` no backend para usar `gemini-1.5-flash` como primário.
- [x] **Melhoria UI**: Ajustada animação de carregamento no `App.tsx` para progresso assintótico (fica mais lento após 90%, mas nunca para totalmente), eliminando a percepção de travamento.
- [x] **Análise**: Confirmado que a densidade do JSON solicitado (10 pensadores + ensaio profundo) exige naturalmente ~30-40s de processamento da IA.
