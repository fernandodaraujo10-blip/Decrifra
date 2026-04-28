import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart2,
  Bell,
  BookOpen,
  Camera,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  Eye,
  EyeOff,
  Film,
  Globe,
  Headphones,
  Heart,
  House,
  Info,
  Landmark,
  Languages,
  Moon,
  Music,
  Music2,
  PlayCircle,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import { AnalysisMode, ContentType, interpretMovie } from './geminiService';
import { MovieAnalysis } from './types';
import { runUnifiedSearch } from './src/core/search-engine';
import { UnifiedSearchResult } from './src/core/types';
import MusicResultScreen from './src/components/MusicResultScreen';

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
type MoviesResponseStyle = 'resumido' | 'reflexivo' | 'profundo';
type MoviesSearchType = 'movie' | 'series';
type MoviesAnalysisTypeOption =
  | "Final explicado, símbolos e mensagem central"
  | "Personagens e arco narrativo"
  | "Simbolismos e temas ocultos"
  | "Contexto, mensagem e crítica"
  | "Interpretação geral da obra";
type MoviesFocusChipOption = "Personagens" | "Temas" | "Contexto" | "Arco final";
type BooksSearchType = 'book' | 'author';
type BooksAnalysisTypeOption =
  | "Tema central, personagens e simbolismos"
  | "Contexto histórico e mensagem"
  | "Camadas do texto e subtexto"
  | "Personagens e conflitos"
  | "Leitura geral da obra";
type BooksDepthMode = 'quick' | 'deep';
type BooksFocusChipOption = "Resumo" | "Personagens" | "Contexto" | "Citações";

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

const BRAND_LOGO_URL = "/logo.png";
const ASSET_BASE = "/decifra-assets";
const HOME_HERO_BANNER_URL = `${ASSET_BASE}/home-hero.png`;
const HOME_DISCOVERY_FINAL_URL = `${ASSET_BASE}/home-final.png`;
const HOME_DISCOVERY_CAMADAS_URL = `${ASSET_BASE}/home-camadas.png`;
const HOME_DISCOVERY_MENSAGEM_URL = `${ASSET_BASE}/home-mensagem.png`;
const MOVIES_HERO_URL = `${ASSET_BASE}/movies-hero.png`;
const BOOKS_HERO_URL = `${ASSET_BASE}/books-hero.png`;
const MUSIC_HERO_URL = `${ASSET_BASE}/music-hero.png`;
const STORE_HERO_URL = `${ASSET_BASE}/store-hero.png`;
const SETTINGS_HERO_URL = `${ASSET_BASE}/settings-hero.png`;
const MOVIES_SUGGESTION_FINAL_URL = `${ASSET_BASE}/movie-final-card.png`;
const MOVIES_SUGGESTION_SIMBOLOS_URL = `${ASSET_BASE}/movie-simbolismos-card.png`;
const MOVIES_SUGGESTION_ARCO_URL = `${ASSET_BASE}/movie-arco-card.png`;
const BOOKS_CARD_TEMA_URL = `${ASSET_BASE}/book-tema-card.png`;
const BOOKS_CARD_PERSONAGENS_URL = `${ASSET_BASE}/book-personagens-card.png`;
const BOOKS_CARD_CAMADAS_URL = `${ASSET_BASE}/book-camadas-card.png`;
const MUSIC_CARD_MENSAGEM_URL = `${ASSET_BASE}/music-mensagem-card.png`;
const MUSIC_CARD_SENTIMENTO_URL = `${ASSET_BASE}/music-sentimento-card.png`;
const MUSIC_CARD_CONTEXTO_URL = `${ASSET_BASE}/music-contexto-card.png`;
const PREMIUM_AVATAR_URL = `${ASSET_BASE}/premium-avatar.png`;
const APP_VERSION = '1.0.0';
const BOTTOM_NAV_HEIGHT = 66;

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

const QUICK_SUGGESTIONS = {
  movies: {
    movie: ['Matrix', 'Interestelar', 'O Poderoso Chefão'],
    series: ['Dark', 'Breaking Bad', 'Lost'],
  },
  books: {
    book: ['1984', 'Dom Casmurro', 'O Hobbit'],
    author: ['Machado de Assis', 'Tolkien', 'George Orwell'],
  },
  music: {
    track: ['Bohemian Rhapsody', 'Imagine', 'Trem Bala'],
    artist: ['Queen', 'Djavan', 'Adele'],
  },
};

const PLANS: Plan[] = [
  { planId: 'monthly', title: 'Mensal', price: 'R$ 14,90', cycle: '/mês', billingCycle: 'monthly' },
  { planId: 'quarterly', title: 'Trimestral', price: 'R$ 37,90', cycle: '/3 meses', billingCycle: 'quarterly' },
  { planId: 'semiannual', title: 'Semestral', price: 'R$ 59,90', cycle: '/6 meses', billingCycle: 'semiannual' },
  { planId: 'annual', title: 'Anual', price: 'R$ 99,90', cycle: '/ano', billingCycle: 'annual', bestValue: true },
];

