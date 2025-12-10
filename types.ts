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

export type AppTab = 'home' | 'tools' | 'coach' | 'profile';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface WorkoutTask {
  id: string;
  title: string;
  reps: string; // e.g., "10 mins" or "3 sets"
  category: 'Structure' | 'Skin' | 'Eyes' | 'Body';
  completed: boolean;
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