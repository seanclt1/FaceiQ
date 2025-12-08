import React, { useState } from 'react';
import { Crown, Zap, Sparkles, Check, X, ChevronRight, Package } from 'lucide-react';
import {
  Product,
  SUBSCRIPTION_PRODUCTS,
  BOOST_PRODUCTS,
  FEATURE_PACK_PRODUCTS
} from '../types';
import subscriptionService from '../services/subscriptionService';

interface PricingScreenProps {
  onClose?: () => void;
}

const PricingScreen: React.FC<PricingScreenProps> = ({ onClose }) => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePurchase = async (product: Product) => {
    setPurchasing(product.id);
    setMessage(null);

    const result = await subscriptionService.purchaseProduct(product.id);

    setPurchasing(null);
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getProductIcon = (type: Product['type']) => {
    switch (type) {
      case 'subscription':
        return <Crown className="text-yellow-400" size={20} />;
      case 'boost_pack':
        return <Zap className="text-blue-400" size={20} />;
      case 'feature_pack':
        return <Package className="text-purple-400" size={20} />;
    }
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const isPurchasing = purchasing === product.id;
    const isOwned = product.type === 'feature_pack' && subscriptionService.hasFeaturePack(product.id);
    const hasActiveSub = product.type === 'subscription' &&
      subscriptionService.getActiveSubscription()?.productId === product.id;

    return (
      <div
        className={`
          relative bg-brand-card/60 backdrop-blur-sm border rounded-2xl p-4
          transition-all duration-300 hover:scale-[1.02]
          ${product.popular ? 'border-brand-primary shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'border-zinc-800'}
          ${isOwned || hasActiveSub ? 'opacity-60' : ''}
        `}
      >
        {product.popular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary px-3 py-1 rounded-full">
            <span className="text-xs font-bold text-white flex items-center gap-1">
              <Sparkles size={12} /> POPULAR
            </span>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getProductIcon(product.type)}
            <div>
              <h3 className="font-bold text-white text-sm">{product.name}</h3>
              {product.duration && (
                <span className="text-xs text-zinc-500">{product.duration}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-white">{formatPrice(product.price)}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 mb-3">{product.description}</p>

        {product.features && product.features.length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {product.features.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                <Check size={12} className="text-brand-accent flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={() => handlePurchase(product)}
          disabled={isPurchasing || isOwned || hasActiveSub}
          className={`
            w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2
            transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            ${product.popular
              ? 'bg-brand-primary hover:bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
              : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }
          `}
        >
          {isPurchasing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isOwned || hasActiveSub ? (
            <>
              <Check size={16} />
              <span>Owned</span>
            </>
          ) : (
            <>
              <span>Purchase</span>
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    );
  };

  const boostsAvailable = subscriptionService.getAvailableBoosts();
  const activeSub = subscriptionService.getActiveSubscription();
  const expiryText = subscriptionService.getSubscriptionExpiryText();

  return (
    <div className="min-h-screen bg-brand-black p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-brand-primary/20 px-4 py-2 rounded-full mb-3">
          <Crown className="text-yellow-400" size={18} />
          <span className="text-sm font-bold text-brand-secondary">Premium</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">In-App Purchases</h1>
        <p className="text-zinc-500 text-sm">Unlock your full potential</p>
      </div>

      {/* Status Bar */}
      <div className="bg-brand-card/60 border border-zinc-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Zap className="text-blue-400" size={20} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Available Boosts</p>
              <p className="text-lg font-bold text-white">{boostsAvailable}</p>
            </div>
          </div>
          {activeSub && (
            <div className="text-right">
              <p className="text-xs text-zinc-500">Subscription</p>
              <p className="text-sm font-bold text-brand-accent">{expiryText}</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`
            fixed top-4 left-4 right-4 z-50 p-4 rounded-xl flex items-center gap-3
            animate-fade-in
            ${message.type === 'success'
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
            }
          `}
        >
          {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Subscriptions Section */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Crown size={14} className="text-yellow-400" />
          Subscriptions
        </h2>
        <div className="space-y-3">
          {SUBSCRIPTION_PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Boosts Section */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap size={14} className="text-blue-400" />
          Boost Packs
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {BOOST_PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Feature Packs Section */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Package size={14} className="text-purple-400" />
          Feature Packs
        </h2>
        <div className="space-y-3">
          {FEATURE_PACK_PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center mt-8 space-y-2">
        <p className="text-xs text-zinc-600">
          Subscriptions auto-renew unless cancelled 24 hours before the end of the period.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs">
          <button className="text-brand-secondary hover:underline">Terms of Service</button>
          <button className="text-brand-secondary hover:underline">Privacy Policy</button>
        </div>
      </div>
    </div>
  );
};

export default PricingScreen;