const HeaderBlock: React.FC<{ title: string; subtitle: string; image?: string; tall?: boolean }> = ({ title, subtitle, image, tall }) => (
  <section className={`relative rounded-[1.55rem] overflow-hidden border border-amber-500/20 shadow-[0_12px_30px_rgba(0,0,0,0.32)] ${tall ? 'h-[154px]' : 'h-[150px]'}`}>
    {image ? (
      <img src={image} alt={`${title} Decifra`} className="absolute inset-0 w-full h-full object-cover" />
    ) : (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-[#090704] via-[#1a1008] to-[#090704]" />
        <div className="relative z-10 flex items-center gap-4 h-full p-5">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/50 shadow-lg shadow-amber-500/20 bg-black/70">
            <img src={BRAND_LOGO_URL} alt="Logo Decifra" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-[#D5A54A] text-3xl font-bold serif leading-none">DECIFRA</h2>
            <p className="text-white text-[2rem] leading-tight font-semibold serif">{title}</p>
            <p className="text-[#E7E2DA]/85 text-base mt-1 leading-snug">{subtitle}</p>
          </div>
        </div>
      </>
    )}
  </section>
);

const MoviesHeroBanner: React.FC = () => (
  <section className="relative -mx-4 h-[156px] overflow-hidden rounded-b-[1.55rem] shadow-[0_12px_30px_rgba(0,0,0,0.34)]">
    <img src={MOVIES_HERO_URL} alt="Decifra Filmes e Séries" className="absolute inset-0 w-full h-full object-cover" />
  </section>
);

const SegmentedToggle: React.FC<{ options: { id: string; label: string }[]; value: string; onChange: (value: string) => void }> = ({ options, value, onChange }) => (
  <div className="grid gap-1.5 p-1.5 rounded-2xl bg-[#ECE9E4] border border-[#D9D1C6]" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
    {options.map((item) => (
      <button key={item.id} onClick={() => onChange(item.id)} className={`h-9 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center ${value === item.id ? 'bg-white border border-[#CFA14F] text-[#8D621F]' : 'text-[#9C9488]'}`}>
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
      image: MOVIES_SUGGESTION_FINAL_URL,
    },
    {
      id: 'simbolismos',
      title: 'SIMBOLISMOS',
      image: MOVIES_SUGGESTION_SIMBOLOS_URL,
    },
    {
      id: 'arco_personagens',
      title: 'ARCO DOS PERSONAGENS',
      image: MOVIES_SUGGESTION_ARCO_URL,
    },
  ];

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[1.7rem] serif text-[#2E241B] leading-none">Sugestões de hoje</h3>
        <button onClick={onViewAll} className="text-[#9A6B24] text-base serif">Ver todas ›</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelect(card.id)}
            className="relative w-full aspect-[1.12] rounded-2xl overflow-hidden shadow-[0_8px_18px_rgba(25,18,11,0.18)] text-left"
          >
            <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute top-2 right-2 text-white/95">
              <PlayCircle size={18} strokeWidth={1.5} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

const HomeHeroBanner: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => (
  <section className="relative h-full rounded-[1.7rem] overflow-hidden border border-amber-500/20 shadow-[0_16px_40px_rgba(0,0,0,0.45)] min-h-[148px]">
    <img src={HOME_HERO_BANNER_URL} alt="Banner Decifra" className="absolute inset-0 w-full h-full object-cover" />
    <button
      onClick={onOpenSettings}
      className="absolute top-2 right-2 z-10 w-11 h-11 rounded-full bg-transparent"
      aria-label="Abrir configurações"
    />
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
        <BarChart2 size={14} strokeWidth={1.5} />
        ESTATÍSTICAS
      </button>
      <button onClick={onHistory} className="text-[#988978] text-[0.82rem] font-black flex items-center justify-center gap-1.5 py-1.5">
        <Clock3 size={14} strokeWidth={1.5} />
        HISTÓRICO <span className="opacity-80">›</span>
      </button>
    </div>
  </section>
);

const QuickSuggestionsRow: React.FC<{ items: string[]; onSelect: (value: string) => void }> = ({ items, onSelect }) => (
  <div className="flex items-center gap-2 overflow-x-auto px-1 mt-0.5 mb-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    {items.map((item) => (
      <button
        key={item}
        type="button"
        onClick={() => onSelect(item)}
        className="text-[13px] leading-none whitespace-nowrap rounded-full bg-transparent border-0 px-2.5 py-1 font-semibold text-[#0B2545] shadow-[0_0_0_1px_rgba(11,37,69,0.16),0_3px_8px_rgba(11,37,69,0.14)] hover:text-[#081A33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2545]/50 focus-visible:ring-offset-1"
      >
        {item}
      </button>
    ))}
  </div>
);

const SearchInput: React.FC<{
  value: string;
  placeholder: string;
  loading: boolean;
  showSuggestions: boolean;
  suggestions: SearchSuggestionItem[];
  showCameraButton?: boolean;
  examples?: string[];
  onChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSubmit: () => void;
  onSelectSuggestion: (value: string) => void;
}> = ({ value, placeholder, loading, showSuggestions, suggestions, showCameraButton = false, examples, onChange, onFocus, onBlur, onSubmit, onSelectSuggestion }) => {
  const uploadInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const previewUrlRef = React.useRef<string | null>(null);
  const revokePreviewUrl = React.useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      revokePreviewUrl();
      const url = URL.createObjectURL(e.target.files[0]);
      previewUrlRef.current = url;
      setImagePreview(url);
    }
  };

  const handleClearImage = () => {
    revokePreviewUrl();
    setImagePreview(null);
    if (uploadInputRef.current) uploadInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  React.useEffect(() => () => {
    revokePreviewUrl();
  }, [revokePreviewUrl]);

  return (
  <div className="relative">
    {examples && examples.length > 0 && (
      <div className="flex gap-4 mb-2 overflow-x-auto pb-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {examples.map(ex => (
          <button
            key={ex}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { onChange(ex); setTimeout(() => onSubmit(), 50); }}
            className="text-[13px] font-bold text-[#1e3a8a] whitespace-nowrap hover:opacity-70 transition-opacity"
          >
            {ex}
          </button>
        ))}
      </div>
    )}
    <div className="relative flex items-center w-full">
      <Search size={16} strokeWidth={1.7} className="absolute left-3 text-[#A59684] pointer-events-none" />
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
        className="w-full pl-9 pr-28 h-10 rounded-xl bg-white border border-[#DED7CB] text-[#3E3228] placeholder:text-[#A89D8E] outline-none text-sm"
      />
      <div className="absolute right-2 flex items-center gap-1.5">
        {value && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange('')}
            className="w-6 h-6 rounded-full text-[#A89D8E] text-sm font-bold hover:bg-[#F2EEE8] transition-colors"
            aria-label="Limpar campo"
          >
            ×
          </button>
        )}
        {showCameraButton && (
          <div className="flex items-center gap-1 ml-1 pr-1">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => cameraInputRef.current?.click()}
              className="w-7 h-7 rounded-lg border border-[#D8CFBF] text-[#8D621F] flex items-center justify-center bg-[#FBF8F3]"
              aria-label="Capturar imagem"
            >
              <Camera size={14} strokeWidth={1.8} />
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => uploadInputRef.current?.click()}
              className="w-7 h-7 rounded-lg border border-[#D8CFBF] text-[#8D621F] flex items-center justify-center bg-[#FBF8F3]"
              aria-label="Upload imagem"
            >
              <Plus size={16} strokeWidth={2} />
            </button>
          </div>
        )}
        {loading && <div className="w-4 h-4 border-2 border-[#CFA14F] border-t-transparent rounded-full animate-spin" />}
      </div>
    </div>
    {showSuggestions && suggestions.length > 0 && (
      <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-[#DED7CB] bg-white shadow-2xl overflow-hidden z-20">
        {suggestions.map((item) => (
          <button key={item.id} onMouseDown={(e) => e.preventDefault()} onClick={() => onSelectSuggestion(item.title)} className="w-full flex items-center gap-3 p-3 border-b border-[#F0EAE0] last:border-b-0 text-left hover:bg-[#FAF7F2] transition-colors">
            {item.poster ? (
              <img src={item.poster} alt={item.title} className="w-10 h-14 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-14 rounded-lg bg-[#EFE7DB] flex items-center justify-center text-[#7C6F61]">
                {item.kind === 'history' ? <Clock3 size={14} strokeWidth={1.5} /> : <Music2 size={14} strokeWidth={1.5} />}
              </div>
            )}
            <div>
              <p className="text-[#332A22] text-sm font-semibold leading-tight">{item.title}</p>
            </div>
          </button>
        ))}
      </div>
    )}

    <input type="file" accept="image/*" ref={uploadInputRef} onChange={handleFileChange} className="hidden" />
    <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />

    {imagePreview && (
      <div className="flex items-center gap-3 p-2 mt-2 bg-white border border-[#DED7CB] rounded-2xl shadow-sm">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col flex-grow overflow-hidden">
          <span className="text-xs font-bold text-[#3E3228] truncate">Imagem anexada</span>
        </div>
        <button onClick={handleClearImage} className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0 mr-1">✕</button>
      </div>
    )}
  </div>
  );
};

