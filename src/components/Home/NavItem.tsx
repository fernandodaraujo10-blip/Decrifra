import type { ComponentType } from 'react';

interface NavItemProps {
  label: string;
  icon: ComponentType;
  active: boolean;
  onPress: () => void;
}

export const NavItem = ({ label, icon: Icon, active, onPress }: NavItemProps) => {
  return (
    <button 
      className={`home-nav-item ${active ? 'active' : ''}`} 
      onClick={onPress} 
      aria-label={`Navegar para ${label}`}
    >
      <Icon />
      <span>{label}</span>
    </button>
  );
};
