import { BookIcon, FilmIcon, HomeIcon, MusicIcon, SettingsIcon, StoreIcon } from './HomeIcons';
import { NavItem } from './NavItem';

export type BottomTabId = 'home' | 'movies_series' | 'books' | 'music' | 'store' | 'settings';

interface BottomNavigationProps {
  activeTab: BottomTabId;
  onPressBottomNav: (tab: BottomTabId) => void;
}

const navItems = [
  { id: 'home', label: 'HOME', icon: HomeIcon },
  { id: 'movies_series', label: 'FILMES', icon: FilmIcon },
  { id: 'books', label: 'LIVROS', icon: BookIcon },
  { id: 'music', label: 'MÚSICA', icon: MusicIcon },
  { id: 'store', label: 'LOJA', icon: StoreIcon },
  { id: 'settings', label: 'CONFIG.', icon: SettingsIcon },
] as const;

export const BottomNavigation = ({ activeTab, onPressBottomNav }: BottomNavigationProps) => {
  return (
    <nav className="home-bottom-nav" aria-label="Navegação principal">
      {navItems.map((item) => (
        <NavItem
          key={item.id}
          label={item.label}
          icon={item.icon}
          active={activeTab === item.id}
          onPress={() => onPressBottomNav(item.id)}
        />
      ))}
    </nav>
  );
};