const DropdownField: React.FC<{ label: string; value: string; isOpen: boolean; onToggle: () => void; options: string[]; onSelect: (value: string) => void }> = ({ label, value, isOpen, onToggle, options, onSelect }) => (
  <div className="relative">
    <label className="block text-[#3A2E24] text-sm font-semibold mb-1.5 leading-none">{label}</label>
    <button onClick={onToggle} className="w-full bg-white border border-[#D8D0C4] rounded-xl px-4 py-2.5 text-left text-[#3D3026] text-sm font-medium flex items-center justify-between">
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
  <div className="flex flex-wrap gap-2">
    {chips.map((chip) => (
      <button key={chip} onClick={() => onChange(value === chip ? null : chip)} className={`px-3 py-1.5 rounded-full border text-sm serif transition-all ${value === chip ? 'bg-[#F3E4CA] border-[#CFA14F] text-[#8D621F]' : 'bg-[#F4F0EA] border-[#D7D0C6] text-[#60554A]'}`}>{chip}</button>
    ))}
  </div>
);

const InterpretButton: React.FC<{ disabled: boolean; loading: boolean; onClick: () => void; label?: string }> = ({ disabled, loading, onClick, label = "INTERPRETAR AGORA" }) => (
  <button disabled={disabled} onClick={onClick} className="w-full h-11 rounded-2xl bg-gradient-to-r from-[#C99022] via-[#DCA63A] to-[#B87A17] text-white text-sm font-semibold tracking-wide shadow-[0_10px_22px_rgba(179,123,22,0.32)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
    {loading ? "DECIFRANDO..." : <><Sparkles size={16} strokeWidth={2} />{label}</>}
  </button>
);

