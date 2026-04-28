import React, { useEffect, useMemo, useState } from 'react';
import { interpretMovie } from './geminiService';
import { MoviesSeriesScreen } from './src/components/MoviesSeries/MoviesSeriesScreen';
import { MusicScreen } from './src/components/Music/MusicScreen';
import { BooksScreen } from './src/components/Books/BooksScreen';
import { MovieAnalysis } from './types';
import { BottomNavigation, BottomTabId } from './src/components/Home/BottomNavigation';
import { DiscoveryId, QuickAccessId } from './src/components/Home/HomeIcons';
import { HomeScreen } from './src/components/Home/HomeScreen';
import { LegalLinks } from './src/components/LegalLinks';



type Tab =
  | 'home'
  | 'movies'
  | 'books'
  | 'music'
  | 'store'
  | 'config'
  | 'favorites'
  | 'trending'
  | 'stats'
  | 'history';

interface AppState {
  favorites: any[];
  searchHistory: string[];
  filters: any;
  userPlan: 'free' | 'premium' | 'pro';
  homeProgressCache: number;
  config: {
    language: string;
    notifications: boolean;
    theme: 'light' | 'dark';
  };
}

const analyticsTrack = (event: string, payload: Record<string, string>) => {
  const eventsRaw = localStorage.getItem('decifra_analytics_events');
  const events = eventsRaw ? JSON.parse(eventsRaw) : [];
  events.push({ event, payload, at: new Date().toISOString() });
  localStorage.setItem('decifra_analytics_events', JSON.stringify(events.slice(-100)));
};

