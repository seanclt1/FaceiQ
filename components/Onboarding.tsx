import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, User, Calendar, Target, AlertCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (answers: OnboardingAnswers) => void;
}

export interface OnboardingAnswers {
  gender: string;
  ageRange: string;
  goal: string;
  concerns: string[];
}

interface SlideOption {
  id: string;
  label: string;
  icon?: string;
}

const SLIDES = [
  {
    id: 'gender',
    question: 'What is your gender?',
    subtitle: 'This helps us personalize your analysis',
    icon: User,
    options: [
      { id: 'male', label: 'Male', icon: '👨' },
      { id: 'female', label: 'Female', icon: '👩' },
      { id: 'other', label: 'Prefer not to say', icon: '🙂' },
    ],
    backgroundImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  },
  {
    id: 'age',
    question: 'How old are you?',
    subtitle: 'Age affects facial structure analysis',
    icon: Calendar,
    options: [
      { id: '18-24', label: '18-24', icon: '🔥' },
      { id: '25-34', label: '25-34', icon: '💪' },
      { id: '35-44', label: '35-44', icon: '👔' },
      { id: '45+', label: '45+', icon: '🎯' },
    ],
    backgroundImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
  },
  {
    id: 'goal',
    question: 'What is your main goal?',
    subtitle: 'We\'ll focus on what matters most to you',
    icon: Target,
    options: [
      { id: 'improve', label: 'Improve my looks', icon: '✨' },
      { id: 'curious', label: 'Just curious about my rating', icon: '🤔' },
      { id: 'track', label: 'Track my progress over time', icon: '📈' },
      { id: 'compare', label: 'Compare with others', icon: '⚔️' },
    ],
    backgroundImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80',
  },
  {
    id: 'concerns',
    question: 'What areas concern you most?',
    subtitle: 'Select all that apply',
    icon: AlertCircle,
    multiSelect: true,
    options: [
      { id: 'jawline', label: 'Jawline', icon: '🦴' },
      { id: 'skin', label: 'Skin quality', icon: '✨' },
      { id: 'eyes', label: 'Eye area', icon: '👁️' },
      { id: 'symmetry', label: 'Facial symmetry', icon: '⚖️' },
      { id: 'hair', label: 'Hairline', icon: '💇' },
      { id: 'overall', label: 'Overall attractiveness', icon: '💯' },
    ],
    backgroundImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    gender: '',
    ageRange: '',
    goal: '',
    concerns: [],
  });

  const slide = SLIDES[currentSlide];
  const isMultiSelect = 'multiSelect' in slide && slide.multiSelect;
  const progress = ((currentSlide + 1) / SLIDES.length) * 100;

  const handleSelect = (optionId: string) => {
    if (isMultiSelect) {
      setAnswers(prev => {
        const current = prev.concerns;
        const updated = current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId];
        return { ...prev, concerns: updated };
      });
    } else {
      const key = slide.id as keyof Omit<OnboardingAnswers, 'concerns'>;
      setAnswers(prev => ({ ...prev, [key]: optionId }));
      // Auto-advance on single select
      setTimeout(() => {
        if (currentSlide < SLIDES.length - 1) {
          setCurrentSlide(prev => prev + 1);
        }
      }, 300);
    }
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const isCurrentValid = () => {
    if (isMultiSelect) {
      return answers.concerns.length > 0;
    }
    const key = slide.id as keyof Omit<OnboardingAnswers, 'concerns'>;
    return answers[key] !== '';
  };

  const isSelected = (optionId: string) => {
    if (isMultiSelect) {
      return answers.concerns.includes(optionId);
    }
    const key = slide.id as keyof Omit<OnboardingAnswers, 'concerns'>;
    return answers[key] === optionId;
  };

  const SlideIcon = slide.icon;

  return (
    <div className="bg-brand-black min-h-screen text-white font-sans max-w-md mx-auto relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={slide.backgroundImage}
          alt=""
          className="w-full h-full object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-brand-black/80 to-brand-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {currentSlide > 0 ? (
            <button
              onClick={handleBack}
              className="p-2 bg-zinc-900/80 backdrop-blur-md rounded-full text-zinc-400 hover:text-white border border-zinc-800 active:scale-95 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <div className="w-10" />
          )}

          <div className="flex-1 mx-4">
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <span className="text-zinc-500 text-sm font-medium">
            {currentSlide + 1}/{SLIDES.length}
          </span>
        </div>

        {/* Question */}
        <div className="mb-8 animate-fade-in" key={currentSlide}>
          <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/20">
            <SlideIcon size={32} className="text-white" />
          </div>

          <h1 className="text-3xl font-bold mb-2 leading-tight">
            {slide.question}
          </h1>
          <p className="text-zinc-400 text-base">
            {slide.subtitle}
          </p>
        </div>

        {/* Options */}
        <div className="flex-1 space-y-3 animate-fade-in" key={`options-${currentSlide}`}>
          {slide.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-200 active:scale-[0.98] ${
                isSelected(option.id)
                  ? 'bg-brand-primary/20 border-brand-primary shadow-lg shadow-brand-primary/20'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className={`text-lg font-medium ${isSelected(option.id) ? 'text-white' : 'text-zinc-300'}`}>
                {option.label}
              </span>
              {isSelected(option.id) && (
                <div className="ml-auto w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Continue Button (for multi-select or final slide) */}
        {(isMultiSelect || currentSlide === SLIDES.length - 1) && (
          <div className="mt-6 pb-4">
            <button
              onClick={handleNext}
              disabled={!isCurrentValid()}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isCurrentValid()
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/30'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {currentSlide === SLIDES.length - 1 ? 'See Your Options' : 'Continue'}
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
