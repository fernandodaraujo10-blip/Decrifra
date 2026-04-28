import type { ComponentType } from 'react';
import { QuickAccessId } from './HomeIcons';

interface QuickAccessCardProps {
  id: QuickAccessId;
  label: string;
  tone: 'gold' | 'blue' | 'purple' | 'red' | 'green' | 'brown';
  icon: ComponentType;
  onPress: (id: QuickAccessId) => void;
}

export const QuickAccessCard = ({ id, label, icon: Icon, onPress, tone }: QuickAccessCardProps) => {
  return (
    <button className={`quick-access-card tone-${tone}`} onClick={() => onPress(id)} aria-label={`Abrir ${label}`}>
      <div className="quick-access-icon-wrap">
        <Icon />
      </div>
      <span>{label}</span>
    </button>
  );
};
