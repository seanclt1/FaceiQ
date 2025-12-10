import React, { useState } from 'react';
import { X, Check, Star, Zap, Crown } from 'lucide-react';

interface ProUpsellModalProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const FemaleProUpsellModal: React.FC<ProUpsellModalProps> = ({ onClose, onSubscribe }) => {
  const [isTrialEnabled, setIsTrialEnabled] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#1C1C1E] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative animate-slide-up my-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-zinc-400 hover:text-white transition-colors z-40 cursor-pointer backdrop-blur-sm"
        >
          <X size={20} />
        </button>

        {/* Hero Section: Before & After Graphic */}
        <div className="relative h-80 flex bg-zinc-900">
            {/* Left: Before */}
            <div className="relative w-1/2 h-full overflow-hidden group">
                {/* Same image as after, but distorted to look 'bloated' and unpolished */}
                <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80" 
                    className="w-full h-full object-cover object-center brightness-[0.95] contrast-[0.7] saturate-[0.5] sepia-[0.2] scale-x-[1.15] scale-y-[0.98] origin-center blur-[0.5px]"
                    alt="Before"
                />
                {/* Removed dark overlay, kept very subtle tint for skin tone matching */}
                <div className="absolute inset-0 bg-yellow-900/5 mix-blend-multiply"></div>
            </div>

            {/* Right: After */}
            <div className="relative w-1/2 h-full overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80" 
                    className="w-full h-full object-cover object-top scale-105 contrast-110 brightness-110 saturate-[1.2]"
                    alt="After"
                />
                {/* Enhanced purple tint/glow for 'After' effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-violet-500/20 mix-blend-overlay"></div>
            </div>

            {/* Center Splitter */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white/50 to-transparent z-10"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-1.5 rounded-full border border-white/40 z-20 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>

            {/* Text Overlay - Left aligned */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/95 to-transparent px-6 pb-2 pt-24 z-30 flex justify-start">
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none drop-shadow-xl text-left max-w-[85%]">
                    Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">True Beauty Score!</span>
                </h2>
            </div>
        </div>

        {/* Features & Actions */}
        <div className="px-6 pt-6 pb-8 bg-zinc-900/50">
            {/* Features - Left aligned */}
            <div className="flex flex-col gap-3 mb-8 mr-auto max-w-[90%]">
                <div className="flex flex-col gap-2">
                    <FeatureRow text="Daily accurate genetic ratings" />
                    <FeatureRow text="Unlock 'True Adam' & 'Chad' Tiers" />
                </div>
                {/* Spaced out slightly as requested */}
                <div className="mt-1">
                    <FeatureRow text="Personalized Looksmaxxing Plan" />
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col">
                {/* Top Options Group */}
                <div className="flex flex-col gap-3 mb-8">
                    {/* Button 1: Free Trial */}
                    <button 
                        onClick={() => setIsTrialEnabled(!isTrialEnabled)}
                        className="w-full h-14 px-5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-between cursor-pointer border border-white/10"
                    >
                        <span className="font-bold text-sm">Enable Free Trial (3 days)</span>
                        {/* Toggle Switch */}
                        <div className={`w-11 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${isTrialEnabled ? 'bg-brand-accent' : 'bg-black/30 shadow-inner'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isTrialEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </button>

                    {/* Button 2: Yearly Access */}
                    <button 
                        onClick={onSubscribe}
                        className="w-full h-14 px-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-2xl shadow-md active:scale-95 transition-all flex items-center justify-between cursor-pointer border border-white/10"
                    >
                        {/* Left Block */}
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="font-extrabold text-sm uppercase tracking-tight leading-none">Yearly Access</span>
                            <span className="font-bold text-[10px] text-white/80 uppercase tracking-wide mt-0.5">Just $29.99 Per Year</span>
                        </div>
                        {/* Right Block */}
                        <div className="flex flex-col items-center justify-center text-center">
                             <span className="font-bold text-lg leading-none">$.58</span>
                             <span className="text-[10px] text-white/80 font-medium uppercase leading-none mt-0.5">per week</span>
                        </div>
                    </button>
                </div>

                {/* Main Action Button (Button 3) */}
                <button 
                    onClick={onSubscribe}
                    className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95 transition-all flex flex-col items-center justify-center group cursor-pointer relative overflow-hidden border border-white/10"
                >
                    <div className="relative z-10 flex items-center gap-2">
                        <span className="font-extrabold text-lg leading-none">Get Your Results</span>
                    </div>
                    <span className="relative z-10 text-[10px] font-bold text-white/70 uppercase tracking-wide mt-0.5 leading-none">Cancel Anytime</span>
                    
                    {/* Button Shine Effect */}
                    <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:animate-shine" />
                </button>

                <div className="flex flex-col items-center mt-3 gap-1">
                    <button onClick={onClose} className="text-xs text-zinc-600 underline hover:text-zinc-400 cursor-pointer">
                        Restore Purchases
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0 border border-brand-primary/30">
            <Check size={12} className="text-brand-primary" strokeWidth={3} />
        </div>
        <span className="text-sm font-semibold text-zinc-200">{text}</span>
    </div>
);

export default FemaleProUpsellModal;