export type QuickAccessId =
  | 'moviesSeries'
  | 'books'
  | 'music'
  | 'favorites'
  | 'trending'
  | 'store';

export type DiscoveryId = 'finalExplained' | 'hiddenLayers' | 'centralMessage';

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const HomeIcon = () => (
  <svg {...iconProps}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

export const FilmIcon = () => (
  <svg {...iconProps}><rect width="18" height="14" x="3" y="6" rx="2"/><path d="M7 6V4"/><path d="M12 6V4"/><path d="M17 6V4"/><path d="M7 20v-2"/><path d="M12 20v-2"/><path d="M17 20v-2"/></svg>
);

export const BookIcon = () => (
  <svg {...iconProps}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h8"/></svg>
);

export const MusicIcon = () => (
  <svg {...iconProps}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
);

export const StoreIcon = () => (
  <svg {...iconProps}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>
);

export const SettingsIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3.17 14H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.17A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 8.92 4a1.65 1.65 0 0 0 1-1.51V2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.49A1.65 1.65 0 0 0 14.9 4a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.2 9c0 .68.43 1.28 1.06 1.5.14.05.3.08.46.08H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.28c-.16 0-.32.03-.46.08-.63.22-1.06.82-1.06 1.5Z"/></svg>
);

export const HeartIcon = () => (
  <svg {...iconProps}><path d="m12 21-1.7-1.55C5 14.6 2 11.86 2 8.5 2 5.76 4.24 3.5 7 3.5c1.57 0 3.08.73 4 1.88.92-1.15 2.43-1.88 4-1.88 2.76 0 5 2.26 5 5 0 3.36-3 6.1-8.3 10.96Z"/></svg>
);

export const TrendingIcon = () => (
  <svg {...iconProps}><path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
);

export const ClockIcon = () => (
  <svg {...iconProps}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
);

export const StatsIcon = () => (
  <svg {...iconProps}><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>
);

export const ChevronRightIcon = () => (
  <svg {...iconProps}><path d="m9 18 6-6-6-6"/></svg>
);
