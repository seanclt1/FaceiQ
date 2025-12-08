import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultsScreen from '../ResultsScreen';
import type { ResultsScreenProps, MetricData, ImprovementRecommendation } from '../ResultsScreen.types';

// Mock the hooks
vi.mock('../../hooks/useCountUp', () => ({
  useCountUp: (end: number) => end, // Return end value directly for testing
}));

vi.mock('../../hooks/useScrollReveal', () => ({
  useScrollReveal: () => ({ ref: { current: null }, isVisible: true }),
}));

vi.mock('../../hooks/useProgressBar', () => ({
  useProgressBar: (target: number) => target, // Return target value directly
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  ArrowUp: () => <div data-testid="arrow-up-icon" />,
}));

describe('ResultsScreen', () => {
  const mockMetrics: MetricData[] = [
    { name: 'Jawline', score: 8.5, description: 'Strong jawline definition' },
    { name: 'Skin Quality', score: 7.0, description: 'Good skin clarity' },
    { name: 'Eye Area', score: 9.0, description: 'Excellent eye symmetry' },
  ];

  const mockImprovements: ImprovementRecommendation[] = [
    { emoji: '💪', title: 'Mewing', description: 'Practice proper tongue posture daily' },
    { emoji: '🧴', title: 'Skincare', description: 'Use retinol and sunscreen' },
  ];

  const defaultProps: ResultsScreenProps = {
    overallScore: 8.0,
    potentialScore: 9.2,
    metrics: mockMetrics,
    improvements: mockImprovements,
    onBack: vi.fn(),
    onSettings: vi.fn(),
    onSaveToHistory: vi.fn(),
    onAnalyzeAgain: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the component', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    });

    it('should display overall score', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('8.0')).toBeInTheDocument();
    });

    it('should display potential score', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('9.2')).toBeInTheDocument();
    });

    it('should display OVERALL label', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('OVERALL')).toBeInTheDocument();
    });

    it('should display POTENTIAL label', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('POTENTIAL')).toBeInTheDocument();
    });

    it('should render all metrics', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('Jawline')).toBeInTheDocument();
      expect(screen.getByText('Skin Quality')).toBeInTheDocument();
      expect(screen.getByText('Eye Area')).toBeInTheDocument();
    });

    it('should render all improvements', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('Mewing')).toBeInTheDocument();
      expect(screen.getByText('Skincare')).toBeInTheDocument();
    });
  });

  describe('Hero Score Cards', () => {
    it('should display overall score with one decimal place', () => {
      render(<ResultsScreen {...defaultProps} overallScore={7.5} />);
      expect(screen.getByText('7.5')).toBeInTheDocument();
    });

    it('should display potential score with one decimal place', () => {
      render(<ResultsScreen {...defaultProps} potentialScore={8.75} />);
      expect(screen.getByText('8.8')).toBeInTheDocument();
    });

    it('should show potential score in purple', () => {
      const { container } = render(<ResultsScreen {...defaultProps} />);
      const potentialElement = screen.getByText('9.2');
      expect(potentialElement).toHaveClass('text-purple-500');
    });

    it('should show overall score in white', () => {
      const { container } = render(<ResultsScreen {...defaultProps} />);
      const overallElement = screen.getByText('8.0');
      expect(overallElement).toHaveClass('text-white');
    });

    it('should handle whole number scores', () => {
      render(<ResultsScreen {...defaultProps} overallScore={7} potentialScore={9} />);
      expect(screen.getByText('7.0')).toBeInTheDocument();
      expect(screen.getByText('9.0')).toBeInTheDocument();
    });
  });

  describe('Improvement Gap', () => {
    it('should display improvement gap when potential > overall', () => {
      render(<ResultsScreen {...defaultProps} overallScore={7.0} potentialScore={8.5} />);
      expect(screen.getByText('+1.5 Potential Growth')).toBeInTheDocument();
    });

    it('should not display improvement gap when potential = overall', () => {
      render(<ResultsScreen {...defaultProps} overallScore={8.0} potentialScore={8.0} />);
      expect(screen.queryByText(/Potential Growth/)).not.toBeInTheDocument();
    });

    it('should not display improvement gap when potential < overall', () => {
      render(<ResultsScreen {...defaultProps} overallScore={8.0} potentialScore={7.0} />);
      expect(screen.queryByText(/Potential Growth/)).not.toBeInTheDocument();
    });

    it('should show arrow up icon with improvement gap', () => {
      render(<ResultsScreen {...defaultProps} overallScore={7.0} potentialScore={8.5} />);
      expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument();
    });

    it('should format improvement gap to one decimal place', () => {
      render(<ResultsScreen {...defaultProps} overallScore={7.33} potentialScore={8.99} />);
      expect(screen.getByText('+1.7 Potential Growth')).toBeInTheDocument();
    });
  });

  describe('Metrics Section', () => {
    it('should display "Your Metrics" heading', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('Your Metrics')).toBeInTheDocument();
    });

    it('should display all metric names', () => {
      render(<ResultsScreen {...defaultProps} />);
      mockMetrics.forEach((metric) => {
        expect(screen.getByText(metric.name)).toBeInTheDocument();
      });
    });

    it('should display metric scores in x/10 format', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('8.5/10')).toBeInTheDocument();
      expect(screen.getByText('7.0/10')).toBeInTheDocument();
      expect(screen.getByText('9.0/10')).toBeInTheDocument();
    });

    it('should display metric descriptions', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('Strong jawline definition')).toBeInTheDocument();
      expect(screen.getByText('Good skin clarity')).toBeInTheDocument();
      expect(screen.getByText('Excellent eye symmetry')).toBeInTheDocument();
    });

    it('should handle empty metrics array', () => {
      render(<ResultsScreen {...defaultProps} metrics={[]} />);
      expect(screen.getByText('Your Metrics')).toBeInTheDocument();
    });

    it('should handle single metric', () => {
      const singleMetric = [mockMetrics[0]];
      render(<ResultsScreen {...defaultProps} metrics={singleMetric} />);
      expect(screen.getByText('Jawline')).toBeInTheDocument();
    });
  });

  describe('Improvements Section', () => {
    it('should display "Your Improvement Plan" heading', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('Your Improvement Plan')).toBeInTheDocument();
    });

    it('should display improvement emojis', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('💪')).toBeInTheDocument();
      expect(screen.getByText('🧴')).toBeInTheDocument();
    });

    it('should display improvement titles', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('Mewing')).toBeInTheDocument();
      expect(screen.getByText('Skincare')).toBeInTheDocument();
    });

    it('should display improvement descriptions', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('Practice proper tongue posture daily')).toBeInTheDocument();
      expect(screen.getByText('Use retinol and sunscreen')).toBeInTheDocument();
    });

    it('should handle empty improvements array', () => {
      render(<ResultsScreen {...defaultProps} improvements={[]} />);
      expect(screen.getByText('Your Improvement Plan')).toBeInTheDocument();
    });
  });

  describe('Header Navigation', () => {
    it('should render back button', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<ResultsScreen {...defaultProps} />);

      await user.click(screen.getByLabelText('Go back'));

      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });

    it('should render settings button', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    });

    it('should call onSettings when settings button is clicked', async () => {
      const user = userEvent.setup();
      render(<ResultsScreen {...defaultProps} />);

      await user.click(screen.getByLabelText('Settings'));

      expect(defaultProps.onSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('Footer Action Buttons', () => {
    it('should render Save to History button', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('Save to History')).toBeInTheDocument();
    });

    it('should call onSaveToHistory when Save to History is clicked', async () => {
      const user = userEvent.setup();
      render(<ResultsScreen {...defaultProps} />);

      await user.click(screen.getByText('Save to History'));

      expect(defaultProps.onSaveToHistory).toHaveBeenCalledTimes(1);
    });

    it('should render Analyze Again button', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByText('Analyze Again')).toBeInTheDocument();
    });

    it('should call onAnalyzeAgain when Analyze Again is clicked', async () => {
      const user = userEvent.setup();
      render(<ResultsScreen {...defaultProps} />);

      await user.click(screen.getByText('Analyze Again'));

      expect(defaultProps.onAnalyzeAgain).toHaveBeenCalledTimes(1);
    });
  });

  describe('Optional Callbacks', () => {
    it('should render without onBack callback', () => {
      const propsWithoutBack = { ...defaultProps, onBack: undefined };
      render(<ResultsScreen {...propsWithoutBack} />);
      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
    });

    it('should render without onSettings callback', () => {
      const propsWithoutSettings = { ...defaultProps, onSettings: undefined };
      render(<ResultsScreen {...propsWithoutSettings} />);
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    });

    it('should render without onSaveToHistory callback', () => {
      const propsWithoutSave = { ...defaultProps, onSaveToHistory: undefined };
      render(<ResultsScreen {...propsWithoutSave} />);
      expect(screen.getByText('Save to History')).toBeInTheDocument();
    });

    it('should render without onAnalyzeAgain callback', () => {
      const propsWithoutAnalyze = { ...defaultProps, onAnalyzeAgain: undefined };
      render(<ResultsScreen {...propsWithoutAnalyze} />);
      expect(screen.getByText('Analyze Again')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high scores', () => {
      render(<ResultsScreen {...defaultProps} overallScore={10.0} potentialScore={10.0} />);
      const scores = screen.getAllByText('10.0');
      expect(scores).toHaveLength(2); // Overall and Potential
    });

    it('should handle very low scores', () => {
      render(<ResultsScreen {...defaultProps} overallScore={1.0} potentialScore={2.0} />);
      expect(screen.getByText('1.0')).toBeInTheDocument();
      expect(screen.getByText('2.0')).toBeInTheDocument();
    });

    it('should handle zero scores', () => {
      render(<ResultsScreen {...defaultProps} overallScore={0} potentialScore={0} />);
      const scores = screen.getAllByText('0.0');
      expect(scores).toHaveLength(2); // Overall and Potential
    });

    it('should handle large number of metrics', () => {
      const manyMetrics: MetricData[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Metric ${i + 1}`,
        score: i + 1,
        description: `Description ${i + 1}`,
      }));

      render(<ResultsScreen {...defaultProps} metrics={manyMetrics} />);

      manyMetrics.forEach((metric) => {
        expect(screen.getByText(metric.name)).toBeInTheDocument();
      });
    });

    it('should handle large number of improvements', () => {
      const manyImprovements: ImprovementRecommendation[] = Array.from({ length: 10 }, (_, i) => ({
        emoji: '🔥',
        title: `Improvement ${i + 1}`,
        description: `Description ${i + 1}`,
      }));

      render(<ResultsScreen {...defaultProps} improvements={manyImprovements} />);

      manyImprovements.forEach((improvement) => {
        expect(screen.getByText(improvement.title)).toBeInTheDocument();
      });
    });

    it('should handle decimal metric scores', () => {
      const decimalMetrics: MetricData[] = [
        { name: 'Test', score: 7.55, description: 'Test metric' },
      ];

      render(<ResultsScreen {...defaultProps} metrics={decimalMetrics} />);
      expect(screen.getByText('7.5/10')).toBeInTheDocument();
    });

    it('should handle long metric descriptions', () => {
      const longDescription = 'This is a very long description that should still render properly and not break the layout';
      const metricsWithLongDesc: MetricData[] = [
        { name: 'Test', score: 8.0, description: longDescription },
      ];

      render(<ResultsScreen {...defaultProps} metrics={metricsWithLongDesc} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should have fixed header', () => {
      const { container } = render(<ResultsScreen {...defaultProps} />);
      const header = container.querySelector('header');
      expect(header).toHaveClass('fixed');
    });

    it('should have fixed footer', () => {
      const { container } = render(<ResultsScreen {...defaultProps} />);
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('fixed');
    });

    it('should have proper button styling for Save to History', () => {
      render(<ResultsScreen {...defaultProps} />);
      const button = screen.getByText('Save to History');
      expect(button).toHaveClass('bg-white', 'text-black');
    });

    it('should have proper button styling for Analyze Again', () => {
      render(<ResultsScreen {...defaultProps} />);
      const button = screen.getByText('Analyze Again');
      expect(button).toHaveClass('bg-transparent', 'border-2', 'border-white');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label for back button', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
    });

    it('should have aria-label for settings button', () => {
      render(<ResultsScreen {...defaultProps} />);
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<ResultsScreen {...defaultProps} />);
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });
});
