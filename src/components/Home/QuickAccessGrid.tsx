import { BookIcon, FilmIcon, HeartIcon, MusicIcon, QuickAccessId, StoreIcon, TrendingIcon } from './HomeIcons';
import { QuickAccessCard } from './QuickAccessCard';

interface QuickAccessGridProps {
  onPressQuickAccess: (id: QuickAccessId) => void;
}

const cards = [
  { id: 'moviesSeries', label: 'Filmes e Séries', icon: FilmIcon, tone: 'gold' },
  { id: 'books', label: 'Livros', icon: BookIcon, tone: 'blue' },
  { id: 'music', label: 'Músicas', icon: MusicIcon, tone: 'purple' },
  { id: 'favorites', label: 'Favoritos', icon: HeartIcon, tone: 'red' },
  { id: 'trending', label: 'Tendências', icon: TrendingIcon, tone: 'green' },
  { id: 'store', label: 'Loja', icon: StoreIcon, tone: 'brown' },
] as const;

export const QuickAccessGrid = ({ onPressQuickAccess }: QuickAccessGridProps) => {
  return (
    <section>
      <h3 className="home-section-title">Acesso Rápido</h3>
      <div className="quick-access-grid">
        {cards.map((card) => (
          <QuickAccessCard key={card.id} {...card} onPress={onPressQuickAccess} />
        ))}
      </div>
    </section>
  );
};
