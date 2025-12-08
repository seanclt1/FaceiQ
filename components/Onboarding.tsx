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

const GENDER_OPTIONS: SlideOption[] = [
  { id: 'male', label: 'Male', icon: '👨' },
  { id: 'female', label: 'Female', icon: '👩' },
];

const AGE_OPTIONS: SlideOption[] = [
  { id: '18-24', label: '18-24' },
  { id: '25-34', label: '25-34' },
  { id: '35-44', label: '35-44' },
  { id: '45+', label: '45+' },
];

const GOAL_OPTIONS: SlideOption[] = [
  { id: 'rating', label: 'Know my rating', icon: '📊' },
  { id: 'improve', label: 'Improve my looks', icon: '💪' },
  { id: 'track', label: 'Track progress', icon: '📈' },
  { id: 'curious', label: 'Just curious', icon: '🤔' },
];

const CONCERN_OPTIONS: SlideOption[] = [
  { id: 'jawline', label: 'Jawline', icon: '🔷' },
  { id: 'skin', label: 'Skin Quality', icon: '✨' },
  { id: 'eyes', label: 'Eye Area', icon: '👁️' },
  { id: 'symmetry', label: 'Facial Symmetry', icon: '⚖️' },
  { id: 'hair', label: 'Hair', icon: '💇' },
  { id: 'overall', label: 'Overall Look', icon: '🎯' },
];

// Tough looking male model images for slide backgrounds
const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', // Male model 1
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80', // Male model 2
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80', // Male model 3
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80', // Male model 4
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    gender: '',
    ageRange: '',
    goal: '',
    concerns: [],
  });

  const totalSlides = 4;

  const handleGenderSelect = (gender: string) => {
    setAnswers(prev => ({ ...prev, gender }));
  };

  const handleAgeSelect = (age: string) => {
    setAnswers(prev => ({ ...prev, ageRange: age }));
  };

  const handleGoalSelect = (goal: string) => {
    setAnswers(prev => ({ ...prev, goal }));
  };

  const handleConcernToggle = (concern: string) => {
    setAnswers(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern],
    }));
  };

  const canProceed = () => {
    switch (currentSlide) {
      case 0: return answers.gender !== '';
      case 1: return answers.ageRange !== '';
      case 2: return answers.goal !== '';
      case 3: return answers.concerns.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
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

  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0:
        return (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/30">
              <User size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-center">What's your gender?</h2>
            <p className="text-zinc-400 mb-8 text-center">We'll personalize your analysis</p>

            <div className="w-full space-y-3">
              {GENDER_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleGenderSelect(option.id)}
                  className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    answers.gender === option.id
                      ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/20'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-3xl">{option.icon}</span>
                  <span className="text-lg font-semibold">{option.label}</span>
                  {answers.gender === option.id && (
                    <div className="ml-auto w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                      <ChevronRight size={16} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
              <Calendar size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-center">How old are you?</h2>
            <p className="text-zinc-400 mb-8 text-center">Age affects facial analysis results</p>

            <div className="w-full grid grid-cols-2 gap-3">
              {AGE_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleAgeSelect(option.id)}
                  className={`p-5 rounded-2xl border-2 transition-all ${
                    answers.ageRange === option.id
                      ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/20'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xl font-bold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
              <Target size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-center">What's your goal?</h2>
            <p className="text-zinc-400 mb-8 text-center">Help us tailor your experience</p>

            <div className="w-full space-y-3">
              {GOAL_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleGoalSelect(option.id)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    answers.goal === option.id
                      ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/20'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-base font-semibold">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg shadow-rose-500/30">
              <AlertCircle size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-center">Areas of concern?</h2>
            <p className="text-zinc-400 mb-8 text-center">Select all that apply</p>

            <div className="w-full grid grid-cols-2 gap-3">
              {CONCERN_OPTIONS.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleConcernToggle(option.id)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    answers.concerns.includes(option.id)
                      ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/20'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="text-sm font-semibold text-center">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-brand-black min-h-screen text-white font-sans relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={SLIDE_IMAGES[currentSlide]}
          alt="Background"
          className="w-full h-full object-cover opacity-20 transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-brand-black/80 to-brand-black" />
      </div>

      {/* Progress Dots */}
      <div className="relative z-10 pt-16 px-6">
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-8 bg-brand-primary'
                  : idx < currentSlide
                  ? 'w-4 bg-brand-primary/50'
                  : 'w-4 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Back Button */}
        {currentSlide > 0 && (
          <button
            onClick={handleBack}
            className="absolute top-16 left-4 p-2 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pt-8 pb-32 animate-fade-in" key={currentSlide}>
        {renderSlideContent()}
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-brand-black via-brand-black to-transparent pt-16">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            canProceed()
              ? 'bg-brand-primary hover:bg-violet-600 shadow-lg shadow-brand-primary/30 active:scale-[0.98]'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          {currentSlide === totalSlides - 1 ? 'Continue' : 'Next'}
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Animation Styles */}
      <style>{`
        .animate-fade-in {
          animation: fadeInSlide 0.4s ease-out forwards;
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
