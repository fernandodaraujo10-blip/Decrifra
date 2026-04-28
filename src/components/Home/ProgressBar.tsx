interface ProgressBarProps {
  value: number;
}

export const ProgressBar = ({ value }: ProgressBarProps) => {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="home-progress-track" aria-label="Barra de progresso">
      <div className="home-progress-fill" style={{ width: `${safeValue}%` }} />
    </div>
  );
};
