import React from 'react';
import ResultsScreen from './ResultsScreen';
import { ResultsScreenProps } from './ResultsScreen.types';

/**
 * Example usage of the ResultsScreen component
 * This demonstrates how to use the component with sample data
 */
const ResultsScreenExample: React.FC = () => {
  // Sample data matching the design requirements
  const exampleData: ResultsScreenProps = {
    overallScore: 5.0,
    potentialScore: 7.5,

    metrics: [
      {
        name: 'Facial Symmetry',
        score: 7.8,
        description: 'Excellent balance between left and right facial features',
      },
      {
        name: 'Skin Quality',
        score: 6.5,
        description: 'Good baseline with room for hydration improvements',
      },
      {
        name: 'Proportions',
        score: 7.2,
        description: 'Well-balanced facial feature ratios',
      },
      {
        name: 'Facial Harmony',
        score: 7.0,
        description: 'Features work well together cohesively',
      },
      {
        name: 'Feature Definition',
        score: 7.4,
        description: 'Strong bone structure with clear definition',
      },
      {
        name: 'Overall Balance',
        score: 7.1,
        description: 'Harmonious integration of all facial elements',
      },
    ],

    improvements: [
      {
        emoji: '💧',
        title: 'Hydration',
        description: 'Increase water intake to 8-10 glasses daily for improved skin elasticity and glow',
      },
      {
        emoji: '📸',
        title: 'Photo Technique',
        description: 'Try natural lighting at golden hour and slightly elevated camera angles',
      },
      {
        emoji: '💪',
        title: 'Consistency',
        description: 'Maintain a daily skincare routine with morning and evening cleansing',
      },
      {
        emoji: '⚡',
        title: 'Quick Win',
        description: 'Get 7-8 hours of quality sleep to reduce under-eye darkness and puffiness',
      },
    ],

    onBack: () => console.log('Back button clicked'),
    onSettings: () => console.log('Settings clicked'),
    onSaveToHistory: () => console.log('Save to history clicked'),
    onAnalyzeAgain: () => console.log('Analyze again clicked'),
  };

  return <ResultsScreen {...exampleData} />;
};

export default ResultsScreenExample;
