import React, { useEffect, useMemo, useState } from 'react';
import {
  AnalysisDropdown,
  FocusChips,
  InterpretButton,
  MediaTypeToggle,
  MoviesSeriesHeader,
  SearchInput,
  SpoilerToggle,
  SuggestionCard,
  SuggestionsSection,
} from './MoviesSeriesComponents';
import './MoviesSeriesScreen.css';

interface MoviesSeriesScreenProps {
  onInterpret: (payload: any) => Promise<{ ok: boolean; error?: string } | void> | { ok: boolean; error?: string } | void;
  loading: boolean;
}

const ANALYSIS_OPTIONS = [
  'Final explicado, símbolos e mensagem central',
  'Personagens e arco narrativo',
  'Simbolismos e temas ocultos',
  'Contexto, mensagem e crítica',
  'Interpretação geral da obra',
];

const ANALYSIS_FROM_CHIP: Record<string, string> = {
  Personagens: 'Personagens e arco narrativo',
  Temas: 'Simbolismos e temas ocultos',
  Contexto: 'Contexto, mensagem e crítica',
  'Arco final': 'Final explicado, símbolos e mensagem central',
};

const sessionSpoilerKey = 'decifra_session_movies_spoiler_mode';
const recentHistoryKey = 'decifra_search_history';
const mediaTypeKey = 'decifra_last_media_type';
const analysisTypeKey = 'decifra_last_analysis_type';

const analyticsTrack = (event: string, payload: Record<string, string>) => {
  const eventsRaw = localStorage.getItem('decifra_analytics_events');
  const events = eventsRaw ? JSON.parse(eventsRaw) : [];
  events.push({ event, payload, at: new Date().toISOString() });
  localStorage.setItem('decifra_analytics_events', JSON.stringify(events.slice(-100)));
};

const readCurrentPlan = (): 'free' | 'premium' | 'pro' => {
  const saved = localStorage.getItem('decifra_state');
  if (!saved) return 'free';

  try {
    const parsed = JSON.parse(saved);
    if (parsed?.userPlan === 'free' || parsed?.userPlan === 'premium' || parsed?.userPlan === 'pro') {
      return parsed.userPlan;
    }
  } catch (_error) {
    // Ignore malformed cache and use default.
  }

  return 'free';
};

