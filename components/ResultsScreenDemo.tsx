import React from 'react';
import ResultsScreen from './ResultsScreen';

/**
 * DEMO: FaceIQ Results Screen
 *
 * This demo showcases the ResultsScreen component with sample data.
 * Use this to test the component in isolation before integrating into your app.
 */

const ResultsScreenDemo: React.FC = () => {
  // Sample metrics data
  const sampleMetrics = [
    {
      name: 'Facial Symmetry',
      score: 7.8,
      maxScore: 10,
      description: 'Well-balanced facial structure with minimal asymmetry'
    },
    {
      name: 'Skin Quality',
      score: 6.5,
      maxScore: 10,
      description: 'Good baseline with room for improvement in texture'
    },
    {
      name: 'Proportions',
      score: 7.2,
      maxScore: 10,
      description: 'Strong golden ratio alignment in facial features'
    },
    {
      name: 'Facial Harmony',
      score: 7.0,
      maxScore: 10,
      description: 'Features work well together creating balance'
    },
    {
      name: 'Feature Definition',
      score: 7.4,
      maxScore: 10,
      description: 'Clear and distinct facial features'
    },
    {
      name: 'Overall Balance',
      score: 7.1,
      maxScore: 10,
      description: 'Harmonious overall appearance'
    },
  ];

  // Sample recommendations
  const sampleRecommendations = [
    {
      icon: '💧',
      title: 'Hydration',
      description: 'Increase water intake to 3L daily for improved skin elasticity and natural glow',
      category: 'hydration' as const
    },
    {
      icon: '📸',
      title: 'Photo Technique',
      description: 'Try natural lighting at golden hour (sunrise/sunset) for more accurate facial assessment',
      category: 'photo' as const
    },
    {
      icon: '💪',
      title: 'Consistency',
      description: 'Maintain your improvement routine for 30 days to see measurable progress',
      category: 'consistency' as const
    },
    {
      icon: '⚡',
      title: 'Quick Win',
      description: 'Get 7-8 hours of quality sleep nightly to reduce under-eye darkness and puffiness',
      category: 'quick-win' as const
    },
  ];

  // Event handlers
  const handleBack = () => {
    console.log('🔙 Back button clicked');
    alert('Back button clicked - In production, this would navigate back');
  };

  const handleSettings = () => {
    console.log('⚙️ Settings button clicked');
    alert('Settings button clicked - In production, this would open settings');
  };

  const handleSaveToHistory = () => {
    console.log('💾 Save to History clicked');
    alert('Save to History clicked - In production, this would save the results');
  };

  const handleAnalyzeAgain = () => {
    console.log('🔄 Analyze Again clicked');
    alert('Analyze Again clicked - In production, this would restart the analysis');
  };

  return (
    <ResultsScreen
      overallScore={5.0}
      potentialScore={7.5}
      metrics={sampleMetrics}
      recommendations={sampleRecommendations}
      onBack={handleBack}
      onSettings={handleSettings}
      onSaveToHistory={handleSaveToHistory}
      onAnalyzeAgain={handleAnalyzeAgain}
    />
  );
};

export default ResultsScreenDemo;
