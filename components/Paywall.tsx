import React, { useState } from 'react';
import { X, BarChart3, Image, Ban, Check } from 'lucide-react';

interface PaywallProps {
  onSubscribe: (plan: 'yearly' | 'weekly' | 'trial') => void;
  onDismiss: () => void;
}

type PlanType = 'yearly' | 'weekly';

const Paywall: React.FC<PaywallProps> = ({ onSubscribe, onDismiss }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(false);

  // Before/after transformation images
  const beforeImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';
  const afterImage = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80';

  const features = [
    { icon: BarChart3, text: 'Facial Masculinity Analysis' },
    { icon: Image, text: 'Daily Advices' },
    { icon: Ban, text: 'You are ? / 10' },
  ];

  const handleContinue = () => {
    if (freeTrialEnabled) {
      onSubscribe('trial');
    } else {
      onSubscribe(selectedPlan);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#1a0a2e] via-[#1a1035] to-[#0f0a1a] min-h-screen text-white font-sans relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="absolute top-12 left-4 z-20 p-2 rounded-full text-zinc-400 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* Before/After Images */}
      <div className="relative pt-10 px-4 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden relative">
            <img
              src={beforeImage}
              alt="Before"
              className="w-full h-full object-cover grayscale opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden relative">
            <img
              src={afterImage}
              alt="After"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-8">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-8">Get your rating</h1>

        {/* Features List */}
        <div className="space-y-4 mb-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg border border-zinc-700 flex items-center justify-center">
                <feature.icon size={20} className="text-zinc-300" />
              </div>
              <span className="text-lg font-medium text-zinc-200">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Free Trial Toggle */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-4 flex items-center justify-between border border-white/10">
          <div>
            <p className="font-semibold text-white">Enable Free Trial</p>
            <p className="text-sm text-zinc-400">for 3 days</p>
          </div>
          <button
            onClick={() => setFreeTrialEnabled(!freeTrialEnabled)}
            className={`w-14 h-8 rounded-full transition-all relative ${
              freeTrialEnabled ? 'bg-brand-primary' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                freeTrialEnabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Yearly Plan - Highlighted */}
        <button
          onClick={() => setSelectedPlan('yearly')}
          className={`w-full rounded-2xl p-4 mb-3 relative transition-all border-2 ${
            selectedPlan === 'yearly'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-zinc-700/50 bg-white/5'
          }`}
        >
          {/* Save Badge */}
          <div className="absolute -top-3 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            SAVE 93%
          </div>

          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="font-bold text-white uppercase tracking-wide">Yearly Access</p>
              <p className="text-sm text-zinc-400">Just $29.99 per year</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">$0.58</p>
              <p className="text-sm text-zinc-400">per week</p>
            </div>
          </div>

          {/* Selection Indicator */}
          {selectedPlan === 'yearly' && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          )}
        </button>

        {/* Weekly Plan */}
        <button
          onClick={() => setSelectedPlan('weekly')}
          className={`w-full rounded-2xl p-4 mb-8 transition-all border-2 relative ${
            selectedPlan === 'weekly'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-transparent bg-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="font-bold text-zinc-300 uppercase tracking-wide">Weekly Access</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-zinc-300">$7.99</p>
              <p className="text-sm text-zinc-500">per week</p>
            </div>
          </div>

          {/* Selection Indicator */}
          {selectedPlan === 'weekly' && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          )}
        </button>

        {/* CTA Button */}
        <button
          onClick={handleContinue}
          className="w-full py-5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-400 font-bold text-lg shadow-lg shadow-purple-500/30 active:scale-[0.98] transition-transform"
        >
          <span className="block">Get your results</span>
          <span className="text-sm font-normal opacity-80">cancel anytime</span>
        </button>

        {/* Footer Links */}
        <div className="flex justify-center gap-8 mt-6 text-sm text-zinc-500">
          <button className="hover:text-white transition-colors">Terms</button>
          <button className="hover:text-white transition-colors">Privacy</button>
          <button className="hover:text-white transition-colors">Restore</button>
        </div>
      </div>

      {/* Home Indicator Line (iOS style) */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
    </div>
  );
};

export default Paywall;
