import { DiscoveryId } from './HomeIcons';
import { DiscoveryCard } from './DiscoveryCard';

interface DiscoveryTodaySectionProps {
  onPressDiscovery: (id: DiscoveryId) => void;
  cards: {
    id: DiscoveryId;
    title: string;
    imageUrl: string;
  }[];
}

export const DiscoveryTodaySection = ({ cards, onPressDiscovery }: DiscoveryTodaySectionProps) => {
  return (
    <section>
      <h3 className="home-section-title">Sua Descoberta Hoje</h3>
      <div className="discovery-list" role="list">
        {cards.map((card) => (
          <DiscoveryCard key={card.id} {...card} onPress={onPressDiscovery} />
        ))}
      </div>
    </section>
  );
};
