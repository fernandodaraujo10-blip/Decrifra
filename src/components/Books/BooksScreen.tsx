import React, { useState, useEffect } from 'react';
import './BooksScreen.css';
import { 
  BooksHeader, 
  BookAuthorToggle, 
  BooksSearchInput, 
  BooksAnalysisDropdown, 
  DepthToggle, 
  BookFocusChips, 
  BooksInterpretButton, 
  ExploreTodaySection,
  SpoilerToggle,
  BookPreviewCard
} from './BooksComponents';
import { fetchBookMetadata, BookMetadata } from '../../core/metadataService';

interface BooksScreenProps {
  onInterpret: (payload: any) => Promise<any>;
  loading: boolean;
}

const ANALYSIS_OPTIONS = [
  "Tema central, personagens e simbolismos",
  "Contexto histórico e mensagem",
  "Camadas do texto e subtexto",
  "Personagens e conflitos",
  "Leitura geral da obra"
];

export const BooksScreen: React.FC<BooksScreenProps> = ({ onInterpret, loading }) => {
  const [searchType, setSearchType] = useState<'book' | 'author'>(() => {
    return (localStorage.getItem('decifra_last_book_search_type') as 'book' | 'author') || 'book';
  });
  const [query, setQuery] = useState('');
  const [analysisType, setAnalysisType] = useState(() => {
    return localStorage.getItem('decifra_last_book_analysis_type') || ANALYSIS_OPTIONS[0];
  });
  const [depthMode, setDepthMode] = useState<'quick' | 'deep'>(() => {
    return (localStorage.getItem('decifra_last_book_depth') as 'quick' | 'deep') || 'deep';
  });
  const [focusChip, setFocusChip] = useState<string | null>(null);
  const [hasSpoiler, setHasSpoiler] = useState(() => {
    return localStorage.getItem('decifra_last_book_spoiler') === 'true';
  });
  const [showHistory, setShowHistory] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [history, setHistory] = useState<{ query: string; type: 'book' | 'author' }[]>(() => {
    const saved = localStorage.getItem('decifra_book_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [bookMetadata, setBookMetadata] = useState<BookMetadata | null>(null);
  const [isSearchingMetadata, setIsSearchingMetadata] = useState(false);

  // Persist choices
  useEffect(() => {
    localStorage.setItem('decifra_last_book_search_type', searchType);
  }, [searchType]);

  useEffect(() => {
    localStorage.setItem('decifra_last_book_analysis_type', analysisType);
  }, [analysisType]);

  useEffect(() => {
    localStorage.setItem('decifra_last_book_depth', depthMode);
  }, [depthMode]);

  useEffect(() => {
    localStorage.setItem('decifra_last_book_spoiler', String(hasSpoiler));
  }, [hasSpoiler]);

  // Fetch book metadata when query changes (with debounce)
  useEffect(() => {
    if (searchType !== 'book' || query.length < 3) {
      setBookMetadata(null);
      return;
    }

    const timer = setTimeout(async () => {
      console.log(`[BooksScreen] Iniciando busca de metadados para: "${query}"`);
      setIsSearchingMetadata(true);
      const meta = await fetchBookMetadata(query);
      console.log(`[BooksScreen] Resultado da busca:`, meta ? "Sucesso" : "Nenhum resultado");
      setBookMetadata(meta);
      setIsSearchingMetadata(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [query, searchType]);

  const handleInterpret = async () => {
    if (!query.trim() || loading) return;

    // Update history
    const trimmedQuery = query.trim();
    const newHistory = [
      { query: trimmedQuery, type: searchType },
      ...history.filter(h => h.query !== trimmedQuery)
    ].slice(0, 5);
    
    setHistory(newHistory);
    localStorage.setItem('decifra_book_history', JSON.stringify(newHistory));

    const payload = {
      mediaCategory: "books",
      searchType: searchType,
      query: trimmedQuery,
      title: trimmedQuery, // Crucial para o interpretMovie
      analysisType: analysisType,
      depthMode: depthMode,
      focusChip: focusChip,
      hasSpoiler: hasSpoiler,
      spoilerMode: hasSpoiler, // Crucial para o interpretMovie
      userPlan: localStorage.getItem('decifra_plan') || 'free',
      userId: 'user_logged_in' 
    };

    try {
      const result = await onInterpret(payload);
      if (result && typeof result === 'object' && 'ok' in result && result.ok === false) {
        alert(result.error || "Ocorreu um erro na interpretação.");
      }
    } catch (err) {
      alert("Erro ao conectar com o serviço de IA.");
    }
  };

  const getPlaceholder = () => {
    return searchType === 'book' 
      ? "Ex.: 1984, Dom Casmurro, O Hobbit..." 
      : "Ex.: Machado de Assis, Tolkien, C. S. Lewis...";
  };

  return (
    <div className="books-screen">
      <BooksHeader />
      
      <main className="books-main">
        <div className="books-card-overlap">
          <BookAuthorToggle 
            searchType={searchType} 
            onChange={(val) => {
              setSearchType(val);
              setQuery('');
            }} 
          />

          <BooksSearchInput 
            value={query}
            onChange={setQuery}
            placeholder={getPlaceholder()}
            onFocus={() => setShowHistory(true)}
            onClear={() => {
              setQuery('');
              setShowHistory(false);
            }}
            examples={searchType === 'book' ? ['1984', 'Dom Casmurro', 'O Hobbit'] : ['Machado de Assis', 'Tolkien', 'C. S. Lewis']}
            onImageSelect={setImageFile}
          />

          {showHistory && history.length > 0 && !query && (
            <div className="books-history-panel">
               {history.filter(h => h.type === searchType).map(h => (
                 <button 
                  key={h.query} 
                  onClick={() => { setQuery(h.query); setShowHistory(false); }}
                  className="books-history-item"
                 >
                   ↻ {h.query}
                 </button>
                ))}
            </div>
          )}

          {isSearchingMetadata && (
            <div className="flex items-center justify-center py-4 gap-2 text-[#a6792a] animate-pulse">
               <div className="w-4 h-4 border-2 border-[#a6792a] border-t-transparent rounded-full animate-spin"></div>
               <span className="text-xs font-bold uppercase tracking-wider">Buscando informações da obra...</span>
            </div>
          )}

          <BookPreviewCard 
            metadata={bookMetadata} 
            visible={!!bookMetadata && searchType === 'book'} 
          />

          <BooksAnalysisDropdown 
            value={analysisType} 
            onChange={setAnalysisType} 
            options={ANALYSIS_OPTIONS} 
          />

          <DepthToggle 
            depth={depthMode} 
            onChange={setDepthMode} 
          />

          <SpoilerToggle 
            hasSpoiler={hasSpoiler} 
            onChange={setHasSpoiler} 
          />

          <BookFocusChips 
            activeChip={focusChip} 
            onChipClick={setFocusChip} 
          />

          <BooksInterpretButton 
            onClick={handleInterpret} 
            disabled={!query.trim() || loading} 
            loading={loading} 
          />
        </div>

        <ExploreTodaySection 
          onExploreClick={(exploreTitle, id) => {
            setSearchType('book');
            setFocusChip(id === 'tema_central' ? 'Contexto' : id === 'personagens' ? 'Personagens' : 'Resumo');
          }} 
        />
      </main>
    </div>
  );
};
