import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Settings, TrendingUp, Droplet, Camera, Zap, Moon } from 'lucide-react';

// ========================
// TYPESCRIPT INTERFACES
// ========================

interface MetricData {
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

interface RecommendationCard {
  icon: string;
  title: string;
  description: string;
  category: 'hydration' | 'photo' | 'consistency' | 'quick-win';
}

interface ResultsScreenProps {
  overallScore?: number;
  potentialScore?: number;
  metrics?: MetricData[];
  recommendations?: RecommendationCard[];
  onBack?: () => void;
  onSettings?: () => void;
  onSaveToHistory?: () => void;
  onAnalyzeAgain?: () => void;
}

// ========================
// SCROLL REVEAL HOOK
// ========================

const useScrollReveal = () => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return visibleElements;
};

// ========================
// COUNT UP ANIMATION HOOK
// ========================

const useCountUp = (end: number, duration: number = 1500, shouldStart: boolean = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Ease-out cubic function for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      setCount(startValue + (end - startValue) * easeOutCubic);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, shouldStart]);

  return count;
};

// ========================
// PROGRESS BAR COMPONENT
// ========================

const ProgressBar: React.FC<{ value: number; max: number; isVisible: boolean }> = ({
  value,
  max,
  isVisible
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-1000 ease-out"
        style={{
          width: isVisible ? `${percentage}%` : '0%',
          transitionDelay: isVisible ? '100ms' : '0ms'
        }}
      />
    </div>
  );
};

// ========================
// MAIN COMPONENT
// ========================

