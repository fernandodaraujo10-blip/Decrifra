import React, { useState } from 'react';
import './MusicScreen.css';
import { 
  MusicHeader, 
  MusicArtistToggle, 
  MusicFocusToggle, 
  MusicFocusChips, 
  TodayHighlightsSection,
  MusicSearchInput,
  MusicAnalysisDropdown,
  MusicInterpretButton,
  SpoilerToggle
} from './MusicComponents';

interface MusicScreenProps {
  onInterpret: (payload: any) => Promise<any>;
  loading: boolean;
}

const ANALYSIS_OPTIONS = [
  'Significado da letra e mensagem central',
  'Simbologia e referências',
  'Emoção principal e sentimento',
  'Contexto da canção',
  'Interpretação geral'
];

export const MusicScreen: React.FC<MusicScreenProps> = ({ onInterpret, loading }) => {
  const [searchType, setSearchType] = useState<'track' | 'artist'>('track');
  const [query, setQuery] = useState('');
  const [analysisType, setAnalysisType] = useState(ANALYSIS_OPTIONS[0]);
  const [mainFocus, setMainFocus] = useState<'lyrics' | 'context' | 'emotion'>('lyrics');
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [hasSpoiler, setHasSpoiler] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleInterpret = async () => {
    if (!query.trim() || loading) return;
    
    const payload = {
      mediaCategory: 'music',
      searchType,
      query: query.trim(),
      title: query.trim(), // Para o motor de IA
      analysisType,
      mainFocus,
      chipFocus: activeChip,
      focusChip: activeChip, // Consistência
      hasSpoiler,
      spoilerMode: hasSpoiler, // Consistência
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

  const isFormValid = query.trim().length > 0;

  return (
    <div className="music-screen">
      <MusicHeader />
      
      <main className="music-main">
        <div className="music-card-overlap">
          <MusicArtistToggle type={searchType} onChange={setSearchType} />
          
          <MusicSearchInput 
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            placeholder={searchType === 'track' ? "Ex.: Bohemian Rhapsody, Trem Bala..." : "Ex.: Queen, Djavan, Adele..."}
            examples={searchType === 'track' ? ['Bohemian Rhapsody', 'Trem Bala', 'Imagine'] : ['Queen', 'Djavan', 'Adele']}
            onImageSelect={setImageFile}
          />

          <MusicAnalysisDropdown 
            value={analysisType}
            onChange={setAnalysisType}
            options={ANALYSIS_OPTIONS}
          />

          <MusicFocusToggle 
            focus={mainFocus}
            onChange={setMainFocus}
          />

          <MusicFocusChips 
            activeChip={activeChip}
            onChipClick={(chip) => setActiveChip(chip || null)}
          />

          <SpoilerToggle 
            hasSpoiler={hasSpoiler} 
            onChange={setHasSpoiler} 
          />

          <MusicInterpretButton 
            onClick={handleInterpret}
            disabled={!isFormValid || loading}
            loading={loading}
          />
        </div>

        <TodayHighlightsSection />
      </main>
    </div>
  );
};

