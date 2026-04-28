import React, { useEffect, useMemo, useRef, useState } from 'react';

const iconClass = 'movies-series-icon';

export const Icons = {
  Film: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 3v18M17 3v18M3 7h4M3 12h4M3 17h4M17 7h4M17 12h4M17 17h4" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Tv: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 2 12 7 17 2" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Search: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Eye: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  EyeOff: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 3 21 21" stroke="currentColor" strokeWidth="2" />
      <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" stroke="currentColor" strokeWidth="2" />
      <path d="M9.9 5.1A11.9 11.9 0 0 1 12 5c6.4 0 10 7 10 7a16.4 16.4 0 0 1-4.2 4.7" stroke="currentColor" strokeWidth="2" />
      <path d="M6.6 6.6A16.4 16.4 0 0 0 2 12s3.6 7 10 7c1.2 0 2.3-.2 3.4-.6" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Sparkles: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" stroke="currentColor" strokeWidth="2" />
      <path d="m19 14 .7 1.7L21.5 16l-1.8.7L19 18.5l-.7-1.8-1.8-.7 1.8-.3L19 14Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Clapper: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7.5 20 3l1 4.5L4 12z" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="9" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Reel: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
    </svg>
  ),
  Camera: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  ),
  Lock: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Unlock: () => (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
};

export const MoviesSeriesHeader: React.FC = () => {
  return (
    <header className="movies-series-header" aria-label="Cabeçalho filmes e séries">
      <div className="movies-series-header-glow" />
      <div className="movies-series-header-overlay" />
      <div className="movies-series-header-deco left"><Icons.Reel /></div>
      <div className="movies-series-header-deco right"><Icons.Clapper /></div>
      <div className="movies-series-header-content">
        <img src="/logo.webp" alt="Logo Decifra" className="movies-series-logo" />
        <div>
          <div className="movies-series-brand">DECIFRA APP</div>
          <h1>Filmes e Séries</h1>
          <p>Interpretação inteligente para cinema e streaming</p>
        </div>
      </div>
    </header>
  );
};

interface MediaTypeToggleProps {
  type: 'movie' | 'series';
  onChange: (type: 'movie' | 'series') => void;
}

