export interface AnalysisResult {
  scores: {
    overall: number;
    potential: number;
    masculinity: number;
    jawline: number;
    skinQuality: number;
    cheekbones: number;
    eyeArea: number;
  };
  tier: string; // e.g., "Chad Lite", "High Tier Normie"
  feedback: string[];
  improvements: {
    area: string;
    advice: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

export interface MogResult {
  winnerIndex: 0 | 1; // 0 is Left image, 1 is Right image
  winnerTitle: string; // e.g., "TOTAL DOMINATION", "CLOSE CALL"
  diffScore: number; // How much they won by
  reason: string; // The specific feature that won the battle
  roast: string; // A short brutal comment about the loser
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export enum AppTab {
  SCAN = 'scan',
  EXTRAS = 'extras',
  DAILY = 'daily',
  COACH = 'coach'
}

export const TIER_MAP = [
  { min: 0, label: 'Sub 5' },
  { min: 50, label: 'Low Tier Normie' },
  { min: 60, label: 'Mid Tier Normie' },
  { min: 70, label: 'High Tier Normie' },
  { min: 80, label: 'Chad Lite' },
  { min: 90, label: 'Chad' },
  { min: 95, label: 'True Adam' },
];

export const DAILY_TASKS = [
  { id: 1, title: 'Oval face styling', icon: '💇‍♂️' },
  { id: 2, title: 'Lower your body fat', icon: '🏋️' },
  { id: 3, title: 'Lip health', icon: '👄' },
  { id: 4, title: 'Tighten facial skin', icon: '🧖' },
  { id: 5, title: 'Mewing session (10m)', icon: '👅' },
];

export const COACH_TOPICS = [
  { id: 'overall', title: 'Improve myself overall', icon: '🔥', color: 'from-purple-500 to-pink-500' },
  { id: 'muscle', title: 'Gain more muscle', icon: '💪', color: 'from-emerald-400 to-cyan-500' },
  { id: 'fat', title: 'Lose body fat', icon: '🏃', color: 'from-orange-400 to-red-500' },
  { id: 'skin', title: 'Get clear skin', icon: '🧴', color: 'from-yellow-300 to-lime-500' },
  { id: 'jaw', title: 'Sharpen my jawline', icon: '🗿', color: 'from-blue-500 to-indigo-500' },
];