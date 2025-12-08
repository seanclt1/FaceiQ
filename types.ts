export interface AnalysisResult {
  scores: {
    overall: number;
    potential: number;
    masculinity: number;
    jawline: number;
    skinQuality: number;
    cheekbones: number;
    eyeArea: number;
  };
  tier: string; // e.g., "Chad Lite", "High Tier Normie"
  feedback: string[];
  improvements: {
    area: string;
    advice: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

export interface MogResult {
  winnerIndex: 0 | 1; // 0 is Left image, 1 is Right image
  winnerTitle: string; // e.g., "TOTAL DOMINATION", "CLOSE CALL"
  diffScore: number; // How much they won by
  reason: string; // The specific feature that won the battle
  roast: string; // A short brutal comment about the loser
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export enum AppTab {
  SCAN = 'scan',
  EXTRAS = 'extras',
  DAILY = 'daily',
  COACH = 'coach',
  PRICING = 'pricing'
}

export const TIER_MAP = [
  { min: 0, label: 'Sub 5' },
  { min: 50, label: 'Low Tier Normie' },
  { min: 60, label: 'Mid Tier Normie' },
  { min: 70, label: 'High Tier Normie' },
  { min: 80, label: 'Chad Lite' },
  { min: 90, label: 'Chad' },
  { min: 95, label: 'True Adam' },
];

export const DAILY_TASKS = [
  { id: 1, title: 'Oval face styling', icon: '💇‍♂️' },
  { id: 2, title: 'Lower your body fat', icon: '🏋️' },
  { id: 3, title: 'Lip health', icon: '👄' },
  { id: 4, title: 'Tighten facial skin', icon: '🧖' },
  { id: 5, title: 'Mewing session (10m)', icon: '👅' },
];

export const COACH_TOPICS = [
  { id: 'overall', title: 'Improve myself overall', icon: '🔥', color: 'from-purple-500 to-pink-500' },
  { id: 'muscle', title: 'Gain more muscle', icon: '💪', color: 'from-emerald-400 to-cyan-500' },
  { id: 'fat', title: 'Lose body fat', icon: '🏃', color: 'from-orange-400 to-red-500' },
  { id: 'skin', title: 'Get clear skin', icon: '🧴', color: 'from-yellow-300 to-lime-500' },
  { id: 'jaw', title: 'Sharpen my jawline', icon: '🗿', color: 'from-blue-500 to-indigo-500' },
];

// Subscription & Pricing Types
export type ProductType = 'subscription' | 'boost_pack' | 'feature_pack';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: ProductType;
  duration?: string; // For subscriptions (e.g., "1 week", "1 month")
  quantity?: number; // For boost packs
  features?: string[];
  popular?: boolean;
}

export interface UserSubscription {
  id: string;
  productId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenew: boolean;
}

export interface UserPurchases {
  subscriptions: UserSubscription[];
  boosts: number;
  unlockedPacks: string[];
}

// Pricing Constants - In-App Purchases
export const SUBSCRIPTION_PRODUCTS: Product[] = [
  {
    id: 'faceiq_pro_weekly',
    name: 'FaceiQ Pro (1 Week)',
    description: 'Unlock all premium features for 1 week',
    price: 3.99,
    currency: 'USD',
    type: 'subscription',
    duration: '1 week',
    features: [
      'Unlimited face scans',
      'Detailed analysis reports',
      'Priority AI coaching',
      'Ad-free experience'
    ],
    popular: true
  },
  {
    id: 'faceiq_ai_weekly',
    name: 'FaceiQ AI - Weekly (1 Week)',
    description: 'Full AI-powered analysis suite',
    price: 3.99,
    currency: 'USD',
    type: 'subscription',
    duration: '1 week',
    features: [
      'Advanced AI analysis',
      'Personalized improvement plans',
      'Progress tracking',
      'Weekly reports'
    ]
  }
];

export const BOOST_PRODUCTS: Product[] = [
  {
    id: 'boosts_3',
    name: '3 Boosts',
    description: 'Get 3 additional face analysis boosts',
    price: 2.99,
    currency: 'USD',
    type: 'boost_pack',
    quantity: 3
  },
  {
    id: 'boosts_5',
    name: '5 Boosts',
    description: 'Get 5 additional face analysis boosts',
    price: 3.99,
    currency: 'USD',
    type: 'boost_pack',
    quantity: 5,
    popular: true
  },
  {
    id: 'boosts_9',
    name: '9 Boosts',
    description: 'Get 9 additional face analysis boosts',
    price: 5.99,
    currency: 'USD',
    type: 'boost_pack',
    quantity: 9
  }
];

export const FEATURE_PACK_PRODUCTS: Product[] = [
  {
    id: 'hairstyles_pack',
    name: 'Hairstyles Pack',
    description: 'Unlock AI hairstyle recommendations',
    price: 4.99,
    currency: 'USD',
    type: 'feature_pack',
    features: [
      'Personalized hairstyle suggestions',
      'Virtual hair try-on',
      'Style matching algorithm'
    ]
  },
  {
    id: 'chad_pack',
    name: 'Chad Pack',
    description: 'Exclusive Chad-tier analysis tools',
    price: 0.99,
    currency: 'USD',
    type: 'feature_pack',
    features: [
      'Chad potential calculator',
      'Elite tier comparison',
      'Exclusive badges'
    ]
  }
];

export const ALL_PRODUCTS: Product[] = [
  ...SUBSCRIPTION_PRODUCTS,
  ...BOOST_PRODUCTS,
  ...FEATURE_PACK_PRODUCTS
];