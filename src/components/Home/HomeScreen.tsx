import { useEffect, useMemo, useState } from 'react';
import { DiscoveryId, QuickAccessId } from './HomeIcons';
import { HomeHeroBanner } from './HomeHeroBanner';
import { ExplorationStatusCard } from './ExplorationStatusCard';
import { QuickAccessGrid } from './QuickAccessGrid';
import { DiscoveryTodaySection } from './DiscoveryTodaySection';

interface HomeScreenProps {
  cachedProgress: number;
  onProgressLoaded: (value: number) => void;
  onPressSettings: () => void;
  onPressStatistics: () => void;
  onPressHistory: () => void;
  onPressQuickAccess: (id: QuickAccessId) => void;
  onPressDiscovery: (id: DiscoveryId) => void;
}

type HomeFetchState = 'loading' | 'empty' | 'error' | 'success';

interface HomeDynamicData {
  interpretationsCount: number;
  categoriesUsed: number;
  savedContentCount: number;
  discoveryCards?: {
    id: DiscoveryId;
    title: string;
    imageUrl: string;
  }[];
}

const fallbackDiscovery = [
  {
    id: 'finalExplained' as const,
    title: 'FINAL EXPLICADO',
    imageUrl: 'https://images.unsplash.com/photo-1489599735734-79b4ee2b1e27?q=80&w=987&auto=format&fit=crop',
  },
  {
    id: 'hiddenLayers' as const,
    title: 'CAMADAS OCULTAS',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=987&auto=format&fit=crop',
  },
  {
    id: 'centralMessage' as const,
    title: 'MENSAGEM CENTRAL',
    imageUrl: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=987&auto=format&fit=crop',
  },
];

const calculateExplorationProgress = (data: HomeDynamicData | null): number => {
  if (!data) return 0;

  const interpretationsScore = Math.min(50, data.interpretationsCount * 5);
  const categoriesScore = Math.min(30, data.categoriesUsed * 10);
  const savedContentScore = Math.min(20, data.savedContentCount * 4);

  return Math.min(100, interpretationsScore + categoriesScore + savedContentScore);
};

export const HomeScreen = ({
  cachedProgress,
  onProgressLoaded,
  onPressSettings,
  onPressStatistics,
  onPressHistory,
  onPressQuickAccess,
  onPressDiscovery,
}: HomeScreenProps) => {
  const [fetchState, setFetchState] = useState<HomeFetchState>('loading');
  const [progress, setProgress] = useState<number>(cachedProgress);
  const [discoveryCards, setDiscoveryCards] = useState(fallbackDiscovery);

  useEffect(() => {
    let mounted = true;

    const loadHomeData = async () => {
      setFetchState('loading');
      try {
        await new Promise((resolve) => setTimeout(resolve, 700));
        const raw = localStorage.getItem('decifra_home_dynamic');

        if (!raw) {
          if (!mounted) return;
          setFetchState('empty');
          setProgress(0);
          onProgressLoaded(0);
          return;
        }

        const parsed = JSON.parse(raw) as HomeDynamicData;
        const computedProgress = calculateExplorationProgress(parsed);

        if (!mounted) return;
        setProgress(computedProgress);
        onProgressLoaded(computedProgress);
        setDiscoveryCards(parsed.discoveryCards && parsed.discoveryCards.length ? parsed.discoveryCards : fallbackDiscovery);
        setFetchState('success');
      } catch (error) {
        console.error('Falha ao carregar dados da Home', error);
        if (!mounted) return;
        setFetchState('error');
        setProgress(0);
        onProgressLoaded(0);
      }
    };

    loadHomeData();

    return () => {
      mounted = false;
    };
  }, [onProgressLoaded]);

  const showToast = fetchState === 'error';
  const cardsToShow = useMemo(() => discoveryCards, [discoveryCards]);

  if (fetchState === 'loading') {
    return (
      <div className="home-screen">
        <div className="home-skeleton hero" />
        <div className="home-skeleton status" />
        <div className="home-skeleton title" />
        <div className="home-skeleton-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="home-skeleton card" />
          ))}
        </div>
        <div className="home-skeleton title" />
        <div className="home-skeleton-row">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="home-skeleton discovery" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <HomeHeroBanner onPressSettings={onPressSettings} />
      <ExplorationStatusCard
        progress={progress}
        onPressStatistics={onPressStatistics}
        onPressHistory={onPressHistory}
      />
      <QuickAccessGrid onPressQuickAccess={onPressQuickAccess} />
      <DiscoveryTodaySection cards={cardsToShow} onPressDiscovery={onPressDiscovery} />
      {showToast && <div className="home-toast">Falha ao carregar conteúdos dinâmicos. Exibindo fallback local.</div>}
    </div>
  );
};
