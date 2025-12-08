import { useState, useEffect, useCallback } from 'react';
import { SubscriptionState, SubscriptionProduct, SUBSCRIPTION_PRODUCTS } from '../types';

const STORAGE_KEY = 'faceiq_subscription';

const getDefaultState = (): SubscriptionState => ({
  isSubscribed: false,
  subscriptionType: null,
  expiresAt: null,
  isTrial: false,
  trialEndsAt: null,
  purchases: [],
});

const loadSubscriptionState = (): SubscriptionState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return {
        ...parsed,
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
        trialEndsAt: parsed.trialEndsAt ? new Date(parsed.trialEndsAt) : null,
      };
    }
  } catch (e) {
    console.error('Failed to load subscription state:', e);
  }
  return getDefaultState();
};

const saveSubscriptionState = (state: SubscriptionState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save subscription state:', e);
  }
};

export interface UseSubscriptionReturn {
  state: SubscriptionState;
  isLoading: boolean;
  error: string | null;
  hasActiveSubscription: boolean;
  products: SubscriptionProduct[];
  purchase: (productId: string, withTrial?: boolean) => Promise<boolean>;
  restore: () => Promise<boolean>;
  clearSubscription: () => void;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const [state, setState] = useState<SubscriptionState>(getDefaultState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load state on mount
  useEffect(() => {
    const loaded = loadSubscriptionState();
    setState(loaded);
    setInitialized(true);
  }, []);

  // Save state on change (after initialization)
  useEffect(() => {
    if (initialized) {
      saveSubscriptionState(state);
    }
  }, [state, initialized]);

  // Check if subscription is active
  const hasActiveSubscription = useCallback((): boolean => {
    if (!state.isSubscribed) return false;

    // Check trial expiration
    if (state.isTrial && state.trialEndsAt) {
      if (new Date() > state.trialEndsAt) {
        return false;
      }
      return true;
    }

    // Check subscription expiration
    if (state.expiresAt && new Date() > state.expiresAt) {
      return false;
    }

    return true;
  }, [state]);

  // Purchase a product
  const purchase = useCallback(async (productId: string, withTrial: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const product = SUBSCRIPTION_PRODUCTS.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, this would call RevenueCat/Stripe/App Store APIs
      // For now, we simulate a successful purchase

      const now = new Date();
      let expiresAt: Date | null = null;
      let trialEndsAt: Date | null = null;
      let isTrial = false;

      if (product.period === 'weekly') {
        if (withTrial) {
          isTrial = true;
          trialEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
          expiresAt = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // Trial + 1 week
        } else {
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
        }
      } else if (product.period === 'yearly') {
        if (withTrial) {
          isTrial = true;
          trialEndsAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
          expiresAt = new Date(now.getTime() + 368 * 24 * 60 * 60 * 1000); // Trial + 1 year
        } else {
          expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
        }
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscriptionType: productId,
        expiresAt,
        isTrial,
        trialEndsAt,
        purchases: [...prev.purchases, productId],
      }));

      setIsLoading(false);
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Purchase failed';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, []);

  // Restore purchases
  const restore = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate restore delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would call RevenueCat/Stripe to restore purchases
      // For now, we check localStorage for any previous purchases
      const stored = loadSubscriptionState();

      if (stored.purchases.length > 0) {
        // Find the most recent subscription purchase
        const subPurchase = stored.purchases.find(p =>
          p.includes('weekly') || p.includes('yearly')
        );

        if (subPurchase) {
          const now = new Date();
          const product = SUBSCRIPTION_PRODUCTS.find(p => p.id === subPurchase);

          let expiresAt: Date | null = null;
          if (product?.period === 'weekly') {
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          } else if (product?.period === 'yearly') {
            expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          }

          setState({
            ...stored,
            isSubscribed: true,
            subscriptionType: subPurchase,
            expiresAt,
            isTrial: false,
            trialEndsAt: null,
          });

          setIsLoading(false);
          return true;
        }
      }

      setError('No purchases to restore');
      setIsLoading(false);
      return false;
    } catch (e) {
      setError('Failed to restore purchases');
      setIsLoading(false);
      return false;
    }
  }, []);

  // Clear subscription (for testing)
  const clearSubscription = useCallback((): void => {
    setState(getDefaultState());
  }, []);

  return {
    state,
    isLoading,
    error,
    hasActiveSubscription: hasActiveSubscription(),
    products: SUBSCRIPTION_PRODUCTS,
    purchase,
    restore,
    clearSubscription,
  };
};
