import React from 'react';
import { Music, User, AlignLeft, Globe, Heart, Sparkles, Music4, Search, ChevronDown, Camera, Lock, Unlock } from 'lucide-react';

// 1. MusicHeader
export const MusicHeader: React.FC = () => {
  return (
    <div className="top-banner relative" style={{
      background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop') center/cover`,
      height: '240px'
    }}>
      <div className="z-10 flex flex-col items-center mb-4 mt-8">
        <img src="/logo.webp" alt="Decifra" className="logo-img mb-2 rounded-xl shadow-lg border border-yellow-600/20" />
        <h1 className="text-[#C5A059] serif text-3xl font-bold tracking-tight mb-0">DECIFRA APP</h1>
        <h2 className="text-white serif text-3xl font-bold tracking-tight">Músicas</h2>
        <p className="text-yellow-600/90 text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 text-center px-4">Interprete letras, emoções e significados</p>
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute -right-10 -top-10 rotate-12 text-white">
            <Music size={120} />
        </div>
      </div>
    </div>
  );
};

// 2. MusicArtistToggle
interface MusicArtistToggleProps {
  type: 'track' | 'artist';
  onChange: (type: 'track' | 'artist') => void;
}

export const MusicArtistToggle: React.FC<MusicArtistToggleProps> = ({ type, onChange }) => {
  return (
    <div className="media-type-selector-simple" role="radiogroup">
      <button 
        onClick={() => onChange('track')}
        className={`media-type-btn-simple ${type === 'track' ? 'active' : ''}`}
      >
        Músicas
      </button>
      <button 
        onClick={() => onChange('artist')}
        className={`media-type-btn-simple ${type === 'artist' ? 'active' : ''}`}
      >
        Artistas
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


interface MusicSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onClear?: () => void;
  examples?: string[];
  onImageSelect?: (file: File | null) => void;
}

export const MusicSearchInput: React.FC<MusicSearchInputProps> = ({ value, onChange, placeholder, onClear, examples, onImageSelect }) => {
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

// Analysis Dropdown
interface MusicAnalysisDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export const MusicAnalysisDropdown: React.FC<MusicAnalysisDropdownProps> = ({ value, onChange, options }) => {
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

// 3. MusicFocusToggle
interface MusicFocusToggleProps {
  focus: 'lyrics' | 'context' | 'emotion';
  onChange: (focus: 'lyrics' | 'context' | 'emotion') => void;
}

export const MusicFocusToggle: React.FC<MusicFocusToggleProps> = ({ focus, onChange }) => {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Foco</span>
      <div className="flex gap-2">
        <button 
          onClick={() => onChange('lyrics')}
          className={`flex-1 flex items-center justify-center h-11 rounded-xl text-sm font-semibold border transition-all gap-2 cursor-pointer ${focus === 'lyrics' ? 'border-yellow-600/50 bg-yellow-600/10 text-yellow-700' : 'border-gray-200 bg-white/50 text-gray-500'}`}
        >
          <AlignLeft size={14} />
          <span className="text-[10px] uppercase tracking-widest">Letra</span>
        </button>
        <button 
          onClick={() => onChange('context')}
          className={`flex-1 flex items-center justify-center h-11 rounded-xl text-sm font-semibold border transition-all gap-2 cursor-pointer ${focus === 'context' ? 'border-yellow-600/50 bg-yellow-600/10 text-yellow-700' : 'border-gray-200 bg-white/50 text-gray-500'}`}
        >
          <Globe size={14} />
          <span className="text-[10px] uppercase tracking-widest">Contexto</span>
        </button>
        <button 
          onClick={() => onChange('emotion')}
          className={`flex-1 flex items-center justify-center h-11 rounded-xl text-sm font-semibold border transition-all gap-2 cursor-pointer ${focus === 'emotion' ? 'border-yellow-600/50 bg-yellow-600/10 text-yellow-700' : 'border-gray-200 bg-white/50 text-gray-500'}`}
        >
          <Heart size={14} />
          <span className="text-[10px] uppercase tracking-widest">Emoção</span>
        </button>
      </div>
    </div>
  );
};

// 4. MusicFocusChips
interface MusicFocusChipsProps {
  activeChip: string | null;
  onChipClick: (chip: string) => void;
}

export const MusicFocusChips: React.FC<MusicFocusChipsProps> = ({ activeChip, onChipClick }) => {
  const chips = [
    { label: 'Simbologia', icon: <Sparkles size={14} /> },
    { label: 'Refrão', icon: <Music4 size={14} /> },
    { label: 'Sentimento', icon: <Heart size={14} /> }
  ];
  
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {chips.map(chip => (
        <button 
          key={chip.label}
          onClick={() => onChipClick(activeChip === chip.label ? '' : chip.label)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-medium transition-all ${activeChip === chip.label ? 'border-yellow-600/50 bg-yellow-600/10 text-yellow-700' : 'border-gray-200 bg-white text-gray-600'}`}
        >
          {chip.icon}
          {chip.label}
        </button>
      ))}
    </div>
  );
};

// InterpretButton
interface MusicInterpretButtonProps {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export const MusicInterpretButton: React.FC<MusicInterpretButtonProps> = ({ onClick, disabled, loading }) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-bold shadow-md shadow-yellow-600/20 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          <Sparkles size={18} />
          <span className="text-sm uppercase tracking-widest">INTERPRETAR AGORA</span>
        </>
      )}
    </button>
  );
};

// 5. TodayHighlightsSection
export const TodayHighlightsSection: React.FC = () => {
  return (
    <section className="mt-10 mb-10 px-4">
      <h3 className="serif text-xl font-bold text-gray-800 mb-4">Destaques de hoje</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
        {/* Card 1 */}
        <div className="relative w-full min-w-[140px] max-w-[160px] aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 snap-center flex-shrink-0 group">
          <img src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2070&auto=format&fit=crop" alt="Mensagem da Letra" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-16 pb-4 px-3 flex flex-col justify-end">
            <span className="font-bold text-white text-[10px] tracking-widest uppercase text-center">Mensagem da Letra</span>
          </div>
        </div>
        {/* Card 2 */}
        <div className="relative w-full min-w-[140px] max-w-[160px] aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 snap-center flex-shrink-0 group">
          <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" alt="Sentimento Central" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-16 pb-4 px-3 flex flex-col justify-end">
            <span className="font-bold text-white text-[10px] tracking-widest uppercase text-center">Sentimento Central</span>
          </div>
        </div>
        {/* Card 3 */}
        <div className="relative w-full min-w-[140px] max-w-[160px] aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 snap-center flex-shrink-0 group">
          <img src="https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=1974&auto=format&fit=crop" alt="Contexto da Canção" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent pt-16 pb-4 px-3 flex flex-col justify-end">
            <span className="font-bold text-white text-[10px] tracking-widest uppercase text-center">Contexto da Canção</span>
          </div>
        </div>
      </div>
    </section>
  );
};

