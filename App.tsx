import React, { useEffect, useMemo, useState } from 'react';
import { AnalysisMode, ContentType, interpretMovie } from './geminiService';
import { MovieAnalysis } from './types';
import { runUnifiedSearch } from './src/core/search-engine';
import { UnifiedSearchResult } from './src/core/types';

type AppTab = 'home' | 'movies_series' | 'books' | 'music' | 'store' | 'settings';
type UserPlan = 'free' | 'pro' | 'premium';
type ThemeMode = 'light' | 'dark';
type SuggestionKind = 'history' | 'search';
type PurchaseState = 'idle' | 'selectingPlan' | 'processingPayment' | 'success' | 'error' | 'restored';

type MusicSearchType = 'track' | 'artist';
type MusicMainFocus = 'lyrics' | 'context' | 'emotion';
type MusicAnalysisTypeOption =
  | "Significado da letra e mensagem central"
  | "Simbologia e referências"
  | "Emoção principal e sentimento"
  | "Contexto da canção"
  | "Interpretação geral";
type MusicFocusChipOption = "Simbologia" | "Refrão" | "Sentimento" | "Referências";

type PlanId = 'monthly' | 'quarterly' | 'semiannual' | 'annual';
type BillingCycle = '/mês' | '/3 meses' | '/6 meses' | '/ano';

interface SearchSuggestionItem {
  id: string;
  title: string;
  subtitle: string;
  poster?: string;
  kind: SuggestionKind;
}

interface Plan {
  planId: PlanId;
  title: string;
  price: string;
  cycle: BillingCycle;
  billingCycle: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  bestValue?: boolean;
}

const BRAND_LOGO_URL = "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0420780722.firebasestorage.app/o/1.1-APPs-Pr%C3%B3prios%2F1-Imagens%2F1-Decrifa%2F1-Logo.webp?alt=media&token=0455b19d-23a9-4ada-a7a2-fb67a3e12c9a";
const APP_VERSION = '1.0.0';
const BOTTOM_NAV_HEIGHT = 72;

const MUSIC_ANALYSIS_TYPES: MusicAnalysisTypeOption[] = [
  "Significado da letra e mensagem central",
  "Simbologia e referências",
  "Emoção principal e sentimento",
  "Contexto da canção",
  "Interpretação geral",
];
const MOVIES_ANALYSIS_TYPES: MoviesAnalysisTypeOption[] = [
  "Final explicado, símbolos e mensagem central",
  "Personagens e arco narrativo",
  "Simbolismos e temas ocultos",
  "Contexto, mensagem e crítica",
  "Interpretação geral da obra",
];
const BOOKS_ANALYSIS_TYPES: BooksAnalysisTypeOption[] = [
  "Tema central, personagens e simbolismos",
  "Contexto histórico e mensagem",
  "Camadas do texto e subtexto",
  "Personagens e conflitos",
  "Leitura geral da obra",
];

const PLANS: Plan[] = [
  { planId: 'monthly', title: 'Mensal', price: 'R$ 14,90', cycle: '/mês', billingCycle: 'monthly' },
  { planId: 'quarterly', title: 'Trimestral', price: 'R$ 37,90', cycle: '/3 meses', billingCycle: 'quarterly' },
  { planId: 'semiannual', title: 'Semestral', price: 'R$ 59,90', cycle: '/6 meses', billingCycle: 'semiannual' },
  { planId: 'annual', title: 'Anual', price: 'R$ 99,90', cycle: '/ano', billingCycle: 'annual', bestValue: true },
];

const HeaderBlock: React.FC<{ title: string; subtitle: string; accentA: string; accentB: string; vibeA: string; vibeB: string }> = ({ title, subtitle, accentA, accentB, vibeA, vibeB }) => (
  <section className="relative rounded-[1.8rem] overflow-hidden border border-amber-500/20 p-4 sm:p-6 bg-gradient-to-br from-[#090704] via-[#1a1008] to-[#090704] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
    <div className="pointer-events-none absolute -top-12 -right-10 w-44 h-44 rounded-full bg-amber-500/20 blur-3xl" />
    <div className="pointer-events-none absolute bottom-0 left-8 w-32 h-32 rounded-full bg-amber-800/20 blur-3xl" />
    <div className="relative z-10 flex items-center gap-4">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-amber-500/50 shadow-lg shadow-amber-500/20 bg-black/70">
        <img src={BRAND_LOGO_URL} alt="Logo Decifra" className="w-full h-full object-cover" />
      </div>
      <div>
        <h2 className="text-[#D5A54A] text-[1.75rem] sm:text-3xl font-bold serif leading-none">Decifra</h2>
        <p className="text-white text-[1.9rem] sm:text-[2.1rem] leading-tight font-semibold serif">{title}</p>
        <p className="text-[#E7E2DA]/85 text-sm sm:text-base mt-1 leading-snug">{subtitle}</p>
      </div>
    </div>
  </section>
);

