import { ClockIcon, StatsIcon, ChevronRightIcon } from './HomeIcons';
import { ProgressBar } from './ProgressBar';

interface ExplorationStatusCardProps {
  progress: number;
  onPressStatistics: () => void;
  onPressHistory: () => void;
}

export const ExplorationStatusCard = ({
  progress,
  onPressStatistics,
  onPressHistory,
}: ExplorationStatusCardProps) => {
  return (
    <section className="home-status-card" aria-label="Status de exploração">
      <p className="home-status-label">STATUS DE EXPLORAÇÃO</p>
      <div className="home-status-row">
        <h2>Seu progresso de descobertas</h2>
        <strong>{progress}%</strong>
      </div>

      <ProgressBar value={progress} />

      <div className="home-status-actions">
        <button onClick={onPressStatistics} className="home-status-btn" aria-label="Abrir Estatísticas">
          <StatsIcon />
          <span>ESTATÍSTICAS</span>
        </button>

        <button onClick={onPressHistory} className="home-status-btn" aria-label="Abrir Histórico">
          <ClockIcon />
          <span>HISTÓRICO</span>
          <ChevronRightIcon />
        </button>
      </div>
    </section>
  );
};
