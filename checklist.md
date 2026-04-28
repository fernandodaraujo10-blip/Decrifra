# ✅ Decifra App — Checklist de Implementações

## Interface Geral
- [x] Shell React com navegação por abas (Home, Filmes e Séries, Livros, Músicas, Loja, Config)
- [x] Bottom navigation persistente com 6 itens
- [x] Sistema de design premium (tons quentes, tipografia serif, glassmorphism)
- [x] Eliminação de conflitos TailwindCSS — migração para Vanilla CSS

## Tela Home
- [x] Banner hero atmosférico com imagens
- [x] Seção "Discovery Row" com cards horizontais
- [x] Cards temáticos: Mensagem Central, Camadas Ocultas, Final Explicado

## Tela Filmes e Séries
- [x] Header cinematográfico escuro
- [x] Toggle de busca (Filme / Série)
- [x] Parâmetros de análise configuráveis
- [x] Tela de resultado com accordions de seções
- [x] Cards de resultado: Arco Narrativo, Simbolismos, Final Explicado

## Tela Livros
- [x] Header editorial premium
- [x] Toggle Livro / Autor
- [x] Parâmetros de análise
- [x] Tela de resultado com seções expandíveis
- [x] Cards: Tema Central, Personagens, Camadas de Significado

## Tela Músicas
- [x] Header atmosférico com banner de música
- [x] Busca por faixa ou artista
- [x] Tela de resultado (`MusicResultScreen`)
  - [x] Banner + título da música
  - [x] Abas: Essência, Notas, Leitura Crítica, Contexto
  - [x] Nota Geral e card do artista
  - [x] Grid de seções (2 colunas) com accordions
  - [x] Cards de assets: Contexto da Canção, Mensagem da Letra, Sentimento Central
- [x] **Seção Visões — Grid de Cards de Pensadores**
  - [x] 10 retratos gerados por IA (Paulo de Tarso, Salomão, Dostoiévski, Freud, Maquiavel, Sócrates, Jung, Nietzsche, Sartre, Frankl)
  - [x] Layout 2 colunas com retrato + nome + palavras-chave + seta
  - [x] Assets salvos em `/public/decifra-assets/visoes-*.png`

## Assets Visuais
- [x] `music-hero.png` — banner da tela músicas
- [x] `music-contexto-card.png` — card Contexto da Canção
- [x] `music-mensagem-card.png` — card Mensagem da Letra
- [x] `music-sentimento-card.png` — card Sentimento Central
- [x] `visoes-paulo-tarso.png` a `visoes-frankl.png` — retratos dos 10 pensadores

## Pagamentos e Assinaturas (Mercado Pago)
- [x] Cloud Function `createCheckout`: Geração de preferência real
- [x] Cloud Function `webhookMercadoPago`: Processamento de notificações de pagamento
- [x] Cloud Function `verifyPlan`: Validação de status de assinatura via Firestore
- [x] Página `pagamento-confirmado.html`: Feedback de sucesso com design premium
- [x] Integração Frontend: Remoção de simulador e chamadas reais via Firebase SDK
- [x] Botão "Verificar meu plano" para sincronização manual de status
- [x] Segurança: Uso de Firebase Secrets para tokens de acesso do Mercado Pago
- [x] **Credenciais MP migradas para Secret Manager** (Plano Blaze ✅)
- [x] **Chave Gemini migrada para Secret Manager** ✅
- [ ] **⏳ Configurar TMDB_API_KEY e OMDB_API_KEY** no Secret Manager (se necessário)

## Infraestrutura TWA & Firebase (27/04/2026)
- [x] **firebase.json — ignore**: Removido `**/.*` que bloqueava `.well-known/` no deploy
- [x] **firebase.json — headers**: `Content-Type: application/json` + `CORS` para `assetlinks.json`
- [x] **firebase.json — headers**: `no-cache` para `sw.js`, cache imutável para `/logo.png` e `/decifra-assets/**`
- [x] **sw.js — nome do cache**: Atualizado de `cine-exegese-v1` → `decifra-v2`
- [x] **sw.js — estratégia**: Cache-First (assets), Network-First (navegação), bypass `.well-known/`
- [x] **sw.js — offline fallback**: Página offline embutida com design Decifra
- [x] **sw.js — limpeza**: Remove caches de versões anteriores no activate
- [x] **sw.js — localização**: Copiado para `public/sw.js` para Vite incluir no build
- [x] **index.html — SW path**: Corrigido de `'sw.js'` para `'/sw.js'` (absoluto) com `scope: '/'`

## Estabilidade & Correções (27/04/2026)
- [x] **Correção da Tela Branca**: Removido `importmap` conflitante do `index.html` que impedia o carregamento correto via Vite.
- [x] **Resiliência do Firebase**: Implementada proteção no `firebase.ts` e `auth.ts` para evitar crash quando chaves de API estão ausentes.
- [x] **Carregamento Seguro**: App agora renderiza a interface básica mesmo com serviços de backend desativados/não configurados.
- [x] **Navegação Verificada**: Teste funcional das abas Home, Filmes, Livros e Configurações concluído com sucesso.
- [x] **Busca Funcional**: Sincronização do motor Gemini com os novos SDKs e parâmetros de filtro.
- [x] **Design Unificado**: Aplicação de CSS Premium nas telas de Livros e Músicas.

## Atualizações & Estabilização (28/04/2026)
- [x] **Estabilização da API Gemini**: Migração para o modelo `gemini-2.0-flash` para maior velocidade e estabilidade nas análises.
- [x] **Correção do Fluxo de Análise de Livros**: Resolvido o problema de botões de análise (`BooksInterpretButton`) que não disparavam a requisição.
- [x] **Ajustes de Layout CSS**: Refinamento de componentes para garantir que a interface premium se mantenha consistente após a remoção do Tailwind.
- [x] **Sincronização de Estado de Busca**: Melhoria na lógica de `handleInterpret` para garantir que os parâmetros de busca sejam capturados corretamente antes da análise.
- [x] **Melhoria no Feedback de Carregamento**: Adição de indicadores visuais claros durante o processamento da IA para evitar a percepção de travamento.
