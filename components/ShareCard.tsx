import React, { forwardRef } from 'react';
import { Crown, Zap, TrendingUp } from 'lucide-react';

interface ShareCardProps {
  overallScore: number;
  potentialScore: number;
  tier: string;
  percentile: number;
  userImage?: string;
  metrics: {
    jawline: number;
    eyeArea: number;
    skinQuality: number;
    masculinity: number;
  };
}

/**
 * ShareCard - Instagram Stories-ready shareable card (9:16 aspect ratio)
 * Designed to be screenshot-friendly and viral
 */
const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ overallScore, potentialScore, tier, percentile, userImage, metrics }, ref) => {
    const getTierColor = (tier: string) => {
      if (tier.includes('Chad') || tier.includes('Adam')) return 'from-amber-400 via-yellow-300 to-amber-500';
      if (tier.includes('High')) return 'from-purple-500 to-pink-500';
      if (tier.includes('Mid')) return 'from-blue-500 to-cyan-500';
      return 'from-zinc-500 to-zinc-600';
    };

    const getTierEmoji = (tier: string) => {
      if (tier.includes('Adam')) return '👑';
      if (tier.includes('Chad')) return '🔥';
      if (tier.includes('High')) return '💎';
      if (tier.includes('Mid')) return '⚡';
      return '📊';
    };

    return (
      <div
        ref={ref}
        className="w-[360px] h-[640px] bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a] rounded-3xl overflow-hidden relative flex flex-col"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Ambient glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-500/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-20 right-0 w-60 h-60 bg-violet-600/15 blur-[80px] rounded-full" />

        {/* Header */}
        <div className="relative z-10 pt-8 px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">FaceiQ</span>
          </div>
          <p className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase">Face Card Analysis</p>
        </div>

        {/* User Photo & Tier */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 -mt-4">
          {/* Profile Ring */}
          <div className="relative mb-6">
            <div className={`w-32 h-32 rounded-full p-[3px] bg-gradient-to-tr ${getTierColor(tier)}`}>
              {userImage ? (
                <img
                  src={userImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-[#0a0a0a]"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-zinc-900 border-4 border-[#0a0a0a] flex items-center justify-center">
                  <Crown size={40} className="text-zinc-700" />
                </div>
              )}
            </div>
            {/* Tier Badge */}
            <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r ${getTierColor(tier)} shadow-lg`}>
              <span className="text-xs font-black text-black uppercase tracking-wide flex items-center gap-1">
                {getTierEmoji(tier)} {tier}
              </span>
            </div>
          </div>

          {/* Main Score */}
          <div className="text-center mb-6">
            <p className="text-[10px] text-zinc-500 tracking-[0.2em] uppercase mb-2">Overall Rating</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-7xl font-black text-white tabular-nums">{overallScore}</span>
              <span className="text-2xl font-bold text-zinc-600">/100</span>
            </div>
          </div>

          {/* Percentile Badge */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-full px-5 py-2 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">Top {percentile}% of users</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="w-full grid grid-cols-2 gap-3">
            {[
              { label: 'Jawline', value: metrics.jawline },
              { label: 'Eye Area', value: metrics.eyeArea },
              { label: 'Skin', value: metrics.skinQuality },
              { label: 'Masculine', value: metrics.masculinity },
            ].map((metric) => (
              <div key={metric.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 text-center">
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1">{metric.label}</p>
                <p className="text-xl font-bold text-white tabular-nums">{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Potential Score */}
          <div className="mt-6 flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl px-5 py-3">
            <div className="text-center">
              <p className="text-[9px] text-purple-400 uppercase tracking-wider">Potential</p>
              <p className="text-2xl font-black text-purple-400 tabular-nums">{potentialScore}</p>
            </div>
            <div className="h-8 w-px bg-purple-500/30" />
            <div className="text-center">
              <p className="text-[9px] text-emerald-400 uppercase tracking-wider">Growth</p>
              <p className="text-2xl font-black text-emerald-400 tabular-nums">+{potentialScore - overallScore}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pb-8 px-6 text-center">
          <p className="text-[10px] text-zinc-600 tracking-wide">Scan your face at faceiq.app</p>
        </div>

        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-500/30 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-purple-500/30 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-500/30 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-500/30 rounded-br-lg" />
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

export default ShareCard;
