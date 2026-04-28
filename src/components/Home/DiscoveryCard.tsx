import { DiscoveryId } from './HomeIcons';

interface DiscoveryCardProps {
  id: DiscoveryId;
  title: string;
  imageUrl: string;
  onPress: (id: DiscoveryId) => void;
}

export const DiscoveryCard = ({ id, title, imageUrl, onPress }: DiscoveryCardProps) => {
  return (
    <button className="discovery-card" onClick={() => onPress(id)} aria-label={`Abrir ${title}`}>
      <img src={imageUrl} alt={title} loading="lazy" />
      <div className="discovery-overlay" />
      <strong>{title}</strong>
    </button>
  );
};