const App: React.FC = () => {
  const getValidTab = (saved: string | null): Tab => {
    const validTabs: Tab[] = ['home', 'movies', 'books', 'music', 'store', 'config', 'favorites', 'trending', 'stats', 'history'];
    if (saved && validTabs.includes(saved as Tab)) return saved as Tab;
    return 'home';
  };

  const [activeTab, setActiveTab] = useState<Tab>(() => getValidTab(localStorage.getItem('decifra_last_nav')));
  const [loading, setLoading] = useState(true);
  const [interpreting, setInterpreting] = useState(false);
  const [analysis, setAnalysis] = useState<MovieAnalysis | null>(null);

  const [state, setState] = useState<AppState>({
    favorites: [],
    searchHistory: [],
    filters: {},
    userPlan: 'free',
    homeProgressCache: 0,
    config: {
      language: 'pt-BR',
      notifications: true,
      theme: 'light',
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem('decifra_state');
    if (saved) {
      try {
        setState((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch (error) {
        console.error('Erro ao carregar estado:', error);
      }
    }

    setTimeout(() => setLoading(false), 900);
  }, []);

  useEffect(() => {
    localStorage.setItem('decifra_state', JSON.stringify(state));
  }, [state]);

  const handleTabChange = React.useCallback((tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem('decifra_last_nav', tab);
    setAnalysis(null);

    analyticsTrack('onPressBottomNav', { tab });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);


  const handleProgressLoaded = React.useCallback((value: number) => {
    setState((prev) => ({ ...prev, homeProgressCache: value }));
  }, []);

  const handlePressSettings = React.useCallback(() => {
    analyticsTrack('onPressSettings', { source: 'hero' });
    handleTabChange('config');
  }, [handleTabChange]);

  const handlePressStatistics = React.useCallback(() => {
    analyticsTrack('onPressStatistics', { source: 'status_card' });
    handleTabChange('stats');
  }, [handleTabChange]);

  const handlePressHistory = React.useCallback(() => {
    analyticsTrack('onPressHistory', { source: 'status_card' });
    handleTabChange('history');
  }, [handleTabChange]);


  const handleBottomNav = (tab: BottomTabId) => {
    const map: Record<BottomTabId, Tab> = {
      home: 'home',
      movies_series: 'movies',
      books: 'books',
      music: 'music',
      store: 'store',
      settings: 'config',
    };

    handleTabChange(map[tab]);
  };

  const handleQuickAccess = (category: QuickAccessId) => {
    localStorage.setItem('decifra_last_quick_access', category);
    analyticsTrack('onPressQuickAccess', { category });

    const routeMap: Record<QuickAccessId, Tab> = {
      moviesSeries: 'movies',
      books: 'books',
      music: 'music',
      favorites: 'favorites',
      trending: 'trending',
      store: 'store',
    };

    handleTabChange(routeMap[category]);
  };

  const handleDiscovery = (cardType: DiscoveryId) => {
    localStorage.setItem('decifra_last_discovery', cardType);
    analyticsTrack('onPressDiscovery', { cardType });

    const messages: Record<DiscoveryId, string> = {
      finalExplained: 'Fluxo de sugestão temática: foco em desfecho e final explicado.',
      hiddenLayers: 'Fluxo de sugestão temática: foco em símbolos, subtexto e camadas ocultas.',
      centralMessage: 'Fluxo de sugestão temática: foco na mensagem central da obra.',
    };

    alert(messages[cardType]);
  };

  // Reset analysis on tab change to prevent showing previous results in wrong category
  useEffect(() => {
    setAnalysis(null);
  }, [activeTab]);

  const runAnalysis = async (payload: any): Promise<{ ok: boolean; error?: string }> => {
    setInterpreting(true);
    setAnalysis(null);
    console.log("Iniciando análise com payload:", payload);
    
    try {
      const title = payload.title || payload.query || 'Desconhecido';
      const contentType = payload.type || (activeTab === 'movies' ? 'filme' : activeTab === 'books' ? 'livro' : 'musica');
      
      console.log("📡 Chamando interpretMovie para:", title);
      const result = await interpretMovie(title, 'profundo', contentType, payload);
      
      console.log("✅ Resultado recebido com sucesso!");
      setAnalysis(result);
      return { ok: true };
    } catch (error) {
      console.error("❌ ERRO DURANTE ANALISE:", error);
      const msg = error instanceof Error ? error.message : 'Erro interno no motor de IA';
      alert(`FALHA NA PESQUISA: ${msg}\n\nVerifique sua conexão e tente novamente.`);
      return {
        ok: false,
        error: msg,
      };
    } finally {
      console.log("🏁 Finalizando estado de interpretação.");
      setInterpreting(false);
    }
  };

  const bottomActive = useMemo<BottomTabId>(() => {
    if (activeTab === 'movies') return 'movies_series';
    if (activeTab === 'config') return 'settings';
    if (activeTab === 'books') return 'books';
    if (activeTab === 'music') return 'music';
    if (activeTab === 'store') return 'store';
    return 'home';
  }, [activeTab]);

  const renderLoading = () => (
    <div className="loading-container" style={{ height: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  const renderInterpretationResult = () => {
    if (!analysis) return null;

    return (
      <div className="animate-in fade-in result-screen-container">
        <button onClick={() => setAnalysis(null)} className="back-button">← Voltar para Busca</button>
        <div className="card result-card-premium">
          <h2 className="serif result-title">{analysis.info.originalTitle}</h2>
          <p className="result-meta">{analysis.info.year} • {analysis.info.director}</p>
          <div className="result-content">
            <p className="serif result-quote">"{analysis.info.synopsis}"</p>
            <div className="result-highlight">
              <span>Tese Central</span>
              <p>{analysis.exegesis.centralThesis}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPlaceholder = (title: string, description: string) => (
    <div className="animate-in fade-in flex flex-col min-h-screen bg-gray-50 pb-20 pt-10 px-4">
      <h2 className="serif text-3xl font-bold text-gray-800 mb-6" style={{ fontSize: '2.4rem' }}>{title}</h2>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', borderRadius: '32px' }}>
        <p style={{ color: '#8e8377', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{description}</p>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <main className={`content-area ${activeTab === 'home' ? 'home-content-area' : 'full-width-screen'}`}>
        {loading ? (
          renderLoading()
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                cachedProgress={state.homeProgressCache}
                onProgressLoaded={handleProgressLoaded}
                onPressSettings={handlePressSettings}
                onPressStatistics={handlePressStatistics}
                onPressHistory={handlePressHistory}
                onPressQuickAccess={handleQuickAccess}
                onPressDiscovery={handleDiscovery}
              />
            )}

            {activeTab === 'movies' && (analysis ? renderInterpretationResult() : <MoviesSeriesScreen loading={interpreting} onInterpret={runAnalysis} />)}
            {activeTab === 'books' && (analysis ? renderInterpretationResult() : <BooksScreen loading={interpreting} onInterpret={runAnalysis} />)}
            {activeTab === 'music' && (analysis ? renderInterpretationResult() : <MusicScreen loading={interpreting} onInterpret={runAnalysis} />)}
            {activeTab === 'store' && renderPlaceholder('Loja', 'Em breve: curadoria premium e benefícios exclusivos.')}
            {activeTab === 'favorites' && renderPlaceholder('Favoritos', 'Aqui você verá sua lista de conteúdos salvos.')}
            {activeTab === 'trending' && renderPlaceholder('Tendências', 'Descobertas em alta e sugestões do dia serão exibidas aqui.')}
            {activeTab === 'stats' && renderPlaceholder('Estatísticas', 'Painel de métricas de exploração do usuário (em construção).')}
            {activeTab === 'history' && renderPlaceholder('Histórico', 'Seu histórico de interpretações aparecerá nesta seção.')}
            {activeTab === 'config' && (
              <div className="animate-in fade-in flex flex-col min-h-screen bg-gray-50 pb-20 pt-10 px-4">
                <h2 className="serif text-3xl font-bold text-gray-800 mb-6" style={{ fontSize: '2.4rem' }}>Configurações</h2>
                <div className="card" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '32px' }}>
                  <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f0ede8' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4a3728' }}>Idioma</span>
                    <span style={{ fontSize: '0.9rem', color: '#8e8377' }}>Português</span>
                  </div>
                  <div className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f0ede8' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4a3728' }}>Notificações</span>
                    <div style={{ width: '40px', height: '24px', backgroundColor: '#a6792a', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '4px', justifyContent: 'flex-end' }}>
                       <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4a3728' }}>Plano Atual</span>
                    <span style={{ padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(166,121,42,0.3)', backgroundColor: 'rgba(166,121,42,0.05)', fontSize: '0.7rem', fontWeight: 800, color: '#a6792a', textTransform: 'uppercase' }}>{state.userPlan}</span>
                  </div>
                </div>
                <button
                  style={{ 
                    width: '100%', height: '52px', borderRadius: '16px', 
                    background: 'linear-gradient(to right, #b3554f, #d66d67)', color: '#fff', 
                    fontWeight: 700, border: 'none', boxShadow: '0 8px 20px rgba(179, 85, 79, 0.25)' 
                  }}
                  onClick={() => {
                    if (confirm('Deseja resetar todos os dados?')) {
                      localStorage.removeItem('decifra_state');
                      localStorage.removeItem('decifra_home_dynamic');
                      window.location.reload();
                    }
                  }}
                >
                  Limpar Dados
                </button>

                <div style={{ marginTop: 'auto', padding: '40px 0 20px 0' }}>
                  <LegalLinks />
                </div>
              </div>


            )}
          </>
        )}
      </main>

      <footer style={{ padding: '10px 20px', textAlign: 'center', opacity: 0.5 }}>
        <p style={{ fontSize: '10px', color: '#8e8377' }}>Build: 280426-v2 • <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ textDecoration: 'underline' }}>Limpar App</button></p>
      </footer>
      <BottomNavigation activeTab={bottomActive} onPressBottomNav={handleBottomNav} />
    </div>
  );
};

export default App;
