/**
 * Interface for individual metric data
 */
export interface MetricData {
  name: string;
  score: number; // 0-10 scale
  description: string;
}

/**
 * Interface for improvement recommendation
 */
export interface ImprovementRecommendation {
  emoji: string;
  title: string;
  description: string;
}

/**
 * Props for the ResultsScreen component
 */
export interface ResultsScreenProps {
  overallScore: number; // 0-10 scale
  potentialScore: number; // 0-10 scale
  metrics: MetricData[];
  improvements: ImprovementRecommendation[];
  onBack?: () => void;
  onSettings?: () => void;
  onSaveToHistory?: () => void;
  onAnalyzeAgain?: () => void;
}

/**
 * Props for ScoreCard sub-component
 */
export interface ScoreCardProps {
  label: string;
  score: number;
  isPrimary?: boolean;
  animate?: boolean;
}

/**
 * Props for MetricCard sub-component
 */
export interface MetricCardProps {
  metric: MetricData;
  index: number;
}

/**
 * Props for ImprovementCard sub-component
 */
export interface ImprovementCardProps {
  recommendation: ImprovementRecommendation;
  index: number;
}
