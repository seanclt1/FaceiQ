import React from 'react';
import { ChevronLeft, Settings, ArrowUp } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useProgressBar } from '../hooks/useProgressBar';
import {
  ResultsScreenProps,
  ScoreCardProps,
  MetricCardProps,
  ImprovementCardProps,
} from './ResultsScreen.types';

/**
 * Hero Score Card Component
 * Displays overall or potential score with count-up animation
 */
const HeroScoreCard: React.FC<ScoreCardProps> = ({ label, score, isPrimary = false }) => {
  const animatedScore = useCountUp(score, 1500, 0);

  return (
    <div className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-5 flex-1 flex flex-col items-center justify-center min-h-[140px]">
      <p className="text-[10px] font-semibold tracking-[0.15em] text-zinc-500 uppercase mb-3">
        {label}
      </p>
      <p
        className={`text-5xl font-bold tabular-nums ${
          isPrimary ? 'text-purple-500' : 'text-white'
        }`}
      >
        {animatedScore.toFixed(1)}
      </p>
    </div>
  );
};

/**
 * Metric Card Component with Progress Bar
 * Displays individual metric with animated progress bar
 */
const MetricCard: React.FC<MetricCardProps> = ({ metric, index }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const progress = useProgressBar((metric.score / 10) * 100, isVisible, 1200);

  return (
    <div
      ref={ref}
      className="py-5 border-b border-zinc-900 last:border-b-0 transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-zinc-200">{metric.name}</h4>
        <span className="text-sm font-bold text-white tabular-nums">
          {metric.score.toFixed(1)}/10
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed">{metric.description}</p>
    </div>
  );
};

/**
 * Improvement Recommendation Card
 * Displays actionable improvement suggestions
 */
const ImprovementCard: React.FC<ImprovementCardProps> = ({ recommendation, index }) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4 transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${index * 100}ms`,
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5">{recommendation.emoji}</span>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-white mb-1">{recommendation.title}</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {recommendation.description}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Main ResultsScreen Component
 * Production-ready FaceIQ Results Screen with Swiss/Apple aesthetic
 */
const ResultsScreen: React.FC<ResultsScreenProps> = ({
  overallScore,
  potentialScore,
  metrics,
  improvements,
  onBack,
  onSettings,
  onSaveToHistory,
  onAnalyzeAgain,
}) => {
  const improvementGap = potentialScore - overallScore;

  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-zinc-400 hover:text-white active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>

          <h1 className="text-[11px] font-semibold tracking-[0.2em] text-zinc-300 uppercase">
            Analysis Results
          </h1>

          <button
            onClick={onSettings}
            className="p-2 -mr-2 text-zinc-400 hover:text-white active:scale-95 transition-all"
            aria-label="Settings"
          >
            <Settings size={20} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 pt-24 pb-32">
        {/* Hero Score Cards */}
        <section className="mb-6">
          <div className="flex gap-3 mb-4">
            <HeroScoreCard label="OVERALL" score={overallScore} />
            <HeroScoreCard label="POTENTIAL" score={potentialScore} isPrimary />
          </div>

          {/* Improvement Gap Indicator */}
          {improvementGap > 0 && (
            <div className="flex items-center justify-center gap-2 text-purple-500">
              <ArrowUp size={16} strokeWidth={3} />
              <p className="text-sm font-semibold">
                +{improvementGap.toFixed(1)} Potential Growth
              </p>
            </div>
          )}
        </section>

        {/* Detailed Metrics Section */}
        <section className="mb-8">
          <h2 className="text-[11px] font-semibold tracking-[0.15em] text-zinc-500 uppercase mb-4 px-1">
            Your Metrics
          </h2>
          <div className="bg-[#0a0a0a] border border-zinc-900 rounded-2xl px-5">
            {metrics.map((metric, index) => (
              <MetricCard key={metric.name} metric={metric} index={index} />
            ))}
          </div>
        </section>

        {/* Improvement Plan Section */}
        <section className="mb-6">
          <h2 className="text-[11px] font-semibold tracking-[0.15em] text-zinc-500 uppercase mb-4 px-1">
            Your Improvement Plan
          </h2>
          <div className="space-y-3">
            {improvements.map((recommendation, index) => (
              <ImprovementCard
                key={recommendation.title}
                recommendation={recommendation}
                index={index}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Fixed Bottom Action Buttons */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-8">
        <div className="max-w-md mx-auto px-5 flex items-center gap-3">
          <button
            onClick={onSaveToHistory}
            className="flex-[3] bg-white text-black font-semibold text-sm py-4 rounded-full active:scale-95 transition-all shadow-lg"
          >
            Save to History
          </button>
          <button
            onClick={onAnalyzeAgain}
            className="flex-[2] bg-transparent border-2 border-white text-white font-semibold text-sm py-4 rounded-full active:scale-95 transition-all"
          >
            Analyze Again
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ResultsScreen;
