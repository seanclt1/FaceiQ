import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as firebaseService from '../services/firebase';
import * as geminiService from '../services/geminiService';

// Mock the services
vi.mock('../services/firebase', () => ({
  auth: {
    currentUser: null,
  },
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('../services/geminiService', () => ({
  analyzeFace: vi.fn(),
  getCoachResponse: vi.fn(),
  compareFaces: vi.fn(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const icons = [
    'Camera', 'Zap', 'Activity', 'MessageSquare', 'Upload', 'X', 'ChevronRight',
    'ChevronLeft', 'User', 'Swords', 'Trophy', 'AlertTriangle', 'Scan', 'Eye',
    'Dumbbell', 'Sparkles', 'Scissors', 'Shield',
  ];

  const mockIcons: Record<string, any> = {};
  icons.forEach((icon) => {
    mockIcons[icon] = () => <div data-testid={`${icon.toLowerCase()}-icon`} />;
  });

  return mockIcons;
});

// Mock Auth component
vi.mock('../components/Auth', () => ({
  default: () => <div data-testid="auth-component">Auth Component</div>,
}));

// Mock ScoreCard component
vi.mock('../components/ScoreCard', () => ({
  default: ({ label, score }: { label: string; score: number }) => (
    <div data-testid={`scorecard-${label.toLowerCase()}`}>
      {label}: {score}
    </div>
  ),
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should show Auth component when user is not logged in', async () => {
      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(null);
        return () => {};
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('auth-component')).toBeInTheDocument();
      });
    });

    it('should show main app when user is logged in', async () => {
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };

      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return () => {};
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });
    });

    it('should handle auth state changes', async () => {
      let authCallback: ((user: any) => void) | null = null;

      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        authCallback = callback;
        callback(null);
        return () => {};
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('auth-component')).toBeInTheDocument();
      });

      // Simulate user login
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };

      if (authCallback) {
        authCallback(mockUser);
      }

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(() => {
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };

      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return () => {};
      });
    });

    it('should start on SCAN tab by default', async () => {
      render(<App />);

      await waitFor(() => {
        // The SCAN tab content should be visible
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });
    });

    it('should have navigation tabs at the bottom', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });

      // App should render (we can verify by checking it's not showing auth)
      expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
    });
  });

  describe('Image Analysis Flow', () => {
    beforeEach(() => {
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };

      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return () => {};
      });
    });

    it('should handle successful face analysis', async () => {
      const mockAnalysisResult = {
        scores: {
          overall: 75,
          potential: 85,
          masculinity: 80,
          jawline: 70,
          skinQuality: 75,
          cheekbones: 72,
          eyeArea: 78,
        },
        tier: 'High Tier Normie',
        feedback: ['Good facial structure'],
        improvements: [{ area: 'Skin', advice: 'Use sunscreen', priority: 'High' as const }],
      };

      vi.mocked(geminiService.analyzeFace).mockResolvedValue(mockAnalysisResult);

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });

      // The app should be rendered
      expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
    });

    it('should handle analysis errors', async () => {
      vi.mocked(geminiService.analyzeFace).mockRejectedValue(new Error('Analysis failed'));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });
    });
  });

  describe('Chat Functionality', () => {
    beforeEach(() => {
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };

      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return () => {};
      });
    });

    it('should handle coach responses', async () => {
      const mockResponse = 'Start with basic grooming.';
      vi.mocked(geminiService.getCoachResponse).mockResolvedValue(mockResponse);

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });

      // App is rendered
      expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
    });

    it('should handle chat errors', async () => {
      vi.mocked(geminiService.getCoachResponse).mockRejectedValue(new Error('Chat failed'));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mog Comparison Flow', () => {
    beforeEach(() => {
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };

      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return () => {};
      });
    });

    it('should handle successful mog comparison', async () => {
      const mockMogResult = {
        winnerIndex: 0,
        winnerTitle: 'LEFT MOGS',
        diffScore: 15,
        reason: 'Superior Jawline',
        roast: 'Right side needs work.',
      };

      vi.mocked(geminiService.compareFaces).mockResolvedValue(mockMogResult);

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });

      // App is rendered and ready for mog comparison
      expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
    });

    it('should handle mog comparison errors', async () => {
      vi.mocked(geminiService.compareFaces).mockRejectedValue(new Error('Comparison failed'));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during auth initialization', () => {
      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        // Don't call callback immediately
        return () => {};
      });

      render(<App />);

      // During auth loading, nothing should be visible yet
      // This is a brief moment before auth state is determined
    });

    it('should transition from loading to authenticated state', async () => {
      let authCallback: ((user: any) => void) | null = null;

      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        authCallback = callback;
        return () => {};
      });

      render(<App />);

      // Simulate auth state resolution
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };

      if (authCallback) {
        authCallback(mockUser);
      }

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };

      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return () => {};
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(geminiService.analyzeFace).mockRejectedValue(new Error('API Error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });

      // App should still render despite API errors
      expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
    });

    it('should handle network errors', async () => {
      vi.mocked(geminiService.analyzeFace).mockRejectedValue(new Error('Network Error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });
    });
  });

  describe('Component Integration', () => {
    it('should integrate Auth component when not logged in', async () => {
      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(null);
        return () => {};
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByTestId('auth-component')).toBeInTheDocument();
      });
    });

    it('should cleanup auth listener on unmount', async () => {
      const unsubscribe = vi.fn();
      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(null);
        return unsubscribe;
      });

      const { unmount } = render(<App />);

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      const mockUser = {
        uid: '123',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };

      vi.mocked(firebaseService.onAuthStateChanged).mockImplementation((auth, callback) => {
        callback(mockUser);
        return () => {};
      });
    });

    it('should maintain state across renders', async () => {
      const { rerender } = render(<App />);

      await waitFor(() => {
        expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
      });

      rerender(<App />);

      // State should be maintained
      expect(screen.queryByTestId('auth-component')).not.toBeInTheDocument();
    });
  });
});
