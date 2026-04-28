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
- [x] Renomear MusicResultScreen para DecifraResultScreen (Unificação UI)
- [x] Refatorar backend para Tom Erudito (Nota 10)
- [x] Implementar voz em primeira pessoa para Pensadores ("Eu")
- [x] Redesenhar cabeçalho da visão detalhada (Horizontal: Retrato Esq. | Nome Centro | Voltar Dir.)
- [x] Exigir Versículos Bíblicos (Paulo/Salomão) e Citações Eruditas no impactPhrase
- [x] Otimizar preenchimento do card (5-8 linhas por seção de análise)
- [x] Especificar diretrizes por categoria (Filmes, Livros, Músicas)
- [x] Eliminar barra de rolagem visualmente (Otimização máxima de espaço)
- [x] Corrigir erro de divs não fechadas no Frontend
- [x] Adicionar Fallback de imagens para Pensadores
- [x] Deploy das Cloud Functions atualizado
- [x] Otimizar prompt para concisão extrema no JSON
- [x] Implementar UI detalhada das "Visões" com capitular e seções (Conforme imagem)
- [x] Corrigir "Tela Preta": Adicionada segurança (optional chaining) em todos os acessos a dados da API no MusicResultScreen.
- [x] **Densidade da IA**: Configurado prompt para exigir mínimo de 3 frases densas por seção de análise.
- [x] **Commit**: Alterações salvas no repositório e enviadas (Push OK).
- [x] **Deploy**: Cloud Functions enviadas com sucesso para o servidor (Deploy OK).
- [x] Atualizar RESPONSE_SCHEMA para 10 pensadores com 8 campos cada
- [x] Validar deploy e estabilidade da resposta (Concluído)
- [x] **Diagnóstico**: Identificado que o modelo primário (`gemini-2.5-flash`) não existe, causando falha e atraso por fallback automático.
- [x] **Diagnóstico**: A barra de progresso travava em 98% de forma rígida, dando a impressão de que o app havia parado.
- [x] **Correção**: Atualizado `MODEL_CANDIDATES` no backend para usar `gemini-1.5-flash` como primário.
- [x] **Melhoria UI**: Ajustada animação de carregamento no `App.tsx` para progresso assintótico (fica mais lento após 90%, mas nunca para totalmente), eliminando a percepção de travamento.
- [x] **Análise**: Confirmado que a densidade do JSON solicitado (10 pensadores + ensaio profundo) exige naturalmente ~30-40s de processamento da IA.