const ResultsScreen: React.FC<ResultsScreenProps> = ({
  overallScore = 5.0,
  potentialScore = 7.5,
  metrics = [
    { name: 'Facial Symmetry', score: 7.8, maxScore: 10, description: 'Well-balanced facial structure' },
    { name: 'Skin Quality', score: 6.5, maxScore: 10, description: 'Good baseline with room for improvement' },
    { name: 'Proportions', score: 7.2, maxScore: 10, description: 'Strong golden ratio alignment' },
    { name: 'Facial Harmony', score: 7.0, maxScore: 10, description: 'Features work well together' },
    { name: 'Feature Definition', score: 7.4, maxScore: 10, description: 'Clear and distinct features' },
    { name: 'Overall Balance', score: 7.1, maxScore: 10, description: 'Harmonious appearance' },
  ],
  recommendations = [
    {
      icon: '💧',
      title: 'Hydration',
      description: 'Increase water intake to 3L daily for improved skin elasticity and glow',
      category: 'hydration'
    },
    {
      icon: '📸',
      title: 'Photo Technique',
      description: 'Try natural lighting at golden hour for more accurate facial assessment',
      category: 'photo'
    },
    {
      icon: '💪',
      title: 'Consistency',
      description: 'Maintain routine for 30 days to see measurable improvements',
      category: 'consistency'
    },
    {
      icon: '⚡',
      title: 'Quick Win',
      description: 'Get 7-8 hours sleep nightly to reduce under-eye darkness',
      category: 'quick-win'
    },
  ],
  onBack = () => console.log('Back clicked'),
  onSettings = () => console.log('Settings clicked'),
  onSaveToHistory = () => console.log('Save clicked'),
  onAnalyzeAgain = () => console.log('Analyze again clicked'),
}) => {
  const visibleElements = useScrollReveal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const overallCount = useCountUp(overallScore, 1500, mounted);
  const potentialCount = useCountUp(potentialScore, 1500, mounted);
  const improvementGap = potentialScore - overallScore;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-y-auto pb-32">
      {/* ======================== */}
      {/* HEADER */}
      {/* ======================== */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-900 px-5 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-zinc-900 rounded-full transition-colors active:scale-95"
            aria-label="Go back"
          >
            <ChevronLeft size={24} className="text-zinc-300" />
          </button>

          <h1 className="text-[11px] font-light tracking-[0.2em] uppercase text-zinc-400">
            Analysis Results
          </h1>

          <button
            onClick={onSettings}
            className="p-2 -mr-2 hover:bg-zinc-900 rounded-full transition-colors active:scale-95"
            aria-label="Settings"
          >
            <Settings size={20} className="text-zinc-300" />
          </button>
        </div>
      </header>

      {/* ======================== */}
      {/* MAIN CONTENT */}
      {/* ======================== */}
      <main className="max-w-md mx-auto px-5 pt-8">

        {/* HERO SCORE CARDS */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Overall Score */}
          <div
            className="bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center"
            data-animate
            id="overall-card"
          >
            <p className="text-[10px] font-light tracking-[0.15em] uppercase text-zinc-500 mb-3">
              Overall
            </p>
            <p className="text-5xl font-extralight tabular-nums text-white">
              {overallCount.toFixed(1)}
            </p>
          </div>

          {/* Potential Score */}
          <div
            className="bg-[#0a0a0a] border border-purple-900/30 rounded-2xl p-6 flex flex-col items-center justify-center"
            data-animate
            id="potential-card"
          >
            <p className="text-[10px] font-light tracking-[0.15em] uppercase text-purple-400/70 mb-3">
              Potential
            </p>
            <p className="text-5xl font-extralight tabular-nums text-purple-400">
              {potentialCount.toFixed(1)}
            </p>
          </div>
        </div>

        {/* IMPROVEMENT GAP */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <TrendingUp size={16} className="text-purple-400" />
          <p className="text-sm font-medium text-purple-400">
            +{improvementGap.toFixed(1)} Potential Growth
          </p>
        </div>

        {/* ======================== */}
        {/* DETAILED METRICS */}
        {/* ======================== */}
        <section className="mb-12">
          <h2 className="text-[11px] font-light tracking-[0.2em] uppercase text-zinc-500 mb-6">
            Your Metrics
          </h2>

          <div className="space-y-0">
            {metrics.map((metric, index) => (
              <div
                key={metric.name}
                id={`metric-${index}`}
                data-animate
                className={`py-6 border-b border-zinc-900 last:border-b-0 transition-opacity duration-500`}
                style={{
                  opacity: visibleElements.has(`metric-${index}`) ? 1 : 0,
                  transitionDelay: `${index * 100}ms`
                }}
              >
                {/* Metric Header */}
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-base font-normal text-zinc-200">
                    {metric.name}
                  </h3>
                  <p className="text-sm font-light text-zinc-400 tabular-nums">
                    {metric.score.toFixed(1)}/{metric.maxScore}
                  </p>
                </div>

                {/* Progress Bar */}
                <ProgressBar
                  value={metric.score}
                  max={metric.maxScore}
                  isVisible={visibleElements.has(`metric-${index}`)}
                />

                {/* Description */}
                <p className="text-xs font-light text-zinc-500 mt-2 leading-relaxed">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ======================== */}
        {/* IMPROVEMENT PLAN */}
        {/* ======================== */}
        <section className="mb-8">
          <h2 className="text-[11px] font-light tracking-[0.2em] uppercase text-zinc-500 mb-6">
            Your Improvement Plan
          </h2>

          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={rec.title}
                id={`rec-${index}`}
                data-animate
                className="bg-purple-950/10 border border-purple-900/20 rounded-2xl p-5 transition-all duration-500 hover:bg-purple-950/15"
                style={{
                  opacity: visibleElements.has(`rec-${index}`) ? 1 : 0,
                  transform: visibleElements.has(`rec-${index}`) ? 'translateY(0)' : 'translateY(10px)',
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">
                    {rec.icon}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-zinc-200 mb-1">
                      {rec.title}
                    </h3>
                    <p className="text-xs font-light text-zinc-400 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ======================== */}
      {/* BOTTOM ACTION BUTTONS */}
      {/* ======================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent pt-8 pb-6 px-5 z-40">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {/* Save to History */}
          <button
            onClick={onSaveToHistory}
            className="flex-[6] bg-white text-black font-medium text-sm py-3.5 rounded-full hover:bg-zinc-100 active:scale-[0.98] transition-all"
          >
            Save to History
          </button>

          {/* Analyze Again */}
          <button
            onClick={onAnalyzeAgain}
            className="flex-[4] border border-zinc-700 text-zinc-300 font-medium text-sm py-3.5 rounded-full hover:bg-zinc-900 hover:border-zinc-600 active:scale-[0.98] transition-all"
          >
            Analyze Again
          </button>
        </div>
      </div>

      {/* ======================== */}
      {/* CUSTOM STYLES */}
      {/* ======================== */}
      <style>{`
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Hide scrollbar but keep functionality */
        .overflow-y-auto::-webkit-scrollbar {
          display: none;
        }

        .overflow-y-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Ensure proper font rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Number tabular spacing */
        .tabular-nums {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
};

export default ResultsScreen;
