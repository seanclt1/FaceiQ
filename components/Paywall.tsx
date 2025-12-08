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
    <div className="bg-brand-black min-h-screen text-white font-sans max-w-md mx-auto relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/50 via-brand-black to-brand-black z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Images */}
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 left-4 z-20 p-2 bg-black/50 backdrop-blur-md rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Before/After Images */}
          <div className="flex h-64 overflow-hidden">
            <div className="flex-1 relative">
              <img
                src={beforeImage}
                alt="Before"
                className="w-full h-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-black/90" />
            </div>
            <div className="flex-1 relative">
              <img
                src={afterImage}
                alt="After"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-black/90" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 -mt-8">
          {/* Headline */}
          <h1 className="text-4xl font-bold mb-6 text-center">
            Get your rating
          </h1>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-zinc-800/50 border border-zinc-700 flex items-center justify-center">
                  <feature.icon size={20} className="text-zinc-400" />
                </div>
                <span className="text-lg font-medium text-zinc-200">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* Free Trial Toggle */}
          <div
            onClick={() => setFreeTrialEnabled(!freeTrialEnabled)}
            className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-700/50 rounded-2xl p-4 mb-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform"
          >
            <div>
              <p className="font-semibold text-white">Enable Free Trial</p>
              <p className="text-sm text-zinc-400">for 3 days</p>
            </div>
            <div
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                freeTrialEnabled ? 'bg-brand-primary' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                  freeTrialEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Pricing Options */}
          <div className="space-y-3 mb-6">
            {/* Yearly - Highlighted */}
            <div
              onClick={() => setSelectedPlan('yearly')}
              className={`relative rounded-2xl p-4 border-2 cursor-pointer transition-all active:scale-[0.99] ${
                selectedPlan === 'yearly'
                  ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/20'
                  : 'border-zinc-700 bg-zinc-900/50'
              }`}
            >
              {/* Save badge */}
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                SAVE 93%
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white uppercase tracking-wide">Yearly Access</p>
                  <p className="text-sm text-zinc-400">Just $29.99 per year</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">$0.58</p>
                  <p className="text-xs text-zinc-500">per week</p>
                </div>
              </div>

              {/* Selection indicator */}
              {selectedPlan === 'yearly' && (
                <div className="absolute top-4 left-4 w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </div>

            {/* Weekly */}
            <div
              onClick={() => setSelectedPlan('weekly')}
              className={`rounded-2xl p-4 border-2 cursor-pointer transition-all active:scale-[0.99] ${
                selectedPlan === 'weekly'
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-zinc-800 bg-zinc-900/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-zinc-300 uppercase tracking-wide">Weekly Access</p>
                <div className="text-right">
                  <p className="text-xl font-bold text-zinc-300">$7.99</p>
                  <p className="text-xs text-zinc-500">per week</p>
                </div>
              </div>

              {selectedPlan === 'weekly' && (
                <div className="absolute top-4 left-4 w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleContinue}
            className="w-full py-4 rounded-full bg-gradient-to-r from-brand-primary via-violet-500 to-cyan-400 text-white font-bold text-lg shadow-lg shadow-brand-primary/30 active:scale-[0.98] transition-transform mb-4"
          >
            <span className="block">Get your results</span>
            <span className="block text-sm font-normal opacity-80">cancel anytime</span>
          </button>

          {/* Footer Links */}
          <div className="flex justify-center gap-8 pb-8">
            <button className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
              Terms
            </button>
            <button className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
              Privacy
            </button>
            <button className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
              Restore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
