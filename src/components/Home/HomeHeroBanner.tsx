import { SettingsIcon } from './HomeIcons';

interface HomeHeroBannerProps {
  onPressSettings: () => void;
}

export const HomeHeroBanner = ({ onPressSettings }: HomeHeroBannerProps) => {
  return (
    <section className="home-hero" aria-label="Banner principal do Decifra">
      <button className="home-hero-settings" onClick={onPressSettings} aria-label="Abrir Configurações">
        <SettingsIcon />
      </button>

      <div className="home-hero-content">
        <div className="home-logo-mark" aria-hidden="true">
          <span>D</span>
        </div>
        <div>
          <h1>DECIFRA APP</h1>
          <p>Filmes, séries, músicas e livros com interpretação inteligente</p>
          <div className="home-hero-divider" aria-hidden="true">✦</div>
          <strong>Revele as camadas por trás de cada obra.</strong>
        </div>
      </div>
    </section>
  );
};
