// Subscription Service for Face iQ
// Manages subscription state via localStorage (can be swapped for real payment provider)

export interface Subscription {
  isActive: boolean;
  plan: 'weekly' | 'yearly' | null;
  startDate: string | null;
  endDate: string | null;
  isTrial: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'subscription' | 'consumable' | 'non-consumable';
  period?: 'weekly' | 'yearly';
}

// In-App Purchase Products
export const PRODUCTS: Product[] = [
  { id: 'faceiq_yearly', name: 'Face iQ Pro (Yearly)', price: 29.99, type: 'subscription', period: 'yearly' },
  { id: 'faceiq_weekly', name: 'Face iQ Pro (Weekly)', price: 7.99, type: 'subscription', period: 'weekly' },
  { id: 'faceiq_pro_week', name: 'Face iQ Pro (1 Week)', price: 3.99, type: 'subscription', period: 'weekly' },
  { id: 'hairstyles_pack', name: 'Hairstyles Pack', price: 4.99, type: 'non-consumable' },
  { id: 'faceiq_ai_weekly', name: 'Face iQ - Weekly (1 Week)', price: 3.99, type: 'subscription', period: 'weekly' },
  { id: 'boosts_5', name: '5 Boosts', price: 3.99, type: 'consumable' },
  { id: 'boosts_3', name: '3 Boosts', price: 2.99, type: 'consumable' },
  { id: 'chad_pack', name: 'Chad Pack', price: 0.99, type: 'non-consumable' },
  { id: 'boosts_9', name: '9 Boosts', price: 5.99, type: 'consumable' },
];

const STORAGE_KEY = 'faceiq_subscription';
const DISMISSED_KEY = 'faceiq_paywall_dismissed';

// Get current subscription status
export const getSubscription = (): Subscription => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const sub = JSON.parse(stored) as Subscription;
      // Check if subscription has expired
      if (sub.endDate && new Date(sub.endDate) < new Date()) {
        return { isActive: false, plan: null, startDate: null, endDate: null, isTrial: false };
      }
      return sub;
    }
  } catch (e) {
    console.error('Error reading subscription:', e);
  }
  return { isActive: false, plan: null, startDate: null, endDate: null, isTrial: false };
};

// Check if user has active subscription
export const hasActiveSubscription = (): boolean => {
  const sub = getSubscription();
  return sub.isActive;
};

// Purchase subscription (mock - replace with real payment provider)
export const purchaseSubscription = async (
  plan: 'weekly' | 'yearly',
  isTrial: boolean = false
): Promise<boolean> => {
  try {
    const now = new Date();
    const endDate = new Date(now);

    if (isTrial) {
      endDate.setDate(endDate.getDate() + 3); // 3-day trial
    } else if (plan === 'weekly') {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription: Subscription = {
      isActive: true,
      plan,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      isTrial,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
    return true;
  } catch (e) {
    console.error('Error purchasing subscription:', e);
    return false;
  }
};

// Restore purchases (mock - replace with real restore logic)
export const restorePurchases = async (): Promise<boolean> => {
  // In a real app, this would check with App Store/Google Play
  const sub = getSubscription();
  return sub.isActive;
};

// Cancel subscription
export const cancelSubscription = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Check if paywall was dismissed this session
export const wasPaywallDismissed = (): boolean => {
  return sessionStorage.getItem(DISMISSED_KEY) === 'true';
};

// Mark paywall as dismissed for this session
export const dismissPaywall = (): void => {
  sessionStorage.setItem(DISMISSED_KEY, 'true');
};

// Clear dismissed state (for testing)
export const clearDismissedState = (): void => {
  sessionStorage.removeItem(DISMISSED_KEY);
};
