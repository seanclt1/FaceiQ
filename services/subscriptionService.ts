import { Product, UserPurchases, UserSubscription, ALL_PRODUCTS } from '../types';

const STORAGE_KEY = 'faceiq_purchases';

// Default free tier allowances
const FREE_TIER_BOOSTS = 3;

class SubscriptionService {
  private purchases: UserPurchases;

  constructor() {
    this.purchases = this.loadPurchases();
  }

  private loadPurchases(): UserPurchases {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.subscriptions = parsed.subscriptions.map((sub: UserSubscription) => ({
          ...sub,
          startDate: new Date(sub.startDate),
          endDate: new Date(sub.endDate)
        }));
        return parsed;
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
    return this.getDefaultPurchases();
  }

  private getDefaultPurchases(): UserPurchases {
    return {
      subscriptions: [],
      boosts: FREE_TIER_BOOSTS,
      unlockedPacks: []
    };
  }

  private savePurchases(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.purchases));
  }

  // Get current user purchases
  getPurchases(): UserPurchases {
    return { ...this.purchases };
  }

  // Get available boosts
  getAvailableBoosts(): number {
    return this.purchases.boosts;
  }

  // Use a boost (returns false if no boosts available)
  useBoost(): boolean {
    if (this.purchases.boosts <= 0 && !this.hasActiveSubscription()) {
      return false;
    }
    if (!this.hasActiveSubscription()) {
      this.purchases.boosts--;
      this.savePurchases();
    }
    return true;
  }

  // Check if user has an active subscription
  hasActiveSubscription(): boolean {
    const now = new Date();
    return this.purchases.subscriptions.some(
      sub => sub.isActive && new Date(sub.endDate) > now
    );
  }

  // Get active subscription details
  getActiveSubscription(): UserSubscription | null {
    const now = new Date();
    return this.purchases.subscriptions.find(
      sub => sub.isActive && new Date(sub.endDate) > now
    ) || null;
  }

  // Check if a feature pack is unlocked
  hasFeaturePack(packId: string): boolean {
    return this.purchases.unlockedPacks.includes(packId);
  }

  // Get product by ID
  getProduct(productId: string): Product | undefined {
    return ALL_PRODUCTS.find(p => p.id === productId);
  }

  // Simulate purchase (in production, this would integrate with payment provider)
  async purchaseProduct(productId: string): Promise<{ success: boolean; message: string }> {
    const product = this.getProduct(productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      switch (product.type) {
        case 'subscription':
          this.activateSubscription(product);
          break;
        case 'boost_pack':
          this.addBoosts(product.quantity || 0);
          break;
        case 'feature_pack':
          this.unlockFeaturePack(product.id);
          break;
      }

      this.savePurchases();
      return { success: true, message: `Successfully purchased ${product.name}!` };
    } catch (error) {
      return { success: false, message: 'Purchase failed. Please try again.' };
    }
  }

  private activateSubscription(product: Product): void {
    const now = new Date();
    const endDate = new Date(now);

    // Parse duration and set end date
    if (product.duration?.includes('week')) {
      const weeks = parseInt(product.duration) || 1;
      endDate.setDate(endDate.getDate() + (weeks * 7));
    } else if (product.duration?.includes('month')) {
      const months = parseInt(product.duration) || 1;
      endDate.setMonth(endDate.getMonth() + months);
    } else {
      // Default to 1 week
      endDate.setDate(endDate.getDate() + 7);
    }

    const subscription: UserSubscription = {
      id: `sub_${Date.now()}`,
      productId: product.id,
      startDate: now,
      endDate: endDate,
      isActive: true,
      autoRenew: false
    };

    // Deactivate any existing subscriptions
    this.purchases.subscriptions.forEach(sub => {
      sub.isActive = false;
    });

    this.purchases.subscriptions.push(subscription);
  }

  private addBoosts(quantity: number): void {
    this.purchases.boosts += quantity;
  }

  private unlockFeaturePack(packId: string): void {
    if (!this.purchases.unlockedPacks.includes(packId)) {
      this.purchases.unlockedPacks.push(packId);
    }
  }

  // Reset purchases (for testing)
  resetPurchases(): void {
    this.purchases = this.getDefaultPurchases();
    this.savePurchases();
  }

  // Format price for display
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  }

  // Get subscription expiry text
  getSubscriptionExpiryText(): string | null {
    const activeSub = this.getActiveSubscription();
    if (!activeSub) return null;

    const endDate = new Date(activeSub.endDate);
    const now = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) return 'Expired';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