const readUserId = () => {
  const existing = localStorage.getItem('decifra_user_id');
  if (existing) return existing;
  const generated = `user_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem('decifra_user_id', generated);
  return generated;
};

const normalizeTitle = (value: string) => value.replace(/\s+/g, ' ').trimStart();

export const MoviesSeriesScreen: React.FC<MoviesSeriesScreenProps> = ({ onInterpret, loading }) => {
  const [mediaType, setMediaType] = useState<'movie' | 'series'>(() => {
    const savedType = localStorage.getItem(mediaTypeKey);
    return savedType === 'series' ? 'series' : 'movie';
  });
  const [title, setTitle] = useState('');
  const [spoilerMode, setSpoilerMode] = useState<boolean>(() => {
    return sessionStorage.getItem(sessionSpoilerKey) === 'true';
  });
  const [analysisType, setAnalysisType] = useState(() => {
    return localStorage.getItem(analysisTypeKey) || ANALYSIS_OPTIONS[0];
  });
  const [focusChip, setFocusChip] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem(recentHistoryKey);
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    } catch (_error) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(mediaTypeKey, mediaType);
  }, [mediaType]);

  useEffect(() => {
    localStorage.setItem(analysisTypeKey, analysisType);
  }, [analysisType]);

  useEffect(() => {
    sessionStorage.setItem(sessionSpoilerKey, String(spoilerMode));
  }, [spoilerMode]);

  useEffect(() => {
    if (!toastMessage) return;

    const timeout = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const placeholder = useMemo(() => {
    return mediaType === 'movie'
      ? 'Ex.: Matrix, Interestelar, O Poderoso Chefão...'
      : 'Ex.: Dark, Breaking Bad, Lost...';
  }, [mediaType]);

  const isDisabled = !title.trim() || loading || isSubmitting;

  const persistHistory = (trimmedTitle: string) => {
    const nextHistory = [trimmedTitle, ...history.filter((item) => item !== trimmedTitle)].slice(0, 6);
    setHistory(nextHistory);
    localStorage.setItem(recentHistoryKey, JSON.stringify(nextHistory));
  };

  const handleMediaTypeChange = (value: 'movie' | 'series') => {
    setMediaType(value);
    setTitle('');
    setShowHistory(false);
    analyticsTrack('onToggleMediaType', { mediaType: value });
  };

  const handleChipSelect = (chip: string | null) => {
    setFocusChip(chip);
    if (chip) {
      const mappedAnalysis = ANALYSIS_FROM_CHIP[chip];
      if (mappedAnalysis) {
        setAnalysisType(mappedAnalysis);
      }
    }

    analyticsTrack('onSelectFocusChip', {
      chip: chip || 'none',
      mediaType,
    });
  };

  const handleInterpret = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSubmitting || loading) return;

    setIsSubmitting(true);
    setShowHistory(false);
    persistHistory(trimmedTitle);

    const payload = {
      mediaCategory: 'movies_series',
      mediaType,
      title: trimmedTitle,
      spoilerMode,
      analysisType,
      focusChip: focusChip || undefined,
      userPlan: readCurrentPlan(),
      userId: readUserId(),
    };

    analyticsTrack('onPressInterpretNow', {
      mediaType,
      spoilerMode: String(spoilerMode),
      analysisType,
      hasFocusChip: String(Boolean(focusChip)),
    });

    try {
      const result = await onInterpret(payload);
      if (result && typeof result === 'object' && 'ok' in result && result.ok === false) {
        setToastMessage(result.error || 'Não foi possível interpretar agora. Tente novamente.');
      }
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Erro ao interpretar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    const suggestionMap: Record<SuggestionCard['id'], { analysis: string; chip: string }> = {
      final_explicado: { analysis: ANALYSIS_OPTIONS[0], chip: 'Arco final' },
      simbolismos: { analysis: ANALYSIS_OPTIONS[2], chip: 'Temas' },
      arco_personagens: { analysis: ANALYSIS_OPTIONS[1], chip: 'Personagens' },
    };

    const map = suggestionMap[suggestion.id];
    setAnalysisType(map.analysis);
    setFocusChip(map.chip);

    if (!title.trim()) {
      setTitle(mediaType === 'movie' ? 'Matrix' : 'Dark');
    }

    analyticsTrack('onPressMoviesSuggestion', {
      suggestion: suggestion.id,
      destination: 'example_flow',
    });

    setToastMessage(`Sugestão "${suggestion.title}" aplicada aos filtros.`);
  };

  return (
    <div className="movies-series-screen">
      <MoviesSeriesHeader />

      <main className="movies-series-main">
        <section className="movies-main-card">
          <MediaTypeToggle type={mediaType} onChange={handleMediaTypeChange} />

          <SearchInput
            value={title}
            onChange={(value) => setTitle(normalizeTitle(value))}
            onFocus={() => setShowHistory(true)}
            onBlur={() => {
              setTitle((current) => current.trim());
              window.setTimeout(() => setShowHistory(false), 120);
            }}
            placeholder={placeholder}
            onClear={() => {
              setTitle('');
              setShowHistory(false);
            }}
            examples={mediaType === 'movie' ? ['Matrix', 'Interestelar', 'O Poderoso Chefão'] : ['Dark', 'Breaking Bad', 'Lost']}
            onImageSelect={setImageFile}
          />

          {showHistory && history.length > 0 && !title.trim() && (
            <div className="movies-history-panel">
              <div className="movies-history-title">Recentes</div>
              {history.map((item) => (
                <button
                  type="button"
                  key={item}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setTitle(item);
                    setShowHistory(false);
                  }}
                  className="movies-history-item"
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          <SpoilerToggle hasSpoiler={spoilerMode} onChange={setSpoilerMode} />

          <AnalysisDropdown value={analysisType} onChange={setAnalysisType} options={ANALYSIS_OPTIONS} />

          <FocusChips activeChip={focusChip} onChipClick={handleChipSelect} />

          <InterpretButton onClick={handleInterpret} disabled={isDisabled} loading={loading || isSubmitting} />
        </section>

        <SuggestionsSection
          onSuggestionClick={handleSuggestionClick}
          onViewAll={() => {
            analyticsTrack('onPressViewAllSuggestions', { source: 'movies_series' });
            setToastMessage('Em breve: tela completa de descoberta.');
          }}
        />
      </main>

      {toastMessage && (
        <div className="movies-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
