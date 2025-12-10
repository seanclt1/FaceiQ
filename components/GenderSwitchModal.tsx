import React from 'react';
import { X, Check } from 'lucide-react';

interface GenderSwitchModalProps {
  targetGender: 'Male' | 'Female';
  onConfirm: () => void;
  onCancel: () => void;
}

const GenderSwitchModal: React.FC<GenderSwitchModalProps> = ({ targetGender, onConfirm, onCancel }) => {
  const isFemale = targetGender === 'Female';
  
  // High-quality aesthetic images
  const imageSrc = isFemale
    ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80" // Radiant female portrait
    : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"; // Sharp male portrait

  const title = isFemale ? "Switch to Female Mode?" : "Switch to Male Mode?";
  const subtitle = isFemale 
    ? "Unlock aesthetics analysis optimized for feminine beauty standards."
    : "Switch to male-focused metrics: Jawline, Hunter Eyes, and more.";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-6">
      <div className="w-full max-w-sm bg-[#1C1C1E] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative animate-scale-up">
        
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/80 transition-colors z-20 backdrop-blur-sm cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="relative h-64 w-full">
            <img 
                src={imageSrc} 
                alt={targetGender} 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-transparent to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="px-6 pb-8 -mt-6 relative z-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed px-2">
                {subtitle}
            </p>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={onConfirm}
                    className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isFemale 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 shadow-pink-500/20' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20'
                    }`}
                >
                    <span>Confirm Switch</span>
                    <Check size={18} strokeWidth={3} />
                </button>
                
                <button 
                    onClick={onCancel}
                    className="w-full py-4 rounded-2xl font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GenderSwitchModal;