export const MediaTypeToggle: React.FC<MediaTypeToggleProps> = ({ type, onChange }) => {
  return (
    <div className="movies-type-selector" role="radiogroup" aria-label="Tipo de mídia">
      <button
        type="button"
        onClick={() => onChange('movie')}
        className={`movies-type-btn ${type === 'movie' ? 'active' : ''}`}
        aria-checked={type === 'movie'}
        role="radio"
      >
        Filmes
      </button>
      <button
        type="button"
        onClick={() => onChange('series')}
        className={`movies-type-btn ${type === 'series' ? 'active' : ''}`}
        aria-checked={type === 'series'}
        role="radio"
      >
        Séries
      </button>
    </div>
  );
};

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  examples?: string[];
  onImageSelect?: (file: File | null) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder, onFocus, onBlur, onClear, examples, onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (onImageSelect) onImageSelect(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    if (onImageSelect) onImageSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="movies-search-section" style={{ marginBottom: '14px' }}>
      {examples && examples.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="hide-scrollbar">
          {examples.map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange(ex)}
              style={{
                fontSize: '0.85rem', fontWeight: 700, padding: '4px 0',
                background: 'transparent', color: '#1a3a5a',
                border: 'none', whiteSpace: 'nowrap', marginRight: '12px'
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      )}
      <div className="movies-search-wrapper" style={{ marginBottom: 0 }}>
        <label htmlFor="movies-title-input" className="sr-only">Título da obra</label>
        <Icons.Search />
        <input
          id="movies-title-input"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="movies-search-input"
          autoComplete="off"
          style={{ paddingRight: value ? '80px' : '48px' }}
        />
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {value && (
            <button type="button" onClick={onClear} className="movies-clear-input" aria-label="Limpar título" style={{ position: 'static', transform: 'none' }}>
              ✕
            </button>
          )}
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              background: 'transparent', border: 'none', color: '#9b8c7b', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' 
            }}
          >
            <Icons.Camera />
          </button>
        </div>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {imagePreview && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', marginTop: '12px', background: '#fffdf9', border: '1px solid rgba(178, 160, 132, 0.3)', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', background: '#f5f1e8', flexShrink: 0 }}>
            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b3d31', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Imagem anexada</span>
          </div>
          <button 
            onClick={handleClearImage}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: '#fff0f0', color: '#ff4d4f', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

interface SpoilerToggleProps {
  hasSpoiler: boolean;
  onChange: (hasSpoiler: boolean) => void;
}

export const SpoilerToggle: React.FC<SpoilerToggleProps> = ({ hasSpoiler, onChange }) => {
  return (
    <div className="movies-spoiler-container">
      <div className="movies-row-title" style={{ marginBottom: 0 }}>Modo spoiler</div>
      <div className="movies-spoiler-buttons">
        <button
          type="button"
          className={`movies-spoiler-btn ${!hasSpoiler ? 'active' : ''}`}
          onClick={() => onChange(false)}
          title="Sem Spoiler"
        >
          <Icons.Lock />
        </button>
        <button
          type="button"
          className={`movies-spoiler-btn ${hasSpoiler ? 'active' : ''}`}
          onClick={() => onChange(true)}
          title="Com Spoiler"
        >
          <Icons.Unlock />
        </button>
      </div>
    </div>
  );
};

interface AnalysisDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const AnalysisDropdown: React.FC<AnalysisDropdownProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="movies-row-group" ref={dropdownRef}>
      <label className="movies-row-title" htmlFor="analysis-dropdown-trigger">Tipo de análise</label>
      <button
        id="analysis-dropdown-trigger"
        type="button"
        className="movies-dropdown-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{value}</span>
        <span className={`movies-dropdown-icon ${isOpen ? 'open' : ''}`}><Icons.ChevronDown /></span>
      </button>

      {isOpen && (
        <div className="movies-dropdown-panel" role="listbox" aria-label="Tipo de análise">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              className={`movies-dropdown-option ${option === value ? 'active' : ''}`}
              role="option"
              aria-selected={option === value}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface FocusChipsProps {
  activeChip: string | null;
  onChipClick: (chip: string | null) => void;
}

const chips = ['Personagens', 'Temas', 'Contexto', 'Arco final'];

export const FocusChips: React.FC<FocusChipsProps> = ({ activeChip, onChipClick }) => {
  return (
    <div className="movies-chips" aria-label="Focos rápidos">
      {chips.map((chip) => {
        const isActive = activeChip === chip;
        return (
          <button
            key={chip}
            type="button"
            className={`movies-chip ${isActive ? 'active' : ''}`}
            onClick={() => onChipClick(isActive ? null : chip)}
            aria-pressed={isActive}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
};

interface InterpretButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export const InterpretButton: React.FC<InterpretButtonProps> = ({ onClick, disabled, loading }) => {
  return (
    <button type="button" onClick={onClick} disabled={disabled || loading} className="movies-cta">
      {loading ? <span className="movies-cta-spinner" aria-label="Carregando" /> : <><Icons.Sparkles />INTERPRETAR AGORA</>}
    </button>
  );
};

interface SuggestionCardItem {
  id: 'final_explicado' | 'simbolismos' | 'arco_personagens';
  title: string;
  subtitle: string;
  image: string;
}

const suggestionCards: SuggestionCardItem[] = [
  {
    id: 'final_explicado',
    title: 'FINAL EXPLICADO',
    subtitle: 'Entenda o desfecho em profundidade',
    image: '/images/final_explicado_filmes.png',
  },
  {
    id: 'simbolismos',
    title: 'SIMBOLISMOS',
    subtitle: 'Descubra símbolos e seus significados',
    image: '/images/simbolismos_filmes.png',
  },
  {
    id: 'arco_personagens',
    title: 'ARCO DOS PERSONAGENS',
    subtitle: 'A jornada e evolução de cada personagem',
    image: '/images/arco_personagens_filmes.png',
  },
];

interface SuggestionsSectionProps {
  onSuggestionClick: (suggestion: SuggestionCardItem) => void;
  onViewAll: () => void;
}

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({ onSuggestionClick, onViewAll }) => {
  const cards = useMemo(() => suggestionCards, []);

  return (
    <section className="movies-suggestions" aria-label="Sugestões de hoje">
      <div className="movies-suggestions-header">
        <h3>Sugestões de hoje</h3>
        <button type="button" onClick={onViewAll}>Ver todas</button>
      </div>
      <div className="movies-suggestions-grid">
        {cards.map((card) => (
          <button
            type="button"
            key={card.id}
            className="movies-suggestion-card"
            onClick={() => onSuggestionClick(card)}
            style={{ backgroundImage: `linear-gradient(180deg, rgba(13, 13, 13, 0.2) 0%, rgba(13, 13, 13, 0.92) 76%), url('${card.image}')` }}
          >
            <span className="movies-suggestion-play">▶</span>
            <strong>{card.title}</strong>
            <p>{card.subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export type SuggestionCard = SuggestionCardItem;
