import React, { useState } from 'react';
import { X, Grid3X3, Image, Ban, Check } from 'lucide-react';
import { purchaseSubscription, restorePurchases } from '../services/subscriptionService';

interface PaymentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribed: () => void;
}

type PlanType = 'yearly' | 'weekly';

const PaymentPopup: React.FC<PaymentPopupProps> = ({ isOpen, onClose, onSubscribed }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      const success = await purchaseSubscription(selectedPlan, freeTrialEnabled);
      if (success) {
        onSubscribed();
      } else {
        alert('Purchase failed. Please try again.');
      }
    } catch (e) {
      alert('Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      const hasSubscription = await restorePurchases();
      if (hasSubscription) {
        onSubscribed();
      } else {
        alert('No previous purchases found.');
      }
    } catch (e) {
      alert('Restore failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0015 50%, #050505 100%)',
        }}
      />

      {/* Content */}
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 text-zinc-400 hover:text-white transition-colors"
          disabled={isProcessing}
        >
          <X size={28} />
        </button>

        {/* Hero Section - Face Comparison Images */}
        <div className="flex gap-2 px-4 pt-14 pb-4">
          <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face"
              alt="Before"
              className="w-full h-full object-cover grayscale opacity-80"
            />
          </div>
          <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900">
            <img
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop&crop=face"
              alt="After"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-3xl font-bold text-white text-center mt-4 mb-6">
          Get your rating
        </h1>

        {/* Feature List */}
        <div className="px-8 space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <Grid3X3 className="w-6 h-6 text-zinc-400" />
            <span className="text-white text-lg">Facial Masculinity Analysis</span>
          </div>
          <div className="flex items-center gap-4">
            <Image className="w-6 h-6 text-zinc-400" />
            <span className="text-white text-lg">Daily Advices</span>
          </div>
          <div className="flex items-center gap-4">
            <Ban className="w-6 h-6 text-zinc-400" />
            <span className="text-white text-lg">You are ? / 10</span>
          </div>
        </div>

        {/* Free Trial Toggle */}
        <div className="mx-6 mb-4">
          <div
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 100%)',
            }}
          >
            <div>
              <p className="text-white font-semibold">Enable Free Trial</p>
              <p className="text-zinc-400 text-sm">for 3 days</p>
            </div>
            <button
              onClick={() => setFreeTrialEnabled(!freeTrialEnabled)}
              className={`w-14 h-8 rounded-full transition-all duration-300 relative ${
                freeTrialEnabled ? 'bg-brand-primary' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${
                  freeTrialEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="px-6 space-y-3 mb-6">
          {/* Yearly Plan */}
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`relative w-full p-4 rounded-2xl border-2 transition-all ${
              selectedPlan === 'yearly'
                ? 'border-pink-500 bg-zinc-900/80'
                : 'border-zinc-800 bg-zinc-900/40'
            }`}
            style={selectedPlan === 'yearly' ? {
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.3), inset 0 0 20px rgba(236, 72, 153, 0.1)',
            } : {}}
          >
            {/* Save Badge */}
            <div className="absolute -top-3 right-4 px-3 py-1 bg-pink-500 rounded-full">
              <span className="text-white text-xs font-bold">SAVE 93%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-white font-bold text-sm uppercase tracking-wide">YEARLY ACCESS</p>
                <p className="text-zinc-400 text-sm">Just $29.99 per year</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">$0.58</p>
                <p className="text-zinc-500 text-xs">per week</p>
              </div>
            </div>
          </button>

          {/* Weekly Plan */}
          <button
            onClick={() => setSelectedPlan('weekly')}
            className={`w-full p-4 rounded-2xl border-2 transition-all ${
              selectedPlan === 'weekly'
                ? 'border-pink-500 bg-zinc-900/80'
                : 'border-zinc-800 bg-zinc-900/40'
            }`}
            style={selectedPlan === 'weekly' ? {
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.3), inset 0 0 20px rgba(236, 72, 153, 0.1)',
            } : {}}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-white font-bold text-sm uppercase tracking-wide">WEEKLY ACCESS</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">$7.99</p>
                <p className="text-zinc-500 text-xs">per week</p>
              </div>
            </div>
          </button>
        </div>

        {/* CTA Button */}
        <div className="px-6 mb-4">
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full py-4 rounded-full font-bold text-white text-lg transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'linear-gradient(90deg, #8B5CF6 0%, #06B6D4 100%)',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
            }}
          >
            <span className="block">{isProcessing ? 'Processing...' : 'Get your results'}</span>
            <span className="block text-sm font-normal opacity-80">cancel anytime</span>
          </button>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-8 pb-8 pt-2">
          <button className="text-zinc-500 text-sm hover:text-white transition-colors">
            Terms
          </button>
          <button className="text-zinc-500 text-sm hover:text-white transition-colors">
            Privacy
          </button>
          <button
            onClick={handleRestore}
            disabled={isProcessing}
            className="text-zinc-500 text-sm hover:text-white transition-colors disabled:opacity-50"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPopup;