const MoviesHeroBanner: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => (
  <section className="relative rounded-[1.8rem] overflow-hidden border border-amber-500/20 p-5 bg-gradient-to-br from-[#050403] via-[#1a1108] to-[#060402] shadow-[0_16px_40px_rgba(0,0,0,0.45)] min-h-[220px]">
    <div className="pointer-events-none absolute -top-10 -right-8 w-40 h-40 rounded-full bg-amber-500/20 blur-3xl" />
    <div className="pointer-events-none absolute bottom-6 right-6 w-20 h-20 rounded-full border border-amber-400/20" />
    <div className="pointer-events-none absolute top-8 right-14 w-10 h-10 border border-amber-400/20 rotate-12" />
    <button
      onClick={onOpenSettings}
      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full border border-[#CFA14F]/50 bg-[#F6EFE2] text-[#7C5B2D] text-lg flex items-center justify-center"
      aria-label="Abrir configurações"
    >
      ⚙️
    </button>
    <div className="relative z-10 flex items-center gap-4 pt-3">
      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-amber-500/50 shadow-lg shadow-amber-500/20 bg-black/70 flex-shrink-0">
        <img src={BRAND_LOGO_URL} alt="Logo Decifra" className="w-full h-full object-cover" />
      </div>
      <div className="pr-8">
        <h2 className="text-[#D5A54A] text-4xl leading-none font-bold serif">DECIFRA</h2>
        <p className="text-white text-[2.2rem] leading-tight font-semibold serif">Filmes e Séries</p>
        <p className="text-[#E7E2DA]/90 text-[1.35rem] leading-tight mt-1">Interpretação inteligente para cinema e streaming</p>
      </div>
    </div>
  </section>
);

const SegmentedToggle: React.FC<{ options: { id: string; label: string }[]; value: string; onChange: (value: string) => void }> = ({ options, value, onChange }) => (
  <div className="grid gap-2 p-2 rounded-2xl bg-[#ECE9E4] border border-[#D9D1C6]" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
    {options.map((item) => (
      <button key={item.id} onClick={() => onChange(item.id)} className={`py-3 rounded-xl text-sm font-black tracking-wide transition-all ${value === item.id ? 'bg-white border border-[#CFA14F] text-[#8D621F]' : 'text-[#9C9488]'}`}>
        {item.label}
      </button>
    ))}
  </div>
);

const SuggestionsSection: React.FC<{ onSelect: (id: string) => void; onViewAll: () => void }> = ({ onSelect, onViewAll }) => {
  const cards = [
    {
      id: 'final_explicado',
      title: 'FINAL EXPLICADO',
      subtitle: 'Entenda o desfecho em profundidade',
      bg: 'linear-gradient(160deg,#4d2e16 0%,#1d120a 70%)',
    },
    {
      id: 'simbolismos',
      title: 'SIMBOLISMOS',
      subtitle: 'Descubra símbolos e seus significados',
      bg: 'linear-gradient(160deg,#5a3a1c 0%,#1a1209 75%)',
    },
    {
      id: 'arco_personagens',
      title: 'ARCO DOS PERSONAGENS',
      subtitle: 'A jornada e evolução de cada personagem',
      bg: 'linear-gradient(160deg,#6a421c 0%,#1a1209 75%)',
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[2.2rem] serif text-[#2E241B] leading-none">Sugestões de hoje</h3>
        <button onClick={onViewAll} className="text-[#9A6B24] text-xl serif">Ver todas ›</button>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelect(card.id)}
            className="relative rounded-[1.2rem] overflow-hidden min-h-[190px] border border-[#6A4A24]/50 shadow-lg text-left"
            style={{ backgroundImage: card.bg }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/80" />
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full border border-[#D3A34D] bg-black/45 text-white text-sm flex items-center justify-center">▶</div>
            <div className="absolute left-2.5 right-2.5 bottom-2">
              <p className="text-white text-[0.68rem] leading-tight serif font-semibold">{card.title}</p>
              <p className="text-[#E9DDCC] text-[0.56rem] leading-tight mt-1">{card.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

const HomeHeroBanner: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => (
  <section className="relative h-full rounded-[1.7rem] overflow-hidden border border-amber-500/20 p-3.5 bg-gradient-to-br from-[#050403] via-[#1a1108] to-[#060402] shadow-[0_16px_40px_rgba(0,0,0,0.45)] min-h-[148px]">
    <div className="pointer-events-none absolute -top-10 -right-8 w-40 h-40 rounded-full bg-amber-500/20 blur-3xl" />
    <div className="pointer-events-none absolute bottom-4 right-4 text-4xl opacity-30">🎞️</div>
    <div className="pointer-events-none absolute top-8 right-16 text-3xl opacity-25">🎧</div>
    <div className="pointer-events-none absolute bottom-6 left-6 text-3xl opacity-20">📖</div>
    <button
      onClick={onOpenSettings}
      className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full border border-[#CFA14F]/50 bg-[#F6EFE2] text-[#7C5B2D] text-base flex items-center justify-center"
      aria-label="Abrir configurações"
    >
      ⚙️
    </button>
    <div className="relative z-10 flex items-center gap-2.5 pt-1.5">
      <div className="w-[72px] h-[72px] rounded-[1.2rem] overflow-hidden border border-amber-500/50 shadow-lg shadow-amber-500/20 bg-black/70 flex-shrink-0">
        <img src={BRAND_LOGO_URL} alt="Logo Decifra" className="w-full h-full object-cover" />
      </div>
      <div className="pr-7">
        <h2 className="text-[#D5A54A] text-[2.35rem] leading-none font-bold serif">DECIFRA</h2>
        <p className="text-white text-[0.82rem] leading-snug font-medium">Filmes, séries, músicas e livros com interpretação inteligente</p>
        <p className="text-[#E7C272] text-[0.72rem] leading-tight mt-1.5">Revele as camadas por trás de cada obra.</p>
      </div>
    </div>
  </section>
);

const HomeStatusCard: React.FC<{ progress: number; onStatistics: () => void; onHistory: () => void }> = ({ progress, onStatistics, onHistory }) => (
  <section className="h-full rounded-[1.6rem] bg-[#F6F3EE] border border-[#DED7CB] shadow-[0_12px_30px_rgba(0,0,0,0.1)] px-3.5 py-3 space-y-2">
    <p className="text-[#A1958A] text-[0.76rem] uppercase tracking-[0.18em] font-black">STATUS DE EXPLORAÇÃO</p>
    <div className="flex items-end justify-between gap-3">
      <p className="text-[1.35rem] leading-none serif text-[#2A2119]">Seu progresso de descobertas</p>
      <p className="text-[1.8rem] leading-none serif text-[#2A2119]">{progress}%</p>
    </div>
    <div className="h-2.5 rounded-full bg-[#E8E2DA] overflow-hidden">
      <div className="h-full bg-gradient-to-r from-[#C48A2A] to-[#E0B96F] transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
    </div>
    <div className="grid grid-cols-2 border-t border-[#E5DDD2] pt-2.5">
      <button onClick={onStatistics} className="text-[#988978] text-[0.82rem] font-black flex items-center justify-center gap-1.5 border-r border-[#E5DDD2] py-1.5">
        📊 ESTATÍSTICAS
      </button>
      <button onClick={onHistory} className="text-[#988978] text-[0.82rem] font-black flex items-center justify-center gap-1.5 py-1.5">
        🕘 HISTÓRICO <span className="opacity-80">›</span>
      </button>
    </div>
  </section>
);

const SearchInput: React.FC<{
  value: string;
  placeholder: string;
  loading: boolean;
  showSuggestions: boolean;
  suggestions: SearchSuggestionItem[];
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSubmit: () => void;
  onSelectSuggestion: (title: string) => void;
}> = ({ value, placeholder, loading, showSuggestions, suggestions, onChange, onFocus, onBlur, onSubmit, onSelectSuggestion }) => (
  <div className="relative">
    <div className="flex items-center gap-3 rounded-2xl border border-[#DED7CB] bg-[#F7F3ED] px-4 py-4">
      <span className="text-xl text-[#A59684]">⌕</span>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} onKeyDown={(e) => e.key === 'Enter' && onSubmit()} className="w-full bg-transparent text-[#3E3228] placeholder:text-[#A89D8E] outline-none text-lg" />
      {value && <button onMouseDown={(e) => e.preventDefault()} onClick={() => onChange('')} className="text-[#A89D8E] text-xs font-bold">LIMPAR</button>}
      {loading && <div className="w-5 h-5 border-2 border-[#CFA14F] border-t-transparent rounded-full animate-spin" />}
    </div>
    {showSuggestions && suggestions.length > 0 && (
      <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[#DED7CB] bg-white shadow-2xl overflow-hidden z-20">
        {suggestions.map((item) => (
          <button key={item.id} onMouseDown={(e) => e.preventDefault()} onClick={() => onSelectSuggestion(item.title)} className="w-full flex items-center gap-3 p-3 border-b border-[#F0EAE0] last:border-b-0 text-left hover:bg-[#FAF7F2] transition-colors">
            {item.poster ? <img src={item.poster} alt={item.title} className="w-10 h-14 rounded-lg object-cover" /> : <div className="w-10 h-14 rounded-lg bg-[#EFE7DB] flex items-center justify-center text-sm">{item.kind === 'history' ? '🕘' : '🎵'}</div>}
            <div>
              <p className="text-[#332A22] text-sm font-semibold leading-tight">{item.title}</p>
              <p className="text-[#938574] text-xs">{item.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
);

const DropdownField: React.FC<{ label: string; value: string; isOpen: boolean; onToggle: () => void; options: string[]; onSelect: (value: string) => void }> = ({ label, value, isOpen, onToggle, options, onSelect }) => (
  <div className="relative">
    <label className="block text-[#3A2E24] text-[1.9rem] sm:text-2xl serif mb-2 leading-none">{label}</label>
    <button onClick={onToggle} className="w-full bg-white border border-[#D8D0C4] rounded-xl px-4 py-3 text-left text-[#3D3026] text-[1.45rem] sm:text-xl serif flex items-center justify-between">
      <span className="truncate pr-4">{value}</span>
      <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
    </button>
    {isOpen && (
      <div className="absolute left-0 right-0 mt-2 bg-white border border-[#D8D0C4] rounded-2xl shadow-xl z-20 overflow-hidden">
        {options.map((option) => (
          <button key={option} onClick={() => onSelect(option)} className={`w-full px-4 py-3 text-left text-sm transition-colors ${value === option ? 'bg-[#F8F1E5] text-[#8D621F] font-semibold' : 'hover:bg-[#F8F5EF] text-[#524437]'}`}>{option}</button>
        ))}
      </div>
    )}
  </div>
);

const ChipsRow: React.FC<{ chips: string[]; value: string | null; onChange: (value: string | null) => void }> = ({ chips, value, onChange }) => (
  <div className="flex flex-wrap gap-3">
    {chips.map((chip) => (
      <button key={chip} onClick={() => onChange(value === chip ? null : chip)} className={`px-4 py-2 rounded-full border text-[1.6rem] sm:text-lg serif transition-all ${value === chip ? 'bg-[#F3E4CA] border-[#CFA14F] text-[#8D621F]' : 'bg-[#F4F0EA] border-[#D7D0C6] text-[#60554A]'}`}>{chip}</button>
    ))}
  </div>
);

const InterpretButton: React.FC<{ disabled: boolean; loading: boolean; onClick: () => void; label?: string }> = ({ disabled, loading, onClick, label = "INTERPRETAR AGORA" }) => (
  <button disabled={disabled} onClick={onClick} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#C99022] via-[#DCA63A] to-[#B87A17] text-white text-2xl serif font-semibold tracking-wide shadow-[0_12px_28px_rgba(179,123,22,0.35)] disabled:opacity-40 disabled:cursor-not-allowed">
    {loading ? "PROCESSANDO..." : label}
  </button>
);

const CardsSection: React.FC<{ title: string; cards: { id: string; title: string; subtitle: string; emoji: string }[]; onSelect: (id: string) => void }> = ({ title, cards, onSelect }) => (
  <section className="space-y-4">
    <h3 className="text-[2.2rem] sm:text-4xl serif text-[#2E241B] leading-none">{title}</h3>
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {cards.map((card) => (
        <button key={card.id} onClick={() => onSelect(card.id)} className="text-left rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-[#3A2818] to-black border border-[#6A4A24]/60 shadow-xl p-2.5 sm:p-4 min-h-[185px] sm:min-h-[180px] flex flex-col justify-end hover:-translate-y-0.5 transition-transform">
          <p className="text-white text-[0.72rem] sm:text-2xl leading-tight mt-2 serif">{card.title}</p>
          <p className="text-[#E3D7C7] text-[0.58rem] sm:text-base mt-1.5 sm:mt-2 leading-tight">{card.subtitle}</p>
        </button>
      ))}
    </div>
  </section>
);

const AnalysisLayers: React.FC<{ result: MovieAnalysis; showSpoilers?: boolean }> = ({ result, showSpoilers = false }) => {
  const layerCard = "rounded-xl bg-white border border-[#E0D6C9] p-4 space-y-2";
  const layerTitle = "text-[#8D621F] text-xs uppercase tracking-wider font-bold";
  const text = "text-[#40352C] text-sm leading-relaxed";
  const list = "list-disc pl-5 space-y-1 text-[#40352C] text-sm";

  return (
    <div className="space-y-3">
      <div className={layerCard}>
        <p className={layerTitle}>1. Essência</p>
        <p className={text}>{result.info.synopsis}</p>
        <p className={text}><span className="font-semibold">Por que ver:</span> {result.whyWatch}</p>
      </div>

      <div className={layerCard}>
        <p className={layerTitle}>2. Valoração</p>
        <ul className={list}>
          {result.ratings.map((item, idx) => <li key={idx}><span className="font-semibold">{item.criterion} ({item.score}/10):</span> {item.explanation}</li>)}
        </ul>
      </div>

      <div className={layerCard}>
        <p className={layerTitle}>3. Exegese</p>
        <p className={text}><span className="font-semibold">Tese central:</span> {result.exegesis.centralThesis}</p>
        <p className={text}><span className="font-semibold">Intenção autoral:</span> {result.exegesis.authorIntention}</p>
        <ul className={list}>
          {result.exegesis.nuances.map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      </div>

      <div className={layerCard}>
        <p className={layerTitle}>4. Arquétipos</p>
        <ul className={list}>
          {result.characters.map((item, idx) => <li key={idx}><span className="font-semibold">{item.name} ({item.dramaticFunction}):</span> {item.description}</li>)}
        </ul>
      </div>

      <div className={layerCard}>
        <p className={layerTitle}>5. Simbolismo</p>
        <ul className={list}>
          {result.symbols.map((item, idx) => <li key={idx}><span className="font-semibold">{item.name}:</span> {item.representation} ({item.occurrence})</li>)}
        </ul>
      </div>

      <div className={layerCard}>
        <p className={layerTitle}>6. Conflitos</p>
        <ul className={list}>
          {result.characterConflicts.map((item, idx) => <li key={idx}><span className="font-semibold">{item.name}:</span> desejo {item.centralDesire}; medo {item.hiddenFear}; contradição {item.internalContradiction}</li>)}
        </ul>
      </div>

      <div className={layerCard}>
        <p className={layerTitle}>7. Lições</p>
        <p className="font-semibold text-[#40352C] text-sm">Humanas</p>
        <ul className={list}>{result.lessons.human.map((item, idx) => <li key={`h-${idx}`}>{item}</li>)}</ul>
        <p className="font-semibold text-[#40352C] text-sm mt-2">Existenciais</p>
        <ul className={list}>{result.lessons.existential.map((item, idx) => <li key={`e-${idx}`}>{item}</li>)}</ul>
      </div>

      <div className={layerCard}>
        <p className={layerTitle}>8. Leituras Alternativas</p>
        <p className={text}><span className="font-semibold">Psicológica:</span> {result.alternativeReadings.psychological}</p>
        <p className={text}><span className="font-semibold">Filosófica:</span> {result.alternativeReadings.philosophical}</p>
        <p className={text}><span className="font-semibold">Espiritual:</span> {result.alternativeReadings.spiritual}</p>
      </div>

      <div className={layerCard}>
        <p className={layerTitle}>9. Síntese</p>
        <p className={text}><span className="font-semibold">Tese:</span> {result.synthesis.centralThesis}</p>
        <ul className={list}>
          {result.synthesis.arguments.map((item, idx) => <li key={idx}><span className="font-semibold">{item.title}:</span> {item.paragraph}</li>)}
        </ul>
        <p className={text}><span className="font-semibold">Conclusão:</span> {result.synthesis.conclusion}</p>
      </div>

      <div className={layerCard}>
        <p className={layerTitle}>10. Visões</p>
        <ul className={list}>
          {result.perspectives.map((item, idx) => <li key={idx}><span className="font-semibold">{item.name} ({item.axis}):</span> {item.commentary}</li>)}
        </ul>
      </div>

      {showSpoilers && (
        <div className={layerCard}>
          <p className={layerTitle}>Spoilers</p>
          <p className={text}><span className="font-semibold">Final explicado:</span> {result.spoilers.finalExplained}</p>
          <p className={text}><span className="font-semibold">Twists:</span> {result.spoilers.twists}</p>
        </div>
      )}
    </div>
  );
};

const StoreHeader = () => <HeaderBlock title="Loja" subtitle="Escolha o plano ideal para explorar mais" accentA="🧾" accentB="🎞️" vibeA="🎧" vibeB="✨" />;
const SettingsHeader = () => <HeaderBlock title="Configurações" subtitle="Ajuste sua experiência de leitura e descoberta" accentA="📚" accentB="🎞️" vibeA="🕯️" vibeB="⚙️" />;

const PlanCard: React.FC<{ plan: Plan; selected: boolean; onSelect: () => void }> = ({ plan, selected, onSelect }) => (
  <div className={`rounded-3xl border p-4 bg-white shadow-lg relative ${selected || plan.bestValue ? 'border-amber-600 ring-2 ring-amber-400/30' : 'border-[#DED7CB]'}`}>
    {plan.bestValue && <div className="absolute -top-3 right-3 bg-amber-600 text-white text-[10px] px-3 py-1 rounded-full font-black">MELHOR VALOR</div>}
    <h4 className="text-3xl serif text-[#2A2119] text-center">{plan.title}</h4>
    <p className="text-center text-4xl serif mt-4 text-[#2A2119]">{plan.price}</p>
    <p className="text-center text-lg text-[#7B6D5D]">{plan.cycle}</p>
    <div className="h-px bg-[#E8E0D3] my-4" />
    <ul className="space-y-1 text-sm text-[#463b31]">
      <li>✓ Análises ilimitadas</li>
      <li>✓ Favoritos e histórico</li>
      <li>✓ Mais profundidade</li>
      <li>✓ Acesso premium</li>
    </ul>
    <button onClick={onSelect} className={`mt-5 w-full py-2 rounded-xl border font-black text-sm ${selected ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-[#8D621F] border-amber-600'}`}>ESCOLHER</button>
  </div>
);

const PlansGrid: React.FC<{ selectedPlan: PlanId | null; onSelect: (planId: PlanId) => void }> = ({ selectedPlan, onSelect }) => (
  <section className="space-y-4">
    <h3 className="text-4xl serif text-[#2E241B]">Planos disponíveis</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {PLANS.map((plan) => <PlanCard key={plan.planId} plan={plan} selected={selectedPlan === plan.planId} onSelect={() => onSelect(plan.planId)} />)}
    </div>
  </section>
);

const BenefitsSection = () => (
  <section className="space-y-4">
    <h3 className="text-4xl serif text-[#2E241B]">Com qualquer plano, você tem:</h3>
    <div className="rounded-3xl bg-white border border-[#DED7CB] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden">
      {[
        ['∞', 'Análises ilimitadas', 'Interpretações sem limites.'],
        ['⟳', 'Histórico completo', 'Acompanhe suas descobertas.'],
        ['♥', 'Favoritos', 'Salve o que é importante.'],
        ['◇', 'Experiência premium', 'Recursos exclusivos e atualizações.'],
      ].map(([icon, title, text]) => (
        <div key={title} className="p-4 border-b sm:border-b-0 sm:border-r last:border-r-0 border-[#E8E0D3] text-center">
          <div className="text-3xl mb-2">{icon}</div>
          <p className="text-xl serif text-[#2A2119]">{title}</p>
          <p className="text-sm text-[#6E6256]">{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const SubscribeButton: React.FC<{ loading: boolean; onClick: () => void }> = ({ loading, onClick }) => (
  <button onClick={onClick} disabled={loading} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C99022] to-[#B87A17] text-white font-black text-xl disabled:opacity-50">
    {loading ? 'PROCESSANDO...' : 'ASSINAR AGORA'}
  </button>
);

const SecurityFlexCard: React.FC<{ processing: boolean; onSubscribe: () => void }> = ({ processing, onSubscribe }) => (
  <section className="rounded-3xl bg-[#F7F1E6] border border-[#DED7CB] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <p className="text-4xl serif text-[#2A2119]">Segurança e flexibilidade</p>
      <p className="text-[#5F5449]">Cancele quando quiser. Sem taxas ocultas. Sua assinatura, do seu jeito.</p>
    </div>
    <SubscribeButton loading={processing} onClick={onSubscribe} />
  </section>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (value: boolean) => void }> = ({ checked, onChange }) => (
  <button onClick={() => onChange(!checked)} className={`w-16 h-9 rounded-full p-1 transition-colors ${checked ? 'bg-amber-600' : 'bg-zinc-300'}`}>
    <div className={`w-7 h-7 rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-0'}`} />
  </button>
);

const SettingsRow: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onClick?: () => void;
}> = ({ icon, title, subtitle, right, onClick }) => (
  <button onClick={onClick} className="w-full text-left flex items-center justify-between gap-3 py-4 border-b border-[#E8E0D3] last:border-b-0">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#EFE7DB] flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-[1.7rem] sm:text-3xl serif text-[#2A2119] leading-none">{title}</p>
        <p className="text-[#6A5E52] text-sm">{subtitle}</p>
      </div>
    </div>
    {right ?? <span className="text-2xl text-[#9D8D7A]">›</span>}
  </button>
);

const PremiumAccountCard: React.FC<{ userPlan: UserPlan; onClick: () => void }> = ({ userPlan, onClick }) => (
  <button onClick={onClick} className="w-full rounded-3xl bg-white border border-[#DED7CB] p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 rounded-full overflow-hidden border border-amber-500/40">
        <img src={BRAND_LOGO_URL} alt="Conta" className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-[2rem] sm:text-4xl serif text-[#2A2119] leading-none">Conta {userPlan === 'free' ? 'Free' : 'Premium'}</p>
        <p className="text-[#6A5E52]">Gerencie sua conta e preferências</p>
      </div>
    </div>
    <span className="text-2xl text-[#9D8D7A]">›</span>
  </button>
);

const SupportCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="w-full rounded-3xl bg-white border border-[#DED7CB] p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#EFE7DB] flex items-center justify-center">🎧</div>
      <div>
        <p className="text-[1.7rem] sm:text-3xl serif text-[#2A2119] leading-none">Fale com o suporte</p>
        <p className="text-[#6A5E52]">Estamos aqui para ajudar você</p>
      </div>
    </div>
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Online</span>
  </button>
);

const BottomNav: React.FC<{ activeTab: AppTab; onChange: (tab: AppTab) => void }> = ({ activeTab, onChange }) => {
  const items: { id: AppTab; label: string; icon: string }[] = [
    { id: 'home', label: 'HOME', icon: '🏠' },
    { id: 'movies_series', label: 'FILMES E SÉRIES', icon: '🎬' },
    { id: 'books', label: 'LIVROS', icon: '📖' },
    { id: 'music', label: 'MÚSICAS', icon: '🎵' },
    { id: 'store', label: 'LOJA', icon: '👜' },
    { id: 'settings', label: 'CONFIG.', icon: '⚙️' },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[1000] border-t bg-[#ECE7DF] border-[#D9D1C6] flex justify-around items-center rounded-t-[1.2rem] max-w-[430px] w-full" style={{ height: '86px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {items.map((item) => (
        <button key={item.id} onClick={() => onChange(item.id)} className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}>
          <div className="tab-icon-wrapper">{item.icon}</div>
          <span className="tab-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [userPlan, setUserPlan] = useState<UserPlan>('free');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [moviesQuery, setMoviesQuery] = useState('');
  const [moviesSearchType, setMoviesSearchType] = useState<MoviesSearchType>('movie');
  const [moviesAnalysisType, setMoviesAnalysisType] = useState<MoviesAnalysisTypeOption>("Final explicado, símbolos e mensagem central");
  const [moviesFocusChip, setMoviesFocusChip] = useState<MoviesFocusChipOption | null>(null);
  const [moviesSpoilerMode, setMoviesSpoilerMode] = useState(false);
  const [moviesShowDropdown, setMoviesShowDropdown] = useState(false);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [moviesResult, setMoviesResult] = useState<MovieAnalysis | null>(null);
  const [moviesError, setMoviesError] = useState<string | null>(null);
  const [moviesPayload, setMoviesPayload] = useState<Record<string, unknown> | null>(null);
  const [moviesSearchResults, setMoviesSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [moviesSearchLoading, setMoviesSearchLoading] = useState(false);
  const [moviesShowResults, setMoviesShowResults] = useState(false);
  const [moviesShowHistory, setMoviesShowHistory] = useState(false);
  const [recentMovies, setRecentMovies] = useState<string[]>([]);
  const [recentSeries, setRecentSeries] = useState<string[]>([]);

  const [booksQuery, setBooksQuery] = useState('');
  const [booksSearchType, setBooksSearchType] = useState<BooksSearchType>('book');
  const [booksAnalysisType, setBooksAnalysisType] = useState<BooksAnalysisTypeOption>("Tema central, personagens e simbolismos");
  const [booksDepthMode, setBooksDepthMode] = useState<BooksDepthMode>('deep');
  const [booksFocusChip, setBooksFocusChip] = useState<BooksFocusChipOption | null>(null);
  const [booksShowDropdown, setBooksShowDropdown] = useState(false);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksResult, setBooksResult] = useState<MovieAnalysis | null>(null);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [booksPayload, setBooksPayload] = useState<Record<string, unknown> | null>(null);
  const [booksSearchResults, setBooksSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [booksSearchLoading, setBooksSearchLoading] = useState(false);
  const [booksShowResults, setBooksShowResults] = useState(false);
  const [booksShowHistory, setBooksShowHistory] = useState(false);
  const [recentBooks, setRecentBooks] = useState<string[]>([]);
  const [recentAuthors, setRecentAuthors] = useState<string[]>([]);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [recentTracks, setRecentTracks] = useState<string[]>([]);
  const [recentArtists, setRecentArtists] = useState<string[]>([]);
  const [musicSearchType, setMusicSearchType] = useState<MusicSearchType>('track');
  const [musicAnalysisType, setMusicAnalysisType] = useState<MusicAnalysisTypeOption>("Significado da letra e mensagem central");
  const [musicMainFocus, setMusicMainFocus] = useState<MusicMainFocus>('lyrics');
  const [musicChipFocus, setMusicChipFocus] = useState<MusicFocusChipOption | null>(null);
  const [showMusicDropdown, setShowMusicDropdown] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);
  const [musicResult, setMusicResult] = useState<MovieAnalysis | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [musicPayload, setMusicPayload] = useState<Record<string, unknown> | null>(null);

  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>('annual');
  const [purchaseState, setPurchaseState] = useState<PurchaseState>('idle');
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [language, setLanguage] = useState('Português (Brasil)');
  const [restorePurchasesState, setRestorePurchasesState] = useState<PurchaseState>('idle');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const normalize = (v: string) => v.replace(/\s+/g, ' ').trim();
  const selectedPlanData = PLANS.find((p) => p.planId === (selectedPlan ?? 'annual')) ?? PLANS[3];

  useEffect(() => {
    const uid = localStorage.getItem('decifra_user_id') || `decifra-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('decifra_user_id', uid);
    setUserId(uid);
    const savedPlan = localStorage.getItem('cine_exegese_plan') as UserPlan | null;
    if (savedPlan) setUserPlan(savedPlan);
    setIsLoggedIn(localStorage.getItem('decifra_logged_in') === 'true');
    setNotificationsEnabled(localStorage.getItem('decifra_notifications_enabled') !== 'false');
    setThemeMode((localStorage.getItem('decifra_theme_mode') as ThemeMode | null) || 'light');
    setLanguage(localStorage.getItem('decifra_language') || 'Português (Brasil)');
    try {
      setRecentTracks(JSON.parse(localStorage.getItem('decifra_recent_track_queries') || '[]'));
      setRecentArtists(JSON.parse(localStorage.getItem('decifra_recent_music_artist_queries') || '[]'));
      setRecentMovies(JSON.parse(localStorage.getItem('decifra_recent_movie_queries') || '[]'));
      setRecentSeries(JSON.parse(localStorage.getItem('decifra_recent_series_queries') || '[]'));
      setRecentBooks(JSON.parse(localStorage.getItem('decifra_recent_book_queries') || '[]'));
      setRecentAuthors(JSON.parse(localStorage.getItem('decifra_recent_author_queries') || '[]'));
    } catch { }
  }, []);

  useEffect(() => { localStorage.setItem('decifra_notifications_enabled', String(notificationsEnabled)); }, [notificationsEnabled]);
  useEffect(() => { localStorage.setItem('decifra_theme_mode', themeMode); }, [themeMode]);
  useEffect(() => { localStorage.setItem('decifra_language', language); }, [language]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const n = normalize(query);
      if (n.length >= 2) {
        setSearchLoading(true);
        const rs = await runUnifiedSearch(n);
        setSearchResults(rs);
        setShowResults(rs.length > 0);
        setSearchLoading(false);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const n = normalize(moviesQuery);
      if (n.length >= 2) {
        setMoviesSearchLoading(true);
        const rs = await runUnifiedSearch(n);
        setMoviesSearchResults(rs);
        setMoviesShowResults(rs.length > 0);
        setMoviesSearchLoading(false);
      } else {
        setMoviesSearchResults([]);
        setMoviesShowResults(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [moviesQuery]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const n = normalize(booksQuery);
      if (n.length >= 2) {
        setBooksSearchLoading(true);
        const rs = await runUnifiedSearch(n);
        setBooksSearchResults(rs);
        setBooksShowResults(rs.length > 0);
        setBooksSearchLoading(false);
      } else {
        setBooksSearchResults([]);
        setBooksShowResults(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [booksQuery]);

  const suggestions = useMemo<SearchSuggestionItem[]>(() => {
    const n = normalize(query);
    if (showHistory && n.length === 0) {
      const hist = musicSearchType === 'track' ? recentTracks : recentArtists;
      return hist.map((v, i) => ({ id: `h-${i}-${v}`, title: v, subtitle: musicSearchType === 'track' ? 'Música recente' : 'Artista recente', kind: 'history' }));
    }
    return searchResults.map((r) => ({ id: r.id, title: r.title, subtitle: `${r.year} • ${musicSearchType === 'track' ? 'Faixa' : 'Artista'}`, poster: r.poster, kind: 'search' }));
  }, [query, showHistory, musicSearchType, recentTracks, recentArtists, searchResults]);

  const moviesSuggestions = useMemo<SearchSuggestionItem[]>(() => {
    const n = normalize(moviesQuery);
    if (moviesShowHistory && n.length === 0) {
      const hist = moviesSearchType === 'movie' ? recentMovies : recentSeries;
      return hist.map((v, i) => ({ id: `m-${i}-${v}`, title: v, subtitle: moviesSearchType === 'movie' ? 'Filme recente' : 'Série recente', kind: 'history' }));
    }
    return moviesSearchResults.map((r) => ({ id: r.id, title: r.title, subtitle: `${r.year} • ${r.type === 'movie' ? 'Filme' : 'Série'}`, poster: r.poster, kind: 'search' }));
  }, [moviesQuery, moviesShowHistory, moviesSearchType, recentMovies, recentSeries, moviesSearchResults]);

  const booksSuggestions = useMemo<SearchSuggestionItem[]>(() => {
    const n = normalize(booksQuery);
    if (booksShowHistory && n.length === 0) {
      const hist = booksSearchType === 'book' ? recentBooks : recentAuthors;
      return hist.map((v, i) => ({ id: `b-${i}-${v}`, title: v, subtitle: booksSearchType === 'book' ? 'Livro recente' : 'Autor recente', kind: 'history' }));
    }
    return booksSearchResults.map((r) => ({ id: r.id, title: r.title, subtitle: `${r.year} • referência`, poster: r.poster, kind: 'search' }));
  }, [booksQuery, booksShowHistory, booksSearchType, recentBooks, recentAuthors, booksSearchResults]);

  const runMusicAnalysis = async () => {
    const cleaned = normalize(query);
    if (!cleaned || musicLoading) return;
    const payload = {
      mediaCategory: "music",
      searchType: musicSearchType,
      query: cleaned,
      analysisType: musicAnalysisType,
      mainFocus: musicMainFocus,
      chipFocus: musicChipFocus ?? undefined,
      userPlan,
      userId,
    };
    setMusicPayload(payload);
    setMusicLoading(true);
    setMusicError(null);
    try {
      const mode: AnalysisMode = musicMainFocus === 'emotion' ? 'reflexivo' : musicAnalysisType === "Interpretação geral" ? 'direto' : 'profundo';
      const result = await interpretMovie(cleaned, mode, 'filme' as ContentType, { ...payload, focusChip: payload.chipFocus });
      setMusicResult(result);
      const hist = musicSearchType === 'track'
        ? [cleaned, ...recentTracks.filter((x) => x.toLowerCase() !== cleaned.toLowerCase())].slice(0, 8)
        : [cleaned, ...recentArtists.filter((x) => x.toLowerCase() !== cleaned.toLowerCase())].slice(0, 8);
      if (musicSearchType === 'track') {
        setRecentTracks(hist);
        localStorage.setItem('decifra_recent_track_queries', JSON.stringify(hist));
      } else {
        setRecentArtists(hist);
        localStorage.setItem('decifra_recent_music_artist_queries', JSON.stringify(hist));
      }
    } catch (e) {
      setMusicError(e instanceof Error ? e.message : 'Erro desconhecido');
      setToast('Falha ao interpretar música/artista. Tente novamente.');
    } finally {
      setMusicLoading(false);
    }
  };

  const runMoviesAnalysis = async () => {
    const cleaned = normalize(moviesQuery);
    if (!cleaned || moviesLoading) return;
    const payload = {
      mediaCategory: 'movies_series',
      mediaType: moviesSearchType,
      title: cleaned,
      spoilerMode: moviesSpoilerMode,
      analysisType: moviesAnalysisType,
      focusChip: moviesFocusChip ?? undefined,
      userPlan,
      userId,
    };
    setMoviesPayload(payload);
    setMoviesLoading(true);
    setMoviesError(null);
    try {
      const mode: AnalysisMode = moviesAnalysisType === "Interpretação geral da obra" ? 'direto' : moviesAnalysisType === "Contexto, mensagem e crítica" ? 'reflexivo' : 'profundo';
      const contentType: ContentType = moviesSearchType === 'movie' ? 'filme' : 'serie';
      const result = await interpretMovie(cleaned, mode, contentType, payload);
      setMoviesResult(result);
      const hist = moviesSearchType === 'movie'
        ? [cleaned, ...recentMovies.filter((x) => x.toLowerCase() !== cleaned.toLowerCase())].slice(0, 8)
        : [cleaned, ...recentSeries.filter((x) => x.toLowerCase() !== cleaned.toLowerCase())].slice(0, 8);
      if (moviesSearchType === 'movie') {
        setRecentMovies(hist);
        localStorage.setItem('decifra_recent_movie_queries', JSON.stringify(hist));
      } else {
        setRecentSeries(hist);
        localStorage.setItem('decifra_recent_series_queries', JSON.stringify(hist));
      }
    } catch (e) {
      setMoviesError(e instanceof Error ? e.message : 'Erro desconhecido');
      setToast('Falha ao interpretar filme/série. Tente novamente.');
    } finally {
      setMoviesLoading(false);
    }
  };

  const runBooksAnalysis = async () => {
    const cleaned = normalize(booksQuery);
    if (!cleaned || booksLoading) return;
    const payload = {
      mediaCategory: 'books',
      searchType: booksSearchType,
      query: cleaned,
      analysisType: booksAnalysisType,
      depthMode: booksDepthMode,
      focusChip: booksFocusChip ?? undefined,
      userPlan,
      userId,
    };
    setBooksPayload(payload);
    setBooksLoading(true);
    setBooksError(null);
    try {
      const mode: AnalysisMode = booksDepthMode === 'quick' ? 'direto' : booksAnalysisType === 'Contexto histórico e mensagem' ? 'reflexivo' : 'profundo';
      const result = await interpretMovie(cleaned, mode, 'filme', payload);
      setBooksResult(result);
      const hist = booksSearchType === 'book'
        ? [cleaned, ...recentBooks.filter((x) => x.toLowerCase() !== cleaned.toLowerCase())].slice(0, 8)
        : [cleaned, ...recentAuthors.filter((x) => x.toLowerCase() !== cleaned.toLowerCase())].slice(0, 8);
      if (booksSearchType === 'book') {
        setRecentBooks(hist);
        localStorage.setItem('decifra_recent_book_queries', JSON.stringify(hist));
      } else {
        setRecentAuthors(hist);
        localStorage.setItem('decifra_recent_author_queries', JSON.stringify(hist));
      }
    } catch (e) {
      setBooksError(e instanceof Error ? e.message : 'Erro desconhecido');
      setToast('Falha ao interpretar livro/autor. Tente novamente.');
    } finally {
      setBooksLoading(false);
    }
  };

  const checkoutPayload = () => ({
    planId: selectedPlanData.planId,
    billingCycle: selectedPlanData.billingCycle,
    price: selectedPlanData.price,
    currency: 'BRL',
    userId,
    source: 'store_screen',
  });

  const simulateCheckout = async () => {
    setPurchaseState('processingPayment');
    setPurchaseError(null);
    await new Promise((r) => setTimeout(r, 1200));
    const failed = Math.random() < 0.12;
    if (failed) {
      setPurchaseState('error');
      setPurchaseError('Não foi possível processar o pagamento agora. Tente novamente.');
      return;
    }
    setPurchaseState('success');
    setUserPlan('premium');
    localStorage.setItem('cine_exegese_plan', 'premium');
    setToast(`Assinatura ${selectedPlanData.title} ativada com sucesso.`);
    console.log('checkout_payload', checkoutPayload());
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) setSelectedPlan('annual');
    if (!isLoggedIn) {
      setShowLoginModal(true);
      setPurchaseState('idle');
      return;
    }
    await simulateCheckout();
  };

  const handleRestorePurchases = async () => {
    setRestorePurchasesState('processingPayment');
    await new Promise((r) => setTimeout(r, 900));
    setRestorePurchasesState('restored');
    setToast('Restauração de compras concluída.');
  };

  const openSupport = () => {
    window.open('https://wa.me/5511978055321?text=Ol%C3%A1!%20Preciso%20de%20suporte%20no%20app%20Decifra.', '_blank');
  };

  const renderMusic = () => (
    <div className="space-y-6 pb-4">
      <HeaderBlock title="Músicas" subtitle="Interprete letras, emoções e significados" accentA="🎵" accentB="🎧" vibeA="💿" vibeB="🎼" />
      {!musicResult && (
        <section className="rounded-[2rem] bg-[#F2EEE8] border border-[#DED7CB] shadow-[0_16px_40px_rgba(0,0,0,0.14)] p-4 md:p-6 space-y-5">
          <SegmentedToggle value={musicSearchType} onChange={(v) => setMusicSearchType(v as MusicSearchType)} options={[{ id: 'track', label: 'MÚSICA' }, { id: 'artist', label: 'ARTISTA' }]} />
          <SearchInput
            value={query}
            placeholder={musicSearchType === 'track' ? "Ex.: Bohemian Rhapsody, Trem Bala..." : "Ex.: Queen, Djavan, Adele..."}
            loading={searchLoading}
            showSuggestions={(showResults || showHistory) && !musicLoading}
            suggestions={suggestions}
            onChange={(v) => {
              const n = v.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
              setQuery(n);
              if (normalize(n).length === 0) { setShowResults(false); setShowHistory(false); }
            }}
            onFocus={() => {
              const n = normalize(query);
              const hist = musicSearchType === 'track' ? recentTracks : recentArtists;
              if (n.length === 0 && hist.length > 0) { setShowHistory(true); setShowResults(false); }
              else if (n.length >= 2 && searchResults.length > 0) setShowResults(true);
            }}
            onBlur={() => window.setTimeout(() => { setShowResults(false); setShowHistory(false); }, 100)}
            onSubmit={runMusicAnalysis}
            onSelectSuggestion={(title) => { setQuery(title); setShowHistory(false); setShowResults(false); }}
          />
          <DropdownField label="Tipo de análise" value={musicAnalysisType} isOpen={showMusicDropdown} onToggle={() => setShowMusicDropdown((v) => !v)} options={MUSIC_ANALYSIS_TYPES} onSelect={(v) => { setMusicAnalysisType(v as MusicAnalysisTypeOption); setShowMusicDropdown(false); }} />
          <div>
            <label className="block text-[#3A2E24] text-2xl serif mb-2">Foco</label>
            <SegmentedToggle value={musicMainFocus} onChange={(v) => setMusicMainFocus(v as MusicMainFocus)} options={[{ id: 'lyrics', label: 'LETRA' }, { id: 'context', label: 'CONTEXTO' }, { id: 'emotion', label: 'EMOÇÃO' }]} />
          </div>
          <ChipsRow chips={["Simbologia", "Refrão", "Sentimento", "Referências"]} value={musicChipFocus} onChange={(v) => setMusicChipFocus(v as MusicFocusChipOption | null)} />
          <InterpretButton disabled={musicLoading || normalize(query).length === 0} loading={musicLoading} onClick={runMusicAnalysis} />
          {musicError && <p className="text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-3 text-sm">{musicError}</p>}
        </section>
      )}
      {musicResult && (
        <section className="rounded-[2rem] bg-[#F2EEE8] border border-[#DED7CB] shadow-[0_16px_40px_rgba(0,0,0,0.14)] p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl serif text-[#2A2119]">{musicSearchType === 'track' ? musicResult.info.originalTitle : query}</h3>
            <button onClick={() => setMusicResult(null)} className="text-sm text-[#8D621F] font-semibold">Nova busca</button>
          </div>
          <AnalysisLayers result={musicResult} />
          <div className="rounded-xl bg-white border border-[#E0D6C9] p-4">
            <p className="text-[#8D621F] text-xs uppercase tracking-wider font-bold mb-1">Payload enviado</p>
            <pre className="text-xs text-[#5F5449] whitespace-pre-wrap">{JSON.stringify(musicPayload, null, 2)}</pre>
          </div>
        </section>
      )}
      <CardsSection title="Destaques de hoje" onSelect={() => { }} cards={[
        { id: 'mensagem', title: 'MENSAGEM DA LETRA', subtitle: 'Essência e significado', emoji: '✍️' },
        { id: 'sentimento', title: 'SENTIMENTO CENTRAL', subtitle: 'Emoção dominante', emoji: '💛' },
        { id: 'contexto', title: 'CONTEXTO DA CANÇÃO', subtitle: 'Tempo, cenário e referências', emoji: '🎸' },
      ]} />
    </div>
  );

  const renderMovies = () => (
    <div className="space-y-6 pb-4">
      <MoviesHeroBanner onOpenSettings={() => setActiveTab('settings')} />
      {!moviesResult && (
        <section className="rounded-[2rem] bg-[#F6F3EE] border border-[#DED7CB] shadow-[0_14px_34px_rgba(0,0,0,0.1)] px-4 py-5 space-y-5">
          <SegmentedToggle value={moviesSearchType} onChange={(v) => setMoviesSearchType(v as MoviesSearchType)} options={[{ id: 'movie', label: 'FILME' }, { id: 'series', label: 'SÉRIE' }]} />
          <SearchInput
            value={moviesQuery}
            placeholder={moviesSearchType === 'movie' ? "Ex.: Matrix, Interestelar, O Poderoso Chefão..." : "Ex.: Dark, Breaking Bad, Lost..."}
            loading={moviesSearchLoading}
            showSuggestions={(moviesShowResults || moviesShowHistory) && !moviesLoading}
            suggestions={moviesSuggestions}
            onChange={(v) => {
              const n = v.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
              setMoviesQuery(n);
              if (normalize(n).length === 0) { setMoviesShowResults(false); setMoviesShowHistory(false); }
            }}
            onFocus={() => {
              const n = normalize(moviesQuery);
              const hist = moviesSearchType === 'movie' ? recentMovies : recentSeries;
              if (n.length === 0 && hist.length > 0) { setMoviesShowHistory(true); setMoviesShowResults(false); }
              else if (n.length >= 2 && moviesSearchResults.length > 0) setMoviesShowResults(true);
            }}
            onBlur={() => window.setTimeout(() => { setMoviesShowResults(false); setMoviesShowHistory(false); }, 100)}
            onSubmit={runMoviesAnalysis}
            onSelectSuggestion={(title) => { setMoviesQuery(title); setMoviesShowHistory(false); setMoviesShowResults(false); }}
          />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-[#3A2E24] text-[2rem] leading-none serif">Modo spoiler</label>
              <span className="w-5 h-5 rounded-full border border-[#C9BAA9] text-[#8F7D67] text-xs flex items-center justify-center">i</span>
            </div>
            <SegmentedToggle value={moviesSpoilerMode ? 'on' : 'off'} onChange={(v) => setMoviesSpoilerMode(v === 'on')} options={[{ id: 'off', label: 'SEM SPOILER' }, { id: 'on', label: 'COM SPOILER' }]} />
          </div>
          <DropdownField label="Tipo de análise" value={moviesAnalysisType} isOpen={moviesShowDropdown} onToggle={() => setMoviesShowDropdown((v) => !v)} options={MOVIES_ANALYSIS_TYPES} onSelect={(v) => { setMoviesAnalysisType(v as MoviesAnalysisTypeOption); setMoviesShowDropdown(false); }} />
          <ChipsRow chips={["Personagens", "Temas", "Contexto", "Arco final"]} value={moviesFocusChip} onChange={(v) => setMoviesFocusChip(v as MoviesFocusChipOption | null)} />
          <InterpretButton disabled={moviesLoading || normalize(moviesQuery).length === 0} loading={moviesLoading} onClick={runMoviesAnalysis} />
          {moviesError && <p className="text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-3 text-sm">{moviesError}</p>}
        </section>
      )}
      {moviesResult && (
        <section className="rounded-[2rem] bg-[#F2EEE8] border border-[#DED7CB] shadow-[0_16px_40px_rgba(0,0,0,0.14)] p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl serif text-[#2A2119]">{moviesResult.info.originalTitle}</h3>
            <button onClick={() => setMoviesResult(null)} className="text-sm text-[#8D621F] font-semibold">Nova busca</button>
          </div>
          <AnalysisLayers result={moviesResult} showSpoilers={moviesSpoilerMode} />
          <div className="rounded-xl bg-white border border-[#E0D6C9] p-4">
            <p className="text-[#8D621F] text-xs uppercase tracking-wider font-bold mb-1">Payload enviado</p>
            <pre className="text-xs text-[#5F5449] whitespace-pre-wrap">{JSON.stringify(moviesPayload, null, 2)}</pre>
          </div>
        </section>
      )}
      {!moviesResult && (
        <SuggestionsSection
          onViewAll={() => setToast('Mostrando todas as sugestões de hoje.')}
          onSelect={(id) => {
            if (id === 'final_explicado') {
              setMoviesAnalysisType('Final explicado, símbolos e mensagem central');
              setMoviesFocusChip('Arco final');
              setToast('Sugestão "Final explicado" aplicada.');
              return;
            }
            if (id === 'simbolismos') {
              setMoviesAnalysisType('Simbolismos e temas ocultos');
              setMoviesFocusChip('Temas');
              setToast('Sugestão "Simbolismos" aplicada.');
              return;
            }
            setMoviesAnalysisType('Personagens e arco narrativo');
            setMoviesFocusChip('Personagens');
            setToast('Sugestão "Arco dos personagens" aplicada.');
          }}
        />
      )}
    </div>
  );

  const renderBooks = () => (
    <div className="space-y-6 pb-4">
      <HeaderBlock title="Livros" subtitle="Descubra temas, símbolos e camadas da leitura" accentA="📚" accentB="🔎" vibeA="🕯️" vibeB="📖" />
      {!booksResult && (
        <section className="rounded-[2rem] bg-[#F2EEE8] border border-[#DED7CB] shadow-[0_16px_40px_rgba(0,0,0,0.14)] p-4 md:p-6 space-y-5">
          <SegmentedToggle value={booksSearchType} onChange={(v) => setBooksSearchType(v as BooksSearchType)} options={[{ id: 'book', label: 'LIVRO' }, { id: 'author', label: 'AUTOR' }]} />
          <SearchInput
            value={booksQuery}
            placeholder={booksSearchType === 'book' ? "Ex.: 1984, Dom Casmurro, O Hobbit..." : "Ex.: Machado de Assis, Tolkien, C. S. Lewis..."}
            loading={booksSearchLoading}
            showSuggestions={(booksShowResults || booksShowHistory) && !booksLoading}
            suggestions={booksSuggestions}
            onChange={(v) => {
              const n = v.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
              setBooksQuery(n);
              if (normalize(n).length === 0) { setBooksShowResults(false); setBooksShowHistory(false); }
            }}
            onFocus={() => {
              const n = normalize(booksQuery);
              const hist = booksSearchType === 'book' ? recentBooks : recentAuthors;
              if (n.length === 0 && hist.length > 0) { setBooksShowHistory(true); setBooksShowResults(false); }
              else if (n.length >= 2 && booksSearchResults.length > 0) setBooksShowResults(true);
            }}
            onBlur={() => window.setTimeout(() => { setBooksShowResults(false); setBooksShowHistory(false); }, 100)}
            onSubmit={runBooksAnalysis}
            onSelectSuggestion={(title) => { setBooksQuery(title); setBooksShowHistory(false); setBooksShowResults(false); }}
          />
          <DropdownField label="Tipo de análise" value={booksAnalysisType} isOpen={booksShowDropdown} onToggle={() => setBooksShowDropdown((v) => !v)} options={BOOKS_ANALYSIS_TYPES} onSelect={(v) => { setBooksAnalysisType(v as BooksAnalysisTypeOption); setBooksShowDropdown(false); }} />
          <div>
            <label className="block text-[#3A2E24] text-2xl serif mb-2">Profundidade</label>
            <SegmentedToggle value={booksDepthMode} onChange={(v) => setBooksDepthMode(v as BooksDepthMode)} options={[{ id: 'quick', label: 'RÁPIDA' }, { id: 'deep', label: 'PROFUNDA' }]} />
          </div>
          <ChipsRow chips={["Resumo", "Personagens", "Contexto", "Citações"]} value={booksFocusChip} onChange={(v) => setBooksFocusChip(v as BooksFocusChipOption | null)} />
          <InterpretButton disabled={booksLoading || normalize(booksQuery).length === 0} loading={booksLoading} onClick={runBooksAnalysis} />
          {booksError && <p className="text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-3 text-sm">{booksError}</p>}
        </section>
      )}
      {booksResult && (
        <section className="rounded-[2rem] bg-[#F2EEE8] border border-[#DED7CB] shadow-[0_16px_40px_rgba(0,0,0,0.14)] p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl serif text-[#2A2119]">{booksSearchType === 'book' ? booksResult.info.originalTitle : booksQuery}</h3>
            <button onClick={() => setBooksResult(null)} className="text-sm text-[#8D621F] font-semibold">Nova busca</button>
          </div>
          <AnalysisLayers result={booksResult} />
          <div className="rounded-xl bg-white border border-[#E0D6C9] p-4">
            <p className="text-[#8D621F] text-xs uppercase tracking-wider font-bold mb-1">Payload enviado</p>
            <pre className="text-xs text-[#5F5449] whitespace-pre-wrap">{JSON.stringify(booksPayload, null, 2)}</pre>
          </div>
        </section>
      )}
    </div>
  );

  const renderStore = () => (
    <div className="space-y-6 pb-4">
      <StoreHeader />
      <PlansGrid selectedPlan={selectedPlan} onSelect={(planId) => { setSelectedPlan(planId); setPurchaseState('selectingPlan'); }} />
      <BenefitsSection />
      <SecurityFlexCard processing={purchaseState === 'processingPayment'} onSubscribe={handleSubscribe} />
      <p className="text-center text-sm text-[#736554]">🔒 Pagamento 100% seguro. Seus dados estão protegidos.</p>
      {purchaseState === 'success' && <p className="rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 p-3">Assinatura premium confirmada. Bem-vindo ao Decifra Premium.</p>}
      {purchaseState === 'error' && <div className="rounded-xl bg-red-100 border border-red-300 text-red-800 p-3 space-y-2"><p>{purchaseError}</p><button onClick={handleSubscribe} className="text-sm underline">Tentar novamente</button></div>}
      <div className="rounded-xl bg-white border border-[#DED7CB] p-3">
        <p className="text-sm font-bold text-[#6A5E52] mb-1">Checkout payload</p>
        <pre className="text-xs text-[#5F5449] whitespace-pre-wrap">{JSON.stringify(checkoutPayload(), null, 2)}</pre>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 pb-4">
      <SettingsHeader />
      <PremiumAccountCard userPlan={userPlan} onClick={() => setShowAccountModal(true)} />
      <section className="space-y-3">
        <h3 className="text-4xl serif text-[#2E241B]">Preferências</h3>
        <div className="rounded-3xl bg-white border border-[#DED7CB] px-4">
          <SettingsRow icon="👤" title="Conta" subtitle="Gerencie seus dados e assinatura" onClick={() => setShowAccountModal(true)} />
          <SettingsRow icon="🔔" title="Notificações" subtitle="Receba alertas e novidades" right={<ToggleSwitch checked={notificationsEnabled} onChange={setNotificationsEnabled} />} />
          <SettingsRow icon="🌙" title="Tema" subtitle="Escolha entre claro ou escuro" right={<ToggleSwitch checked={themeMode === 'dark'} onChange={(v) => setThemeMode(v ? 'dark' : 'light')} />} />
          <SettingsRow icon="🌐" title="Idioma" subtitle={language} onClick={() => setLanguage('Português (Brasil)')} />
          <SettingsRow icon="🛡️" title="Privacidade" subtitle="Gerencie sua privacidade e dados" onClick={() => setShowPrivacyModal(true)} />
          <SettingsRow icon="⟳" title="Restaurar compras" subtitle="Recupere suas compras anteriores" onClick={handleRestorePurchases} />
          <SettingsRow icon="❓" title="Ajuda" subtitle="Dúvidas frequentes e suporte" onClick={openSupport} />
          <SettingsRow icon="ⓘ" title="Sobre o app" subtitle={`Versão ${APP_VERSION}`} onClick={() => setShowAboutModal(true)} />
        </div>
      </section>
      <section className="space-y-3">
        <h3 className="text-4xl serif text-[#2E241B]">Suporte</h3>
        <SupportCard onClick={openSupport} />
      </section>
      {restorePurchasesState === 'processingPayment' && <p className="text-sm text-[#6A5E52]">Restaurando compras...</p>}
    </div>
  );

  const renderHome = () => {
    const discoveries = [
      { id: 'final', title: 'FINAL EXPLICADO', subtitle: 'Entenda o desfecho em profundidade', bg: 'linear-gradient(160deg,#553115 0%,#1d120a 70%)' },
      { id: 'camadas', title: 'CAMADAS OCULTAS', subtitle: 'Descubra símbolos e seus significados', bg: 'linear-gradient(160deg,#5a3819 0%,#1a1209 75%)' },
      { id: 'mensagem', title: 'MENSAGEM CENTRAL', subtitle: 'A ideia principal da obra', bg: 'linear-gradient(160deg,#6f461c 0%,#1a1209 75%)' },
    ];

    const progress = Math.min(100, Math.round(((recentMovies.length + recentSeries.length + recentBooks.length + recentTracks.length) / 12) * 100));

    return (
      <div className="h-full flex flex-col gap-2">
        <div className="basis-[22%] min-h-[150px]">
          <HomeHeroBanner onOpenSettings={() => setActiveTab('settings')} />
        </div>

        <div className="basis-[16%] min-h-[118px]">
          <HomeStatusCard
            progress={progress}
            onStatistics={() => setToast('Abrindo estatísticas...')}
            onHistory={() => setToast('Abrindo histórico...')}
          />
        </div>

        <section className="basis-[21%] min-h-[164px] flex flex-col gap-1">
          <h3 className="text-[1.5rem] serif text-[#2E241B] leading-none">Acesso Rápido</h3>
          <div className="grid grid-cols-3 grid-rows-2 gap-2.5 flex-1 min-h-0">
            {[
              ['Filmes e Séries', '🎬', 'movies_series'],
              ['Livros', '📖', 'books'],
              ['Músicas', '🎵', 'music'],
              ['Favoritos', '♡', 'home'],
              ['Tendências', '↗', 'home'],
              ['Loja', '👜', 'store'],
            ].map(([title, icon, tab]) => (
              <button
                key={title}
                onClick={() => {
                  if (tab === 'home' && title === 'Favoritos') setToast('Abrindo favoritos...');
                  else if (tab === 'home' && title === 'Tendências') setToast('Abrindo tendências...');
                  else setActiveTab(tab as AppTab);
                }}
                className="h-full rounded-[1rem] bg-[#F7F4EF] border border-[#E3DCD1] shadow-[0_8px_18px_rgba(0,0,0,0.08)] p-2 flex flex-col items-center justify-center gap-1.5"
              >
                <span className="w-8 h-8 rounded-full bg-[#EFE9E0] flex items-center justify-center text-base text-[#8A6A3A]">{icon}</span>
                <span className="text-[0.62rem] leading-tight text-center serif text-[#34271D]">{title}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="basis-[21%] min-h-[148px] flex flex-col gap-1">
          <h3 className="text-[1.5rem] serif text-[#2E241B] leading-none">Sua Descoberta Hoje</h3>
          <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-0">
            {discoveries.map((card) => (
              <button
                key={card.id}
                onClick={() => setToast(`Sugestão "${card.title}" aplicada.`)}
                className="relative h-full rounded-[1rem] overflow-hidden border border-[#6A4A24]/50 shadow-lg text-left"
                style={{ backgroundImage: card.bg }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/35 to-black/80" />
                <div className="absolute left-2 right-2 bottom-1.5">
                  <p className="text-white text-[0.56rem] leading-tight serif font-semibold">{card.title}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="flex-1 min-h-[24px]" />
      </div>
    );
  };

  const renderPlaceholder = (title: string, subtitle: string) => (
    <div className="rounded-[2rem] bg-[#F2EEE8] border border-[#DED7CB] shadow-[0_16px_40px_rgba(0,0,0,0.14)] p-6 text-center">
      <h3 className="text-4xl serif text-[#2A2119]">{title}</h3>
      <p className="text-[#6F6358] mt-2">{subtitle}</p>
    </div>
  );

  const isHomeScreen = activeTab === 'home';

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'bg-[#1d1915] text-[#F3EBDD]' : 'bg-[#EDE7DF] text-[#2B231C]'} p-0 flex items-start justify-center`}>
      <div className={`relative overflow-x-hidden bg-[#EDE7DF] w-full max-w-[430px] h-[100dvh] mobile-shell ${isHomeScreen ? 'overflow-y-hidden' : 'overflow-y-auto'}`}>
        <main className={`w-full px-4 pt-4 ${isHomeScreen ? 'h-[calc(100dvh-86px)] pb-4 overflow-hidden' : 'pb-28'}`}>
          {activeTab === 'home' && renderHome()}
          {activeTab === 'music' && renderMusic()}
          {activeTab === 'store' && renderStore()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'movies_series' && renderMovies()}
          {activeTab === 'books' && renderBooks()}
        </main>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl bg-white p-5 space-y-3">
            <p className="text-2xl serif text-[#2A2119]">Entrar para continuar</p>
            <p className="text-sm text-[#6A5E52]">Você precisa estar logado para assinar um plano.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowLoginModal(false)} className="flex-1 py-2 border rounded-lg">Cancelar</button>
              <button onClick={() => { setIsLoggedIn(true); localStorage.setItem('decifra_logged_in', 'true'); setShowLoginModal(false); setToast('Login realizado. Continue com a assinatura.'); }} className="flex-1 py-2 bg-amber-600 text-white rounded-lg">Entrar</button>
            </div>
          </div>
        </div>
      )}

      {showAccountModal && (
        <div className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white p-5 space-y-3">
            <p className="text-2xl serif text-[#2A2119]">Conta</p>
            <p>Email: usuario@decifra.app</p>
            <p>Plano: {userPlan.toUpperCase()}</p>
            <p>Status da assinatura: {userPlan === 'free' ? 'Inativo' : 'Ativo'}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowAccountModal(false)} className="flex-1 py-2 border rounded-lg">Fechar</button>
              <button onClick={() => { setIsLoggedIn(false); localStorage.setItem('decifra_logged_in', 'false'); setShowAccountModal(false); setToast('Logout realizado.'); }} className="flex-1 py-2 bg-zinc-800 text-white rounded-lg">Logout</button>
            </div>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white p-5 space-y-3">
            <p className="text-2xl serif text-[#2A2119]">Privacidade</p>
            <p className="text-sm text-[#5F5449]">Gerencie consentimentos, termos de uso e política de dados do app Decifra.</p>
            <button onClick={() => setShowPrivacyModal(false)} className="w-full py-2 border rounded-lg">Fechar</button>
          </div>
        </div>
      )}

      {showAboutModal && (
        <div className="fixed inset-0 z-[2000] bg-black/40 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white p-5 space-y-3">
            <p className="text-2xl serif text-[#2A2119]">Sobre o app</p>
            <p>Versão: {APP_VERSION}</p>
            <p>Build: decifra-mobile</p>
            <p className="text-sm text-[#5F5449]">Termos e política disponíveis no site oficial.</p>
            <button onClick={() => setShowAboutModal(false)} className="w-full py-2 border rounded-lg">Fechar</button>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#2A2119] text-[#F6ECDD] px-4 py-2 rounded-full text-sm shadow-2xl z-[1500]">{toast}</div>}

      <style>{`
        .nav-tab {
          flex: 1;
          height: 100%;
          border: none;
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: #887a6a;
          transition: all .2s ease;
          position: relative;
        }
        .nav-tab.active { color: #8d621f; }
        .nav-tab.active::after {
          content: '';
          position: absolute;
          width: 46px;
          height: 3px;
          border-radius: 999px;
          background: #c99022;
          bottom: 2px;
        }
        .tab-label { font-size: 9px; font-weight: 800; letter-spacing: .04em; }
        @media (max-width: 420px) {
          .tab-label { font-size: 10px; }
        }
        .mobile-shell {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .mobile-shell::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
      `}</style>
    </div>
  );
};

export default App;
