import React from 'react';

interface ScoreCardProps {
  label: string;
  score: number;
  color?: string;
  fullWidth?: boolean;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, score, color = 'bg-brand-primary', fullWidth = false }) => {
  // Dynamic color based on score if not overridden
  let barColor = color;
  if (score >= 80) barColor = 'bg-brand-accent'; // Green
  else if (score >= 60) barColor = 'bg-brand-primary'; // Purple
  else if (score >= 40) barColor = 'bg-brand-warn'; // Orange
  else barColor = 'bg-brand-danger'; // Red

  return (
    <div className={`bg-brand-card rounded-2xl p-4 flex flex-col justify-between ${fullWidth ? 'col-span-2' : ''}`}>
      <div className="flex flex-col mb-2">
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</span>
        <span className="text-3xl font-bold text-white tracking-tighter">{score}</span>
      </div>
      
      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-2">
        <div 
          className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreCard;