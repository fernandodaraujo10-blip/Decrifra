import React from 'react';
import { Book, User, Search, ChevronDown, FileText, Users, Globe, Quote, Sparkles, Settings, Camera, Lock, Unlock, Star, BookOpen } from 'lucide-react';

// 1. BooksHeader
export const BooksHeader: React.FC = () => {
  return (
    <div className="top-banner relative" style={{
      background: `linear-gradient(to bottom, rgba(15,10,5,0.7), rgba(15,10,5,0.9)), url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop') center/cover`,
      height: '260px'
    }}>
      <div className="absolute top-6 right-6">
         <div className="w-10 h-10 bg-[#C5A059]/20 rounded-full flex items-center justify-center text-[#C5A059] border border-[#C5A059]/30">
            <Settings size={20} />
         </div>
      </div>
      <div className="z-10 flex flex-col items-center mt-4">
        <div className="relative mb-2">
          <img src="/logo.webp" alt="Decifra" className="logo-img rounded-[1rem] shadow-xl border border-[#C5A059]/20" />
        </div>
        <div className="flex flex-col items-center">
            <h1 className="text-[#C5A059] serif text-3xl font-bold tracking-tight mb-0">DECIFRA APP</h1>
            <h2 className="text-white serif text-3xl font-bold tracking-tight mb-2">Livros</h2>
        </div>
        <p className="text-[#E8D8B0] text-xs font-medium max-w-[200px] text-center opacity-90">
          Descubra temas, símbolos e camadas da leitura.
        </p>
      </div>
    </div>
  );
};

// 2. BookAuthorToggle
interface BookAuthorToggleProps {
  searchType: 'book' | 'author';
  onChange: (type: 'book' | 'author') => void;
}

export const BookAuthorToggle: React.FC<BookAuthorToggleProps> = ({ searchType, onChange }) => {
  return (
    <div className="media-type-selector-simple" role="radiogroup">
      <button 
        onClick={() => onChange('book')}
        className={`media-type-btn-simple ${searchType === 'book' ? 'active' : ''}`}
      >
        Livros
      </button>
      <button 
        onClick={() => onChange('author')}
        className={`media-type-btn-simple ${searchType === 'author' ? 'active' : ''}`}
      >
        Autores
      </button>
    </div>
  );
};

interface SpoilerToggleProps {
  hasSpoiler: boolean;
  onChange: (hasSpoiler: boolean) => void;
}

export const SpoilerToggle: React.FC<SpoilerToggleProps> = ({ hasSpoiler, onChange }) => {
  return (
    <div className="spoiler-horizontal-container">
      <span className="spoiler-label-simple">Modo spoiler</span>
      <div className="spoiler-btn-group-simple">
        <button
          onClick={() => onChange(false)}
          className={`spoiler-circle-btn ${!hasSpoiler ? 'active' : ''}`}
          title="Sem Spoiler"
        >
          <Lock size={14} className="lock-icon" />
        </button>
        <button
          onClick={() => onChange(true)}
          className={`spoiler-circle-btn ${hasSpoiler ? 'active' : ''}`}
          title="Com Spoiler"
        >
          <Unlock size={14} className="unlock-icon" />
        </button>
      </div>
    </div>
  );
};



// 3. BooksSearchInput
interface BooksSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onFocus?: () => void;
  onClear?: () => void;
  examples?: string[];
  onImageSelect?: (file: File | null) => void;
}