const DecipheringOverlay: React.FC<{ progress: number; message: string; theme: ThemeMode }> = ({ progress, message, theme }) => (
  <div className="absolute inset-0 z-[2000] flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
    <div className={`w-full max-w-[300px] p-6 rounded-[2rem] ${theme === 'dark' ? 'bg-[#2a241e]' : 'bg-[#f8f5f0]'} border border-amber-500/30 shadow-2xl flex flex-col items-center gap-6 text-center`}>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className={theme === 'dark' ? 'text-zinc-800' : 'text-zinc-200'}
          />
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="#D5A54A"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-black serif text-[#D5A54A]">{progress}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl serif font-bold text-[#D5A54A] animate-pulse">DECIFRANDO</h3>
        <p className={`text-sm font-medium h-10 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>{message}</p>
      </div>

      <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#C99022] to-[#DCA63A] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  </div>
);

const CardsSection: React.FC<{ title: string; cards: { id: string; title: string; subtitle: string; image?: string; hideOverlay?: boolean }[]; onSelect: (id: string) => void }> = ({ title, cards, onSelect }) => (
  <section className="space-y-2">
    <h3 className="text-[1.7rem] sm:text-3xl serif text-[#2E241B] leading-none">{title}</h3>
    <div className="grid grid-cols-3 gap-2.5">
      {cards.map((card) => (
        <button key={card.id} onClick={() => onSelect(card.id)} className="relative text-left rounded-2xl overflow-hidden bg-gradient-to-b from-[#3A2818] to-black border border-[#6A4A24]/60 shadow-xl min-h-[96px] aspect-[1.08] flex flex-col justify-end hover:-translate-y-0.5 transition-transform">
          {card.image && <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />}
          {!card.hideOverlay && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 pt-12">
              <p className="text-white text-[0.66rem] sm:text-xl leading-tight serif font-black text-center">{card.title}</p>
              {card.subtitle && <p className="text-[#E3D7C7] text-[0.55rem] sm:text-sm mt-1 leading-tight text-center">{card.subtitle}</p>}
            </div>
          )}
        </button>
      ))}
    </div>
  </section>
);

const StoreHeader = () => <HeaderBlock title="Loja" subtitle="Escolha o plano ideal para explorar mais" image={STORE_HERO_URL} tall />;
const SettingsHeader = () => <HeaderBlock title="Configurações" subtitle="Ajuste sua experiência de leitura e descoberta" image={SETTINGS_HERO_URL} tall />;

const PlanCard: React.FC<{ plan: Plan; selected: boolean; onSelect: () => void }> = ({ plan, selected, onSelect }) => (
  <div className={`rounded-2xl border px-2 py-2.5 bg-[#FFFCF7] shadow-[0_8px_18px_rgba(54,39,22,0.1)] relative ${selected || plan.bestValue ? 'border-amber-600 ring-1 ring-amber-400/45' : 'border-[#DED7CB]'}`}>
    {plan.bestValue && <div className="absolute -top-3 right-1 bg-amber-600 text-white text-[8px] px-2 py-1 rounded-full font-black">MELHOR VALOR</div>}
    <h4 className="text-[1.05rem] serif text-[#2A2119] text-center leading-none">{plan.title}</h4>
    <div className="mx-auto my-2 w-8 h-8 rounded-full bg-[#F2EBDD] flex items-center justify-center text-[#9B671A]">
      <Clock3 size={15} strokeWidth={1.7} />
    </div>
    <p className="text-center text-[1.06rem] serif mt-1 text-[#2A2119] leading-none">{plan.price}</p>
    <p className="text-center text-xs text-[#5C4E41]">{plan.cycle}</p>
    <div className="h-px bg-[#E8E0D3] my-2" />
    <ul className="space-y-1 text-[9px] text-[#463b31] leading-tight">
      <li>✓ Análises ilimitadas</li>
      <li>✓ Favoritos e histórico</li>
      <li>✓ Mais profundidade</li>
      <li>✓ Acesso premium</li>
    </ul>
    <button onClick={onSelect} className={`mt-3 w-full py-1.5 rounded-lg border font-black text-[9px] ${selected ? 'bg-gradient-to-b from-[#E6A82E] to-[#C47B00] text-white border-amber-600' : 'bg-white text-[#8D621F] border-amber-600'}`}>ESCOLHER</button>
  </div>
);

const PlansGrid: React.FC<{ selectedPlan: PlanId | null; onSelect: (planId: PlanId) => void }> = ({ selectedPlan, onSelect }) => (
  <section className="space-y-2">
    <h3 className="text-[1.55rem] serif text-[#2E241B] flex items-center gap-2"><Landmark size={18} className="text-[#9B671A]" />Planos disponíveis</h3>
    <div className="grid grid-cols-4 gap-2">
      {PLANS.map((plan) => <PlanCard key={plan.planId} plan={plan} selected={selectedPlan === plan.planId} onSelect={() => onSelect(plan.planId)} />)}
    </div>
  </section>
);

const BenefitsSection = () => (
  <section className="space-y-2">
    <h3 className="text-[1.35rem] serif text-[#2E241B]">Com qualquer plano, você tem:</h3>
    <div className="rounded-3xl bg-white border border-[#DED7CB] grid grid-cols-4 overflow-hidden">
      {[
        { icon: BarChart2, title: 'Análises ilimitadas', text: 'Interpretações sem limites.' },
        { icon: RotateCcw, title: 'Histórico completo', text: 'Acompanhe suas descobertas.' },
        { icon: Heart, title: 'Favoritos', text: 'Salve o que é importante.' },
        { icon: TrendingUp, title: 'Experiência premium', text: 'Recursos exclusivos e atualizações.' },
      ].map(({ icon: Icon, title, text }) => (
        <div key={title} className="p-2 border-r last:border-r-0 border-[#E8E0D3] text-center">
          <div className="mb-2 flex justify-center text-[#8A7763]">
            <span className="w-9 h-9 rounded-full bg-[#F2EBDD] flex items-center justify-center"><Icon size={17} strokeWidth={1.5} /></span>
          </div>
          <p className="text-[0.74rem] serif text-[#2A2119] leading-tight">{title}</p>
          <p className="text-[0.58rem] text-[#6E6256] leading-tight mt-1">{text}</p>
        </div>
      ))}
    </div>
  </section>
);

const SubscribeButton: React.FC<{ loading: boolean; onClick: () => void }> = ({ loading, onClick }) => (
  <button onClick={onClick} disabled={loading} className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#C99022] to-[#B87A17] text-white font-black text-xs disabled:opacity-50 whitespace-nowrap">
    {loading ? 'PROCESSANDO...' : 'ASSINAR AGORA'}
  </button>
);

const SecurityFlexCard: React.FC<{ processing: boolean; onSubscribe: () => void }> = ({ processing, onSubscribe }) => (
  <section className="rounded-3xl bg-[#F7F1E6] border border-[#DED7CB] p-3 flex items-center justify-between gap-3">
    <Shield size={38} strokeWidth={1.4} className="text-[#9B671A] flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[1.2rem] serif text-[#2A2119] leading-none">Segurança e flexibilidade</p>
      <p className="text-[#5F5449] text-xs leading-tight mt-1">Cancele quando quiser. Sem taxas ocultas.</p>
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
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onClick?: () => void;
}> = ({ icon, title, subtitle, right, onClick }) => (
  <button onClick={onClick} className="w-full text-left flex items-center justify-between gap-3 py-2.5 border-b border-[#E8E0D3] last:border-b-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-[#EFE7DB] flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-[1.28rem] sm:text-2xl serif text-[#2A2119] leading-none">{title}</p>
        <p className="text-[#6A5E52] text-xs">{subtitle}</p>
      </div>
    </div>
    {right ?? <ChevronRight size={18} strokeWidth={1.5} className="text-[#9D8D7A]" />}
  </button>
);

const PremiumAccountCard: React.FC<{ userPlan: UserPlan; onClick: () => void }> = ({ userPlan, onClick }) => (
  <button onClick={onClick} className="w-[calc(100%-16px)] mx-auto -mt-12 relative z-10 rounded-3xl bg-[#FFF9EF] border border-[#DED7CB] p-3 flex items-center justify-between shadow-[0_12px_28px_rgba(50,33,18,0.12)]">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-500/40">
        <img src={PREMIUM_AVATAR_URL} alt="Conta" className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-[1.45rem] serif text-[#2A2119] leading-none">{userPlan === 'free' ? 'Conta Free' : 'Conta Premium'}</p>
        <p className="text-[#6A5E52] text-sm">Gerencie sua conta e preferências</p>
      </div>
    </div>
    <span className="text-2xl text-[#9D8D7A]">›</span>
  </button>
);

const SupportCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="w-full rounded-3xl bg-white border border-[#DED7CB] p-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#EFE7DB] flex items-center justify-center text-[#8A7763]">
        <Headphones size={16} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[1.3rem] sm:text-2xl serif text-[#2A2119] leading-none">Fale com o suporte</p>
        <p className="text-[#6A5E52] text-xs">Estamos aqui para ajudar você</p>
      </div>
    </div>
    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Online</span>
  </button>
);

const BottomNav: React.FC<{ activeTab: AppTab; onChange: (tab: AppTab) => void }> = ({ activeTab, onChange }) => {
  const items: { id: AppTab; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }[] = [
    { id: 'home', label: 'HOME', icon: House },
    { id: 'movies_series', label: 'FILMES E SÉRIES', icon: Film },
    { id: 'books', label: 'LIVROS', icon: BookOpen },
    { id: 'music', label: 'MÚSICAS', icon: Music },
    { id: 'store', label: 'LOJA', icon: ShoppingBag },
    { id: 'settings', label: 'CONFIG.', icon: Settings },
  ];
  return (
    <nav className="absolute bottom-0 left-0 z-[1000] border-t bg-[#F2ECE2] border-[#DDD4C7] flex justify-around items-center rounded-t-[1.2rem] w-full" style={{ height: `${BOTTOM_NAV_HEIGHT}px`, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button key={item.id} onClick={() => onChange(item.id)} className={`nav-tab ${activeTab === item.id ? 'active' : ''}`}>
            <div className="tab-icon-wrapper">
              <Icon size={19} strokeWidth={1.6} />
            </div>
          <span className="tab-label">{item.label}</span>
        </button>
        );
      })}
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
  const [moviesResponseStyle] = useState<MoviesResponseStyle>('profundo');
  const [moviesFocusChip, setMoviesFocusChip] = useState<MoviesFocusChipOption | null>(null);
  const [moviesSpoilerMode, setMoviesSpoilerMode] = useState(false);
  const [moviesShowDropdown, setMoviesShowDropdown] = useState(false);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [moviesResult, setMoviesResult] = useState<MovieAnalysis | null>(null);
  const [moviesError, setMoviesError] = useState<string | null>(null);
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
  const musicSearchRequestId = useRef(0);
  const moviesSearchRequestId = useRef(0);
  const booksSearchRequestId = useRef(0);

  // Novos estados para barra de progresso
  const [decipherProgress, setDecipherProgress] = useState(0);
  const [decipherMessage, setDecipherMessage] = useState('');
  const progressTimerRef = useRef<number | null>(null);

  const startProgressAnimation = (category: string) => {
    setDecipherProgress(0);
    const messages = {
      movies: ["Iniciando decifração do filme...", "Consultando fontes cinematográficas...", "Analisando arco dos personagens...", "Decifrando simbolismos ocultos...", "Preparando sua análise profunda..."],
      books: ["Abrindo os portais da literatura...", "Consultando registros históricos...", "Analisando subtexto e camadas...", "Interpretando a visão do autor...", "Finalizando sua decifração..."],
      music: ["Sintonizando na frequência da obra...", "Analisando a lírica e melodia...", "Interpretando emoções centrais...", "Buscando referências musicais...", "Quase pronto..."]
    }[category as 'movies' | 'books' | 'music'] || ["Iniciando...", "Analisando...", "Interpretando...", "Finalizando..."];

    setDecipherMessage(messages[0]);
    let currentProgress = 0;
    let messageIndex = 0;

    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);

    progressTimerRef.current = window.setInterval(() => {
      // Se já passou de 90%, desacelera drasticamente o progresso
      const increment = currentProgress < 90 
        ? (Math.random() * 3 + 1) 
        : (Math.random() * 0.1 + 0.02); // Incremento minúsculo após 90%
      
      currentProgress += increment;
      
      // Limite suave em 99% para nunca parecer "travado" mas indicar que está no fim
      if (currentProgress >= 99.5) {
        currentProgress = 99.5;
      }
      
      setDecipherProgress(Math.floor(currentProgress));

      // Mudar mensagem a cada ~20%
      const newMessageIndex = Math.min(
        Math.floor((currentProgress / 100) * messages.length),
        messages.length - 1
      );
      if (newMessageIndex !== messageIndex && messages[newMessageIndex]) {
        messageIndex = newMessageIndex;
        setDecipherMessage(messages[messageIndex]);
      }
    }, 200);
  };

  const completeProgress = () => {
    if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
    setDecipherProgress(100);
    setDecipherMessage("Decifração concluída!");
    setTimeout(() => {
      setDecipherProgress(0);
    }, 500);
  };

  const normalize = (v: string) => v.replace(/\s+/g, ' ').trim();
  const buildLocalAutocomplete = (queryText: string, pool: string[], idPrefix: string): UnifiedSearchResult[] => {
    const cleaned = normalize(queryText).toLowerCase();
    if (cleaned.length < 2) return [];
    const deduped = Array.from(new Set(pool.map((item) => normalize(item)).filter(Boolean)));
    return deduped
      .filter((item) => item.toLowerCase().includes(cleaned))
      .slice(0, 6)
      .map((title, index) => ({
        id: `${idPrefix}-${index}-${title.toLowerCase()}`,
        source: 'omdb',
        title,
        year: '',
        type: 'movie',
        poster: null,
      }));
  };
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
      const requestId = ++musicSearchRequestId.current;
      const n = normalize(query);
      if (n.length < 2) {
        if (requestId !== musicSearchRequestId.current) return;
        setSearchResults([]);
        setShowResults(false);
        setSearchLoading(false);
        return;
      }
      setSearchLoading(true);
      try {
        const pool = musicSearchType === 'track'
          ? [...QUICK_SUGGESTIONS.music.track, ...recentTracks]
          : [...QUICK_SUGGESTIONS.music.artist, ...recentArtists];
        const rs = buildLocalAutocomplete(n, pool, `music-${musicSearchType}`);
        if (requestId !== musicSearchRequestId.current) return;
        setSearchResults(rs);
        setShowResults(rs.length > 0);
      } catch {
        if (requestId !== musicSearchRequestId.current) return;
        setSearchResults([]);
        setShowResults(false);
      } finally {
        if (requestId !== musicSearchRequestId.current) return;
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, musicSearchType, recentTracks, recentArtists]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const requestId = ++moviesSearchRequestId.current;
      const n = normalize(moviesQuery);
      if (n.length < 2) {
        if (requestId !== moviesSearchRequestId.current) return;
        setMoviesSearchResults([]);
        setMoviesShowResults(false);
        setMoviesSearchLoading(false);
        return;
      }
      setMoviesSearchLoading(true);
      try {
        const rs = await runUnifiedSearch(n);
        if (requestId !== moviesSearchRequestId.current) return;
        setMoviesSearchResults(rs);
        setMoviesShowResults(rs.length > 0);
      } catch {
        if (requestId !== moviesSearchRequestId.current) return;
        setMoviesSearchResults([]);
        setMoviesShowResults(false);
      } finally {
        if (requestId !== moviesSearchRequestId.current) return;
        setMoviesSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [moviesQuery]);

  useEffect(() => {
    const t = setTimeout(async () => {
      const requestId = ++booksSearchRequestId.current;
      const n = normalize(booksQuery);
      if (n.length < 2) {
        if (requestId !== booksSearchRequestId.current) return;
        setBooksSearchResults([]);
        setBooksShowResults(false);
        setBooksSearchLoading(false);
        return;
      }
      setBooksSearchLoading(true);
      try {
        const pool = booksSearchType === 'book'
          ? [...QUICK_SUGGESTIONS.books.book, ...recentBooks]
          : [...QUICK_SUGGESTIONS.books.author, ...recentAuthors];
        const rs = buildLocalAutocomplete(n, pool, `books-${booksSearchType}`);
        if (requestId !== booksSearchRequestId.current) return;
        setBooksSearchResults(rs);
        setBooksShowResults(rs.length > 0);
      } catch {
        if (requestId !== booksSearchRequestId.current) return;
        setBooksSearchResults([]);
        setBooksShowResults(false);
      } finally {
        if (requestId !== booksSearchRequestId.current) return;
        setBooksSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [booksQuery, booksSearchType, recentBooks, recentAuthors]);

  const suggestions = useMemo<SearchSuggestionItem[]>(() => {
    const n = normalize(query);
    if (showHistory && n.length === 0) {
      const hist = musicSearchType === 'track' ? recentTracks : recentArtists;
      return hist.map((v, i) => ({ id: `h-${i}-${v}`, title: v, subtitle: musicSearchType === 'track' ? 'Música recente' : 'Artista recente', kind: 'history' }));
    }
    return searchResults.map((r) => ({ id: r.id, title: r.title, subtitle: r.year ? `${r.year} • ${musicSearchType === 'track' ? 'Faixa' : 'Artista'}` : musicSearchType === 'track' ? 'Faixa sugerida' : 'Artista sugerido', poster: r.poster, kind: 'search' }));
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
    return booksSearchResults.map((r) => ({ id: r.id, title: r.title, subtitle: r.year ? `${r.year} • referência` : booksSearchType === 'book' ? 'Livro sugerido' : 'Autor sugerido', poster: r.poster, kind: 'search' }));
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
    setMusicLoading(true);
    setMusicError(null);
    startProgressAnimation('music');
    try {
      const mode: AnalysisMode = musicMainFocus === 'emotion' ? 'reflexivo' : musicAnalysisType === "Interpretação geral" ? 'direto' : 'profundo';
      const result = await interpretMovie(cleaned, mode, 'musica', { ...payload, focusChip: payload.chipFocus });
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
      completeProgress();
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
      responseStyle: moviesResponseStyle,
      analysisType: moviesAnalysisType,
      focusChip: moviesFocusChip ?? undefined,
      userPlan,
      userId,
    };
    setMoviesLoading(true);
    setMoviesError(null);
    startProgressAnimation('movies');
    try {
      const modeByStyle: Record<MoviesResponseStyle, AnalysisMode> = {
        resumido: 'direto',
        reflexivo: 'reflexivo',
        profundo: 'profundo',
      };
      const mode: AnalysisMode = modeByStyle[moviesResponseStyle];
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
      completeProgress();
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
    setBooksLoading(true);
    setBooksError(null);
    startProgressAnimation('books');
    try {
      const mode: AnalysisMode = booksDepthMode === 'quick' ? 'direto' : booksAnalysisType === 'Contexto histórico e mensagem' ? 'reflexivo' : 'profundo';
      const result = await interpretMovie(cleaned, mode, 'livro', payload);
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
      completeProgress();
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
    <div className={musicResult ? "h-full" : "h-full flex flex-col gap-2"}>
      {!musicResult && <HeaderBlock title="Músicas" subtitle="Interprete letras, emoções e significados" image={MUSIC_HERO_URL} tall />}
      {!musicResult && (
        <section className="rounded-[1.6rem] bg-[#F2EEE8] border border-[#DED7CB] shadow-[0_12px_26px_rgba(0,0,0,0.12)] p-3 space-y-2.5">
          <SegmentedToggle value={musicSearchType} onChange={(v) => setMusicSearchType(v as MusicSearchType)} options={[{ id: 'track', label: 'MÚSICA' }, { id: 'artist', label: 'ARTISTA' }]} />
          <QuickSuggestionsRow
            items={QUICK_SUGGESTIONS.music[musicSearchType]}
            onSelect={(value) => {
              setQuery(value);
              setShowHistory(false);
              setShowResults(false);
            }}
          />
          <SearchInput
            value={query}
            placeholder={musicSearchType === 'track' ? "Ex.: Bohemian Rhapsody, Trem Bala..." : "Ex.: Queen, Djavan, Adele..."}
            loading={searchLoading}
            showCameraButton
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
            <label className="block text-[#3A2E24] text-lg serif mb-1.5">Foco</label>
            <SegmentedToggle value={musicMainFocus} onChange={(v) => setMusicMainFocus(v as MusicMainFocus)} options={[{ id: 'lyrics', label: 'LETRA' }, { id: 'context', label: 'CONTEXTO' }, { id: 'emotion', label: 'EMOÇÃO' }]} />
          </div>
          <ChipsRow chips={["Simbologia", "Refrão", "Sentimento", "Referências"]} value={musicChipFocus} onChange={(v) => setMusicChipFocus(v as MusicFocusChipOption | null)} />
          <InterpretButton disabled={musicLoading || normalize(query).length === 0} loading={musicLoading} onClick={runMusicAnalysis} />
          {musicError && <p className="text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-3 text-sm">{musicError}</p>}
        </section>
      )}
      {musicResult && (
        <MusicResultScreen
          result={musicResult}
          title={musicSearchType === 'track' ? musicResult.info.originalTitle : query}
          onNewSearch={() => setMusicResult(null)}
          bannerImage={MUSIC_HERO_URL}
          artistImage={PREMIUM_AVATAR_URL}
        />
      )}
      {!musicResult && <CardsSection title="Destaques de hoje" onSelect={(id) => {
        if (id === 'mensagem') setMusicAnalysisType('Significado da letra e mensagem central');
        if (id === 'sentimento') setMusicAnalysisType('Emoção principal e sentimento');
        if (id === 'contexto') setMusicAnalysisType('Contexto da canção');
        setToast('Destaque aplicado à sua próxima análise.');
      }} cards={[
        { id: 'mensagem', title: 'MENSAGEM DA LETRA', subtitle: '', image: MUSIC_CARD_MENSAGEM_URL, hideOverlay: true },
        { id: 'sentimento', title: 'SENTIMENTO CENTRAL', subtitle: '', image: MUSIC_CARD_SENTIMENTO_URL, hideOverlay: true },
        { id: 'contexto', title: 'CONTEXTO DA CANÇÃO', subtitle: '', image: MUSIC_CARD_CONTEXTO_URL, hideOverlay: true },
      ]} />}
    </div>
  );

  const renderMovies = () => (
    <div className={moviesResult ? "h-full" : "h-full flex flex-col gap-2"}>
      {!moviesResult && <MoviesHeroBanner />}
      {!moviesResult && (
        <section className="rounded-[1.6rem] bg-[#F6F3EE] border border-[#DED7CB] shadow-[0_12px_26px_rgba(0,0,0,0.1)] px-3 py-3 space-y-2.5">
          <SegmentedToggle
            value={moviesSearchType}
            onChange={(v) => setMoviesSearchType(v as MoviesSearchType)}
            options={[
              { id: 'movie', label: 'FILME' },
              { id: 'series', label: 'SÉRIE' }
            ]}
          />
          <QuickSuggestionsRow
            items={QUICK_SUGGESTIONS.movies[moviesSearchType]}
            onSelect={(value) => {
              setMoviesQuery(value);
              setMoviesShowHistory(false);
              setMoviesShowResults(false);
            }}
          />
          <SearchInput
            value={moviesQuery}
            placeholder={moviesSearchType === 'movie' ? "Ex.: Matrix, Interestelar, O Poderoso Chefão..." : "Ex.: Dark, Breaking Bad, Lost..."}
            loading={moviesSearchLoading}
            showCameraButton
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
            <label className="block text-[#3A2E24] text-sm font-semibold">Modo spoiler</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMoviesSpoilerMode(false)}
                className={`h-9 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${!moviesSpoilerMode ? 'bg-[#F3E4CA] border-[#CFA14F] text-[#8D621F]' : 'bg-white border-[#DED7CB] text-[#8F8478]'}`}
              >
                <Eye size={16} strokeWidth={1.6} />
                SEM SPOILER
              </button>
              <button
                onClick={() => setMoviesSpoilerMode(true)}
                className={`h-9 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${moviesSpoilerMode ? 'bg-[#F3E4CA] border-[#CFA14F] text-[#8D621F]' : 'bg-white border-[#DED7CB] text-[#8F8478]'}`}
              >
                <EyeOff size={16} strokeWidth={1.6} />
                COM SPOILER
              </button>
            </div>
          </div>
          <DropdownField label="Tipo de análise" value={moviesAnalysisType} isOpen={moviesShowDropdown} onToggle={() => setMoviesShowDropdown((v) => !v)} options={MOVIES_ANALYSIS_TYPES} onSelect={(v) => { setMoviesAnalysisType(v as MoviesAnalysisTypeOption); setMoviesShowDropdown(false); }} />
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'Personagens', label: 'Personagens', icon: Users },
              { id: 'Temas', label: 'Temas', icon: Compass },
              { id: 'Contexto', label: 'Contexto', icon: Globe },
              { id: 'Arco final', label: 'Arco final', icon: TrendingUp },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMoviesFocusChip(moviesFocusChip === id ? null : id as MoviesFocusChipOption)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 ${moviesFocusChip === id ? 'bg-[#F3E4CA] border-[#CFA14F] text-[#8D621F]' : 'bg-[#F4F0EA] border-[#D7D0C6] text-[#60554A]'}`}
              >
                <Icon size={14} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </div>
          <InterpretButton disabled={moviesLoading || normalize(moviesQuery).length === 0} loading={moviesLoading} onClick={runMoviesAnalysis} />
          {moviesError && <p className="text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-3 text-sm">{moviesError}</p>}
        </section>
      )}
      {moviesResult && (
        <MusicResultScreen
          result={moviesResult}
          title={moviesResult.info.originalTitle}
          onNewSearch={() => setMoviesResult(null)}
          bannerImage={MOVIES_HERO_URL}
          artistImage={PREMIUM_AVATAR_URL}
        />
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
    <div className={booksResult ? "h-full" : "h-full flex flex-col gap-2"}>
      {!booksResult && <HeaderBlock title="Livros" subtitle="Descubra temas, símbolos e camadas da leitura" image={BOOKS_HERO_URL} tall />}
      {!booksResult && (
        <section className="rounded-[1.6rem] bg-[#F2EEE8] border border-[#DED7CB] shadow-[0_12px_26px_rgba(0,0,0,0.12)] p-3 space-y-2.5">
          <SegmentedToggle value={booksSearchType} onChange={(v) => setBooksSearchType(v as BooksSearchType)} options={[{ id: 'book', label: 'LIVRO' }, { id: 'author', label: 'AUTOR' }]} />
          <QuickSuggestionsRow
            items={QUICK_SUGGESTIONS.books[booksSearchType]}
            onSelect={(value) => {
              setBooksQuery(value);
              setBooksShowHistory(false);
              setBooksShowResults(false);
            }}
          />
          <SearchInput
            value={booksQuery}
            placeholder={booksSearchType === 'book' ? "Ex.: 1984, Dom Casmurro, O Hobbit..." : "Ex.: Machado de Assis, Tolkien, C. S. Lewis..."}
            loading={booksSearchLoading}
            showCameraButton
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
            <label className="block text-[#3A2E24] text-lg serif mb-1.5">Profundidade</label>
            <SegmentedToggle value={booksDepthMode} onChange={(v) => setBooksDepthMode(v as BooksDepthMode)} options={[{ id: 'quick', label: 'RÁPIDA' }, { id: 'deep', label: 'PROFUNDA' }]} />
          </div>
          <ChipsRow chips={["Resumo", "Personagens", "Contexto", "Citações"]} value={booksFocusChip} onChange={(v) => setBooksFocusChip(v as BooksFocusChipOption | null)} />
          <InterpretButton disabled={booksLoading || normalize(booksQuery).length === 0} loading={booksLoading} onClick={runBooksAnalysis} />
          {booksError && <p className="text-red-700 bg-red-100 border border-red-200 rounded-xl px-4 py-3 text-sm">{booksError}</p>}
        </section>
      )}
      {booksResult && (
        <MusicResultScreen
          result={booksResult}
          title={booksSearchType === 'book' ? booksResult.info.originalTitle : booksQuery}
          onNewSearch={() => setBooksResult(null)}
          bannerImage={BOOKS_HERO_URL}
          artistImage={PREMIUM_AVATAR_URL}
        />
      )}
      {!booksResult && <CardsSection title="Explorar hoje" onSelect={(id) => {
        if (id === 'tema') setBooksAnalysisType('Tema central, personagens e simbolismos');
        if (id === 'personagens') setBooksFocusChip('Personagens');
        if (id === 'camadas') setBooksAnalysisType('Camadas do texto e subtexto');
        setToast('Exploração aplicada à sua próxima leitura.');
      }} cards={[
        { id: 'tema', title: 'TEMA CENTRAL', subtitle: '', image: BOOKS_CARD_TEMA_URL, hideOverlay: true },
        { id: 'personagens', title: 'PERSONAGENS', subtitle: '', image: BOOKS_CARD_PERSONAGENS_URL, hideOverlay: true },
        { id: 'camadas', title: 'CAMADAS DO TEXTO', subtitle: '', image: BOOKS_CARD_CAMADAS_URL, hideOverlay: true },
      ]} />}
    </div>
  );

  const renderStore = () => (
    <div className="h-full flex flex-col gap-2">
      <StoreHeader />
      <PlansGrid selectedPlan={selectedPlan} onSelect={(planId) => { setSelectedPlan(planId); setPurchaseState('selectingPlan'); }} />
      <BenefitsSection />
      <SecurityFlexCard processing={purchaseState === 'processingPayment'} onSubscribe={handleSubscribe} />
      <p className="text-center text-sm text-[#736554]">Pagamento 100% seguro. Seus dados estão protegidos.</p>
      {purchaseState === 'success' && <p className="rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 p-3">Assinatura premium confirmada. Bem-vindo ao Decifra Premium.</p>}
      {purchaseState === 'error' && <div className="rounded-xl bg-red-100 border border-red-300 text-red-800 p-3 space-y-2"><p>{purchaseError}</p><button onClick={handleSubscribe} className="text-sm underline">Tentar novamente</button></div>}
    </div>
  );

  const renderSettings = () => (
    <div className="h-full flex flex-col gap-2">
      <SettingsHeader />
      <PremiumAccountCard userPlan={userPlan} onClick={() => setShowAccountModal(true)} />
      <section className="space-y-2">
        <h3 className="text-[1.7rem] serif text-[#2E241B] leading-none">Preferências</h3>
        <div className="rounded-3xl bg-white border border-[#DED7CB] px-4">
          <SettingsRow icon={<User size={16} strokeWidth={1.5} className="text-[#8A7763]" />} title="Conta" subtitle="Gerencie seus dados e assinatura" onClick={() => setShowAccountModal(true)} />
          <SettingsRow icon={<Bell size={16} strokeWidth={1.5} className="text-[#8A7763]" />} title="Notificações" subtitle="Receba alertas e novidades" right={<ToggleSwitch checked={notificationsEnabled} onChange={setNotificationsEnabled} />} />
          <SettingsRow icon={<Moon size={16} strokeWidth={1.5} className="text-[#8A7763]" />} title="Tema" subtitle="Escolha entre claro ou escuro" right={<ToggleSwitch checked={themeMode === 'dark'} onChange={(v) => setThemeMode(v ? 'dark' : 'light')} />} />
          <SettingsRow icon={<Languages size={16} strokeWidth={1.5} className="text-[#8A7763]" />} title="Idioma" subtitle={language} onClick={() => setLanguage('Português (Brasil)')} />
          <SettingsRow icon={<Shield size={16} strokeWidth={1.5} className="text-[#8A7763]" />} title="Privacidade" subtitle="Gerencie sua privacidade e dados" onClick={() => setShowPrivacyModal(true)} />
          <SettingsRow icon={<RotateCcw size={16} strokeWidth={1.5} className="text-[#8A7763]" />} title="Restaurar compras" subtitle="Recupere suas compras anteriores" onClick={handleRestorePurchases} />
          <SettingsRow icon={<CircleHelp size={16} strokeWidth={1.5} className="text-[#8A7763]" />} title="Ajuda" subtitle="Dúvidas frequentes e suporte" onClick={openSupport} />
          <SettingsRow icon={<Info size={16} strokeWidth={1.5} className="text-[#8A7763]" />} title="Sobre o app" subtitle={`Versão ${APP_VERSION}`} onClick={() => setShowAboutModal(true)} />
        </div>
      </section>
      <section className="space-y-2">
        <h3 className="text-[1.45rem] serif text-[#2E241B] leading-none">Suporte</h3>
        <SupportCard onClick={openSupport} />
      </section>
      {restorePurchasesState === 'processingPayment' && <p className="text-sm text-[#6A5E52]">Restaurando compras...</p>}
    </div>
  );

  const renderHome = () => {
    const discoveries = [
      { id: 'final', title: 'FINAL EXPLICADO', image: HOME_DISCOVERY_FINAL_URL },
      { id: 'camadas', title: 'CAMADAS OCULTAS', image: HOME_DISCOVERY_CAMADAS_URL },
      { id: 'mensagem', title: 'MENSAGEM CENTRAL', image: HOME_DISCOVERY_MENSAGEM_URL },
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
              { title: 'Filmes e Séries', icon: Film, tab: 'movies_series' },
              { title: 'Livros', icon: BookOpen, tab: 'books' },
              { title: 'Músicas', icon: Music2, tab: 'music' },
              { title: 'Favoritos', icon: Heart, tab: 'home' },
              { title: 'Tendências', icon: TrendingUp, tab: 'home' },
              { title: 'Loja', icon: ShoppingBag, tab: 'store' },
            ].map(({ title, icon: Icon, tab }) => (
              <button
                key={title}
                onClick={() => {
                  if (tab === 'home' && title === 'Favoritos') setToast('Abrindo favoritos...');
                  else if (tab === 'home' && title === 'Tendências') setToast('Abrindo tendências...');
                  else setActiveTab(tab as AppTab);
                }}
                className="h-full rounded-[1rem] bg-white border border-[#E6DED2] shadow-[0_4px_10px_rgba(0,0,0,0.06)] p-2 flex flex-col items-center justify-center gap-1.5"
              >
                <span className="w-9 h-9 rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#8A6A3A]">
                  <Icon size={17} strokeWidth={1.5} />
                </span>
                <span className="text-[0.62rem] leading-tight text-center serif text-[#4A3A2B]">{title}</span>
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
                className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-sm text-left"
              >
                <img src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        <div className="flex-1 min-h-[24px]" />
      </div>
    );
  };

  const shouldLockScroll =
    activeTab === 'home' ||
    activeTab === 'store' ||
    activeTab === 'settings' ||
    (activeTab === 'movies_series' && !moviesResult) ||
    (activeTab === 'books' && !booksResult) ||
    (activeTab === 'movies_series' && !!moviesResult) ||
    (activeTab === 'books' && !!booksResult) ||
    activeTab === 'music';

  return (
    <div className={`min-h-screen ${themeMode === 'dark' ? 'theme-dark bg-[#1d1915] text-[#F3EBDD]' : 'bg-[#EDE7DF] text-[#2B231C]'} p-2.5 flex items-start justify-center`}>
      <div className="relative w-full max-w-[446px] rounded-[2rem] bg-gradient-to-b from-[#121212] to-[#060606] p-2 shadow-[0_22px_46px_rgba(0,0,0,0.45)] border border-white/10">
      <div className={`relative overflow-x-hidden rounded-[1.6rem] ${themeMode === 'dark' ? 'bg-[#221d18]' : 'bg-[#EDE7DF]'} w-full h-[calc(100dvh-20px)] mobile-shell ${shouldLockScroll ? 'overflow-y-hidden' : 'overflow-y-auto'}`}>
        <main
          className={`w-full px-4 ${shouldLockScroll ? 'pt-2 overflow-hidden' : 'pt-4'}`}
          style={shouldLockScroll ? { height: `calc(100% - ${BOTTOM_NAV_HEIGHT}px)`, paddingBottom: '6px' } : { paddingBottom: `${BOTTOM_NAV_HEIGHT + 12}px` }}
        >
          {(musicLoading || moviesLoading || booksLoading) && (
            <DecipheringOverlay 
              progress={decipherProgress} 
              message={decipherMessage} 
              theme={themeMode} 
            />
          )}
          {activeTab === 'home' && renderHome()}
          {activeTab === 'music' && renderMusic()}
          {activeTab === 'store' && renderStore()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'movies_series' && renderMovies()}
          {activeTab === 'books' && renderBooks()}
        </main>
        <BottomNav activeTab={activeTab} onChange={setActiveTab} />
      </div>
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
          color: #958676;
          transition: all .2s ease;
          position: relative;
        }
        .nav-tab.active { color: #a87425; }
        .nav-tab.active::after {
          content: '';
          position: absolute;
          width: 46px;
          height: 2px;
          border-radius: 999px;
          background: #c99022;
          bottom: 2px;
        }
        .tab-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tab-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .04em;
          line-height: 1;
        }
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
