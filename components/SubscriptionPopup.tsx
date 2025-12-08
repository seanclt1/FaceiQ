import React, { useState } from 'react';
import { X, Grid3X3, Image, Ban, Loader2 } from 'lucide-react';
import { UseSubscriptionReturn } from '../hooks/useSubscription';

interface SubscriptionPopupProps {
  subscription: UseSubscriptionReturn;
  onClose: () => void;
  onSuccess?: () => void;
}

type PlanType = 'yearly' | 'weekly';

// Before/After face comparison images (placeholder URLs - replace with actual assets)
const BEFORE_IMAGE = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face';
const AFTER_IMAGE = 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop&crop=face';

export const SubscriptionPopup: React.FC<SubscriptionPopupProps> = ({
  subscription,
  onClose,
  onSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [freeTrialEnabled, setFreeTrialEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    const productId = selectedPlan === 'yearly' ? 'faceiq_yearly' : 'faceiq_weekly';
    const success = await subscription.purchase(productId, freeTrialEnabled);
    setIsProcessing(false);

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    const success = await subscription.restore();
    setIsProcessing(false);

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  const openLink = (type: 'terms' | 'privacy') => {
    // In a real app, these would open actual links
    const urls = {
      terms: 'https://example.com/terms',
      privacy: 'https://example.com/privacy',
    };
    window.open(urls[type], '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{
      background: 'linear-gradient(180deg, #1a0a2e 0%, #0d0015 50%, #000000 100%)',
    }}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-white/80" />
      </button>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Hero Images */}
        <div className="relative h-[40vh] min-h-[280px] flex gap-1 p-4 pt-12">
          <div className="flex-1 relative rounded-2xl overflow-hidden">
            <img
              src={BEFORE_IMAGE}
              alt="Before transformation"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'grayscale(30%) brightness(0.9)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="flex-1 relative rounded-2xl overflow-hidden">
            <img
              src={AFTER_IMAGE}
              alt="After transformation"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </div>

        {/* Headline */}
        <div className="px-6 pt-4 pb-2">
          <h1 className="text-3xl font-bold text-white text-center">
            Get your rating
          </h1>
        </div>

        {/* Feature List */}
        <div className="px-6 py-4 space-y-4">
          <FeatureItem
            icon={<Grid3X3 className="w-6 h-6" />}
            text="Facial Masculinity Analysis"
          />
          <FeatureItem
            icon={<Image className="w-6 h-6" />}
            text="Daily Advices"
          />
          <FeatureItem
            icon={<Ban className="w-6 h-6" />}
            text="You are ? / 10"
          />
        </div>

        {/* Free Trial Toggle */}
        <div className="px-6 py-3">
          <div
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 100%)',
            }}
          >
            <div>
              <p className="text-white font-semibold">Enable Free Trial</p>
              <p className="text-white/60 text-sm">for 3 days</p>
            </div>
            <button
              onClick={() => setFreeTrialEnabled(!freeTrialEnabled)}
              className={`w-14 h-8 rounded-full transition-all duration-300 relative ${
                freeTrialEnabled ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 ${
                  freeTrialEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="px-6 py-3 space-y-3">
          {/* Yearly Plan */}
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`relative w-full p-4 rounded-2xl text-left transition-all duration-300 ${
              selectedPlan === 'yearly'
                ? 'ring-2 ring-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                : 'bg-white/5'
            }`}
            style={selectedPlan === 'yearly' ? {
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)',
            } : undefined}
          >
            {/* Save Badge */}
            <div className="absolute -top-2 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold">
              SAVE 93%
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-bold tracking-wide">YEARLY ACCESS</p>
                <p className="text-white/80 text-sm">Just $29.99 per year</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">$0.58</p>
                <p className="text-white/60 text-sm">per week</p>
              </div>
            </div>
          </button>

          {/* Weekly Plan */}
          <button
            onClick={() => setSelectedPlan('weekly')}
            className={`w-full p-4 rounded-2xl text-left transition-all duration-300 ${
              selectedPlan === 'weekly'
                ? 'ring-2 ring-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-white/10'
                : 'bg-white/5'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-bold tracking-wide">WEEKLY ACCESS</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-xl">$7.99</p>
                <p className="text-white/60 text-sm">per week</p>
              </div>
            </div>
          </button>
        </div>

        {/* Error Message */}
        {subscription.error && (
          <div className="px-6 py-2">
            <p className="text-red-400 text-sm text-center">{subscription.error}</p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-4" style={{
        background: 'linear-gradient(to top, #000000 60%, transparent 100%)',
      }}>
        {/* CTA Button */}
        <button
          onClick={handlePurchase}
          disabled={isProcessing || subscription.isLoading}
          className="w-full py-4 rounded-full font-bold text-white text-lg relative overflow-hidden disabled:opacity-70"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #06B6D4 100%)',
          }}
        >
          {isProcessing || subscription.isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span>Get your results</span>
              <span className="text-sm font-normal opacity-80">cancel anytime</span>
            </div>
          )}
        </button>

        {/* Footer Links */}
        <div className="flex justify-center items-center gap-8 mt-4">
          <button
            onClick={() => openLink('terms')}
            className="text-white/50 text-sm hover:text-white/80 transition-colors"
          >
            Terms
          </button>
          <button
            onClick={() => openLink('privacy')}
            className="text-white/50 text-sm hover:text-white/80 transition-colors"
          >
            Privacy
          </button>
          <button
            onClick={handleRestore}
            disabled={isProcessing}
            className="text-white/50 text-sm hover:text-white/80 transition-colors disabled:opacity-50"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
};

// Feature List Item Component
const FeatureItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-4">
    <div className="text-white/70">{icon}</div>
    <span className="text-white text-lg">{text}</span>
  </div>
);

export default SubscriptionPopup;