export const BooksSearchInput: React.FC<BooksSearchInputProps> = ({ value, onChange, placeholder, onFocus, onClear, examples, onImageSelect }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

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
    <div className="flex flex-col w-full mb-6">
      {examples && examples.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1 hide-scrollbar">
          {examples.map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange(ex)}
              className="text-[14px] font-bold py-1 text-[#1a3a5a] bg-transparent border-none whitespace-nowrap hover:opacity-80 transition-opacity mr-3"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
      <div className="relative flex items-center w-full">
        <div className="absolute left-4 text-[#9b8c7b]">
          <Search size={20} strokeWidth={1.5} />
        </div>
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder={placeholder}
          className="w-full h-[54px] pl-11 pr-20 rounded-[16px] bg-[#f3efe9] border border-[#b2a084]/36 text-[1.05rem] text-[#473a2e] placeholder:text-[#9d9080] focus:outline-none focus:border-[#c39857] focus:ring-[4px] focus:ring-[#cba260]/10 transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {value && (
            <button 
              onClick={onClear}
              className="text-[#9f907f] hover:text-[#473a2e] w-6 h-6 flex items-center justify-center rounded-full transition-colors"
            >
              ✕
            </button>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-[#9b8c7b] hover:text-[#473a2e] p-1 flex items-center justify-center transition-colors"
            aria-label="Tirar foto ou upload"
          >
            <Camera size={20} strokeWidth={1.5} />
          </button>
        </div>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {imagePreview && (
        <div className="flex items-center gap-3 p-2 mt-3 bg-white border border-[#b2a084]/30 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col flex-grow overflow-hidden">
            <span className="text-xs font-bold text-[#473a2e] truncate">Imagem anexada</span>
          </div>
          <button 
            onClick={handleClearImage}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex-shrink-0 mr-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// 3.1 BookPreviewCard
interface BookPreviewCardProps {
  metadata: {
    title: string;
    author: string;
    description: string;
    coverUrl: string;
    rating: number;
  } | null;
  visible: boolean;
}

export const BookPreviewCard: React.FC<BookPreviewCardProps> = ({ metadata, visible }) => {
  if (!visible || !metadata) return null;

  return (
    <div className="book-preview-card animate-in fade-in slide-in-from-bottom-4">
      <div className="preview-flex">
        <div className="preview-cover-container">
          <img src={metadata.coverUrl} alt={metadata.title} className="preview-cover shadow-lg" />
          <div className="preview-rating">
            <Star size={12} fill="#FFD700" color="#FFD700" />
            <span>{metadata.rating}/10</span>
          </div>
        </div>
        <div className="preview-info">
          <h4 className="preview-title serif">{metadata.title}</h4>
          <p className="preview-author">{metadata.author}</p>
          <div className="preview-description-wrapper">
             <p className="preview-description">{metadata.description.substring(0, 140)}...</p>
          </div>
          <div className="preview-badge">
             <BookOpen size={10} />
             <span>OBRA ENCONTRADA</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. BooksAnalysisDropdown
interface BooksAnalysisDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const BooksAnalysisDropdown: React.FC<BooksAnalysisDropdownProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-2 mb-6 relative">
      <span className="text-xs font-bold text-gray-600">Tipo de análise</span>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between h-12 px-4 bg-gray-50/80 border border-gray-100 rounded-xl text-left text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-600/50"
      >
        <span className="truncate text-sm">{value}</span>
        <div className={`transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={18} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {options.map((opt) => (
            <button 
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`w-full text-left px-4 py-4 text-sm transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0 ${value === opt ? 'text-yellow-700 font-bold bg-yellow-50' : 'text-gray-600'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 5. DepthToggle
interface DepthToggleProps {
  depth: 'quick' | 'deep';
  onChange: (depth: 'quick' | 'deep') => void;
}

export const DepthToggle: React.FC<DepthToggleProps> = ({ depth, onChange }) => {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <span className="text-xs font-bold text-gray-600">Profundidade</span>
      <div className="flex gap-2">
        <button 
          onClick={() => onChange('quick')}
          className={`flex-1 flex items-center justify-center h-11 rounded-xl text-sm font-semibold border transition-all gap-2 cursor-pointer ${depth === 'quick' ? 'border-yellow-600/50 bg-yellow-600/10 text-yellow-700' : 'border-gray-200 bg-white/50 text-gray-500'}`}
        >
          <span className="text-[10px] uppercase tracking-widest">RÁPIDA</span>
        </button>
        <button 
          onClick={() => onChange('deep')}
          className={`flex-1 flex items-center justify-center h-11 rounded-xl text-sm font-semibold border transition-all gap-2 cursor-pointer ${depth === 'deep' ? 'border-yellow-600/50 bg-yellow-600/10 text-yellow-700' : 'border-gray-200 bg-white/50 text-gray-500'}`}
        >
          <span className="text-[10px] uppercase tracking-widest">PROFUNDA</span>
        </button>
      </div>
    </div>
  );
};

// 6. BookFocusChips
interface BookFocusChipsProps {
  activeChip: string | null;
  onChipClick: (chip: string) => void;
}

export const BookFocusChips: React.FC<BookFocusChipsProps> = ({ activeChip, onChipClick }) => {
  const chips = [
    { id: 'Resumo', icon: <FileText size={14} /> },
    { id: 'Personagens', icon: <Users size={14} /> },
    { id: 'Contexto', icon: <Globe size={14} /> },
    { id: 'Citações', icon: <Quote size={14} /> },
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {chips.map(chip => (
        <button 
          key={chip.id}
          onClick={() => onChipClick(activeChip === chip.id ? '' : chip.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium transition-all ${activeChip === chip.id ? 'border-yellow-600/50 bg-yellow-600/10 text-yellow-700' : 'border-gray-200 bg-white text-gray-600'}`}
        >
          {chip.icon}
          {chip.id}
        </button>
      ))}
    </div>
  );
};

// 7. InterpretButton
interface BooksInterpretButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
  loadingText?: string;
}

export const BooksInterpretButton: React.FC<BooksInterpretButtonProps> = ({ onClick, disabled, loading, loadingText = "AGUARDE O RESULTADO..." }) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold shadow-md shadow-yellow-600/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold">{loadingText}</span>
        </div>
      ) : (
        <>
          <Sparkles size={18} />
          <span className="text-sm uppercase tracking-widest">INTERPRETAR AGORA</span>
        </>
      )}
    </button>
  );
};

// 8. ExploreTodaySection
export const ExploreTodaySection: React.FC<{ onExploreClick: (title: string, type: string) => void }> = ({ onExploreClick }) => {
  const cards = [
    { title: 'TEMA CENTRAL', bg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop', id: 'tema_central' },
    { title: 'PERSONAGENS', bg: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1000&auto=format&fit=crop', id: 'personagens' },
    { title: 'CAMADAS DO TEXTO', bg: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=1000&auto=format&fit=crop', id: 'camadas' }
  ];

  return (
    <section className="mt-10 mb-20 px-4">
      <h3 className="serif text-xl font-bold text-gray-800 mb-4">Explorar hoje</h3>
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
        {cards.map((card, idx) => (
          <button 
            key={idx}
            onClick={() => onExploreClick(card.title, card.id)}
            className="relative w-full min-w-[140px] max-w-[160px] aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 snap-start group flex-shrink-0"
          >
            <img src={card.bg} alt={card.title} className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-16 pb-4 px-3 flex flex-col justify-end">
              <span className="font-bold text-white text-[10px] tracking-widest uppercase text-center">{card.title}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

