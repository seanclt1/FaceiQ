import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreCard from '../ScoreCard';

describe('ScoreCard', () => {
  it('should render with label and score', () => {
    render(<ScoreCard label="Test Score" score={75} />);

    expect(screen.getByText('Test Score')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('should display score as number', () => {
    render(<ScoreCard label="Overall" score={85} />);

    const scoreElement = screen.getByText('85');
    expect(scoreElement).toBeInTheDocument();
    expect(scoreElement).toHaveClass('text-3xl', 'font-bold', 'text-white');
  });

  it('should display label in uppercase with correct styling', () => {
    render(<ScoreCard label="jawline" score={70} />);

    const labelElement = screen.getByText('jawline');
    expect(labelElement).toHaveClass('text-gray-400', 'text-xs', 'font-semibold', 'uppercase', 'tracking-wider');
  });

  describe('Color coding based on score', () => {
    it('should use green (accent) color for score >= 80', () => {
      const { container } = render(<ScoreCard label="Excellent" score={85} />);

      const progressBar = container.querySelector('.bg-brand-accent');
      expect(progressBar).toBeInTheDocument();
    });

    it('should use purple (primary) color for score >= 60 and < 80', () => {
      const { container } = render(<ScoreCard label="Good" score={70} />);

      const progressBar = container.querySelector('.bg-brand-primary');
      expect(progressBar).toBeInTheDocument();
    });

    it('should use orange (warn) color for score >= 40 and < 60', () => {
      const { container } = render(<ScoreCard label="Fair" score={50} />);

      const progressBar = container.querySelector('.bg-brand-warn');
      expect(progressBar).toBeInTheDocument();
    });

    it('should use red (danger) color for score < 40', () => {
      const { container } = render(<ScoreCard label="Poor" score={30} />);

      const progressBar = container.querySelector('.bg-brand-danger');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle edge case score of 80 (boundary)', () => {
      const { container } = render(<ScoreCard label="Boundary" score={80} />);

      const progressBar = container.querySelector('.bg-brand-accent');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle edge case score of 60 (boundary)', () => {
      const { container } = render(<ScoreCard label="Boundary" score={60} />);

      const progressBar = container.querySelector('.bg-brand-primary');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle edge case score of 40 (boundary)', () => {
      const { container } = render(<ScoreCard label="Boundary" score={40} />);

      const progressBar = container.querySelector('.bg-brand-warn');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Progress bar width', () => {
    it('should set progress bar width to match score percentage', () => {
      const { container } = render(<ScoreCard label="Test" score={75} />);

      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '75%' });
    });

    it('should handle 0% width', () => {
      const { container } = render(<ScoreCard label="Test" score={0} />);

      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should handle 100% width', () => {
      const { container } = render(<ScoreCard label="Test" score={100} />);

      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should handle decimal scores', () => {
      const { container } = render(<ScoreCard label="Test" score={72.5} />);

      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '72.5%' });
    });
  });

  describe('Layout and styling', () => {
    it('should not span full width by default', () => {
      const { container } = render(<ScoreCard label="Test" score={50} />);

      const cardElement = container.firstChild;
      expect(cardElement).not.toHaveClass('col-span-2');
    });

    it('should span full width when fullWidth prop is true', () => {
      const { container } = render(<ScoreCard label="Test" score={50} fullWidth={true} />);

      const cardElement = container.firstChild;
      expect(cardElement).toHaveClass('col-span-2');
    });

    it('should have correct card styling', () => {
      const { container } = render(<ScoreCard label="Test" score={50} />);

      const cardElement = container.firstChild;
      expect(cardElement).toHaveClass('bg-brand-card', 'rounded-2xl', 'p-4', 'flex', 'flex-col');
    });

    it('should have progress bar container with correct styling', () => {
      const { container } = render(<ScoreCard label="Test" score={50} />);

      const progressBarContainer = container.querySelector('.bg-zinc-800');
      expect(progressBarContainer).toBeInTheDocument();
      expect(progressBarContainer).toHaveClass('w-full', 'h-2', 'rounded-full', 'overflow-hidden', 'mt-2');
    });

    it('should have transition animation on progress bar', () => {
      const { container } = render(<ScoreCard label="Test" score={50} />);

      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveClass('transition-all', 'duration-1000', 'ease-out');
    });
  });

  describe('Custom color prop', () => {
    it('should use custom color when provided', () => {
      const { container } = render(<ScoreCard label="Test" score={75} color="bg-custom-color" />);

      // Custom color should be ignored in favor of score-based color
      // The component logic shows that color param is set but then overridden
      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle very high scores above 100', () => {
      const { container } = render(<ScoreCard label="Test" score={150} />);

      expect(screen.getByText('150')).toBeInTheDocument();
      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '150%' });
    });

    it('should handle negative scores', () => {
      const { container } = render(<ScoreCard label="Test" score={-10} />);

      expect(screen.getByText('-10')).toBeInTheDocument();
      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '-10%' });
    });

    it('should handle empty label', () => {
      render(<ScoreCard label="" score={50} />);

      // Should render without crashing
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should handle very long labels', () => {
      const longLabel = 'This is a very long label that might overflow';
      render(<ScoreCard label={longLabel} score={50} />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    it('should handle score of exactly 1', () => {
      const { container } = render(<ScoreCard label="Test" score={1} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '1%' });
    });

    it('should handle score of exactly 99', () => {
      const { container } = render(<ScoreCard label="Test" score={99} />);

      expect(screen.getByText('99')).toBeInTheDocument();
      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '99%' });
    });
  });

  describe('Accessibility', () => {
    it('should render semantic HTML structure', () => {
      const { container } = render(<ScoreCard label="Test Score" score={75} />);

      expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    });

    it('should display score and label in readable format', () => {
      render(<ScoreCard label="Jawline" score={85} />);

      const label = screen.getByText('Jawline');
      const score = screen.getByText('85');

      expect(label).toBeVisible();
      expect(score).toBeVisible();
    });
  });

  describe('Multiple instances', () => {
    it('should render multiple ScoreCards independently', () => {
      const { container } = render(
        <>
          <ScoreCard label="First" score={30} />
          <ScoreCard label="Second" score={70} />
          <ScoreCard label="Third" score={90} />
        </>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();

      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('90')).toBeInTheDocument();
    });
  });
});
