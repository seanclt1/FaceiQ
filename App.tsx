import React, { useState, useRef, useEffect } from 'react';
import { Camera, Zap, Activity, MessageSquare, Upload, X, ChevronRight, ChevronLeft, User, Swords, Trophy, AlertTriangle, Scan, Eye, Dumbbell, Sparkles, Scissors, Shield } from 'lucide-react';
import { AnalysisResult, AppTab, TIER_MAP, COACH_TOPICS, DAILY_TASKS, ChatMessage, MogResult } from './types';
import { analyzeFace, getCoachResponse, compareFaces } from './services/geminiService';
import ScoreCard from './components/ScoreCard';
import { auth, onAuthStateChanged, User as FirebaseUser } from './services/firebase';
import Auth from './components/Auth';

// -----------------------------------------------------------------------------
// CONFIGURATION: Replace this URL with your own image URL or Base64 string.
// -----------------------------------------------------------------------------
const HERO_IMAGE_URL = "https://www.famousbirthdays.com/faces/clavicular-image.jpg";

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCAN);
  
  // Analysis State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'I am your AI aesthetics coach. Ask me anything about looksmaxxing, physiology, or style.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Mog Checker State
  const [mogImage1, setMogImage1] = useState<string | null>(null);
  const [mogImage2, setMogImage2] = useState<string | null>(null);
  const [mogResult, setMogResult] = useState<MogResult | null>(null);
  const [isMogging, setIsMogging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mogInput1Ref = useRef<HTMLInputElement>(null);
  const mogInput2Ref = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Swipe gesture refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeTab]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        startAnalysis(base64.split(',')[1]); // Remove header for API
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMogSelect = (event: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (slot === 1) setMogImage1(base64);
        else setMogImage2(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startMogBattle = async () => {
      if (!mogImage1 || !mogImage2) return;
      setIsMogging(true);
      try {
          // Pass base64 without header
          const res = await compareFaces(mogImage1.split(',')[1], mogImage2.split(',')[1]);
          setMogResult(res);
      } catch (e) {
          alert("Battle failed.");
      } finally {
          setIsMogging(false);
      }
  };

  const startAnalysis = async (base64Data: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Fake progress bar for UX
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 10);
      });
    }, 300);

    try {
      const data = await analyzeFace(base64Data);
      setResult(data);
      clearInterval(interval);
      setAnalysisProgress(100);
      setTimeout(() => setIsAnalyzing(false), 500); // Small delay to show 100%
    } catch (error) {
      alert("Analysis failed. Please try a different photo.");
      setIsAnalyzing(false);
      setSelectedImage(null);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, newMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
        const apiHistory = chatHistory.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));
        
        const responseText = await getCoachResponse(newMsg.text, apiHistory);
        setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (e) {
        setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: "Error connecting to Coach." }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  // --- Helpers ---
  const getImprovementIcon = (area: string) => {
    const text = area.toLowerCase();
    if (text.includes('jaw') || text.includes('chin') || text.includes('structure')) return <Shield size={28} />;
    if (text.includes('skin') || text.includes('acne') || text.includes('complexion')) return <Sparkles size={28} />;
    if (text.includes('eye') || text.includes('brow') || text.includes('orbit')) return <Eye size={28} />;
    if (text.includes('hair') || text.includes('grooming')) return <Scissors size={28} />;
    if (text.includes('weight') || text.includes('fat') || text.includes('muscle') || text.includes('lean')) return <Dumbbell size={28} />;
    return <Zap size={28} />;
  };

  const getPriorityStyles = (priority: string) => {
    if (priority === 'High') return 'bg-brand-danger/20 text-brand-danger border-brand-danger/30';
    if (priority === 'Medium') return 'bg-brand-warn/20 text-brand-warn border-brand-warn/30';
    return 'bg-brand-accent/20 text-brand-accent border-brand-accent/30';
  };

  // --- Swipe Handlers ---

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Reset
    touchStartX.current = null;
    touchStartY.current = null;

    // Horizontal swipe detection (dominance > vertical) & threshold (50px)
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      const tabs = [AppTab.SCAN, AppTab.EXTRAS, AppTab.DAILY, AppTab.COACH];
      const currentIndex = tabs.indexOf(activeTab);

      if (diffX > 0) {
        // Swipe Left -> Go Next
        if (currentIndex < tabs.length - 1) {
          setActiveTab(tabs[currentIndex + 1]);
        }
      } else {
        // Swipe Right -> Go Prev
        if (currentIndex > 0) {
          setActiveTab(tabs[currentIndex - 1]);
        }
      }
    }
  };

  // --- Views ---

  const renderScanView = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center h-full px-6">
          <div className="relative w-64 h-80 rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-brand-primary/20 border border-zinc-800">
            {selectedImage && <img src={selectedImage} alt="Scanning" className="w-full h-full object-cover opacity-60" />}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent"></div>
            
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary shadow-[0_0_15px_#8B5CF6] animate-[scan_2s_ease-in-out_infinite]"></div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Generating your scan</h2>
          <div className="w-full max-w-xs bg-zinc-800 h-4 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-brand-primary transition-all duration-300 ease-out" style={{ width: `${analysisProgress}%` }}></div>
          </div>
          <p className="text-zinc-500 font-mono">{analysisProgress}%</p>
        </div>
      );
    }

    if (result && selectedImage) {
      return (
        <div className="pb-24 px-4 pt-6 animate-fade-in relative">
          {/* Back Button */}
          <button 
            onClick={() => { setSelectedImage(null); setResult(null); }}
            className="absolute top-6 left-4 z-10 p-2 bg-zinc-900/80 backdrop-blur-md rounded-full text-zinc-400 hover:text-white border border-zinc-800 active:scale-95 transition-all"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Header */}
          <div className="flex justify-center mb-8 relative mt-2">
             <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-brand-primary to-brand-accent">
                <img src={selectedImage} className="w-full h-full rounded-full object-cover border-4 border-brand-black" alt="Profile" />
             </div>
             <div className="absolute -bottom-3 bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-brand-secondary">
               {result.tier}
             </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <ScoreCard label="Overall" score={result.scores.overall} fullWidth />
            <ScoreCard label="Potential" score={result.scores.potential} color="bg-brand-accent" fullWidth />
            
            <ScoreCard label="Masculinity" score={result.scores.masculinity} />
            <ScoreCard label="Jawline" score={result.scores.jawline} />
            <ScoreCard label="Skin Quality" score={result.scores.skinQuality} />
            <ScoreCard label="Eye Area" score={result.scores.eyeArea} />
          </div>

          {/* Improvements */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-secondary" />
              Priorities
            </h3>
            <div className="space-y-3">
              {result.improvements.map((imp, idx) => (
                <div key={idx} className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-5 transition-transform hover:bg-zinc-800/50`}>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${getPriorityStyles(imp.priority)}`}>
                    {getImprovementIcon(imp.area)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-base text-gray-200">{imp.area}</h4>
                      {imp.priority === 'High' && (
                        <span className="text-[10px] bg-brand-danger text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">{imp.advice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={() => { setSelectedImage(null); setResult(null); }}
            className="w-full py-4 bg-brand-primary hover:bg-violet-600 text-white font-bold rounded-2xl mb-8 shadow-[0_0_20px_rgba(139,92,246,0.4)] active:scale-95 transition-all"
          >
            New Scan
          </button>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col pt-8 pb-24 px-6 relative">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-extrabold tracking-tighter">FaceiQ</h1>
            <button 
                onClick={() => auth.signOut()}
                className="p-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
                <User size={24} />
            </button>
         </div>

         {/* Hero Image / Placeholder */}
         <div className="flex-1 flex flex-col relative">
            {/* X Close Button - Outside the picture in the black area */}
            <button
              className="absolute -top-2 right-0 z-20 w-8 h-8 bg-zinc-200 hover:bg-white text-zinc-800 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
              aria-label="Close"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="w-full h-full max-h-[75vh] bg-zinc-900 rounded-[2.5rem] overflow-hidden relative group border border-zinc-800 shadow-2xl">
               <img
                 src={HERO_IMAGE_URL}
                 className="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-80 transition-opacity duration-500"
                 alt="Model"
               />

               {/* Overlay Content */}
               <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-black via-black/20 to-transparent">
                  <div className="w-full px-6 pb-8 text-center">
                    <p className="text-white text-xl font-medium mb-6 drop-shadow-md leading-tight">Know your stats.<br/>Maximize your potential.</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-brand-primary hover:bg-violet-600 text-white font-semibold py-3.5 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2.5 text-base"
                    >
                      <Scan size={20} strokeWidth={2} />
                      <span>Scan Face</span>
                    </button>
                    <p className="text-zinc-400 text-xs mt-5 font-medium tracking-wide">Powered by Gemini 3 • 100% Private</p>
                  </div>
               </div>
            </div>

            {/* Footer Links - Privacy/Restore wide, Terms/Policy centered */}
            <div className="flex items-center justify-between w-full mt-4 px-1">
              <button className="text-zinc-500 hover:text-zinc-300 text-[11px] font-medium tracking-wide transition-colors">
                Privacy
              </button>
              <div className="flex items-center gap-4">
                <button className="text-zinc-500 hover:text-zinc-300 text-[11px] font-medium tracking-wide transition-colors">
                  Terms
                </button>
                <button className="text-zinc-500 hover:text-zinc-300 text-[11px] font-medium tracking-wide transition-colors">
                  Policy
                </button>
              </div>
              <button className="text-zinc-500 hover:text-zinc-300 text-[11px] font-medium tracking-wide transition-colors">
                Restore
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
         </div>
      </div>
    );
  };

  const renderDailyView = () => (
    <div className="pt-10 pb-24 px-6 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold">1</span>
          <span className="text-2xl">🔥</span>
          <span className="text-2xl font-bold text-gray-300">day streak</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-3xl p-6 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-4">Your progress</h2>
          <button className="bg-white text-brand-primary px-8 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
            View
          </button>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/2">
           {selectedImage ? (
               <img src={selectedImage} className="h-full w-full object-cover opacity-80 mask-image-gradient" alt="User" />
           ) : (
             <div className="h-full w-full bg-white/10 backdrop-blur-sm"></div>
           )}
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Your routine</h3>
      <div className="space-y-4">
        {DAILY_TASKS.map(task => (
          <div key={task.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{task.icon}</span>
              <span className="font-medium text-gray-200">{task.title}</span>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-zinc-600 cursor-pointer hover:bg-brand-primary hover:border-brand-primary transition-colors"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCoachView = () => (
    <div className="h-screen pb-24 flex flex-col pt-10 px-4">
       {!chatHistory.length || chatHistory.length === 1 ? (
         <>
          <div className="flex justify-between items-center mb-6 px-2">
            <h1 className="text-3xl font-bold">Your Coach</h1>
          </div>

          <div 
             className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-8 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
             onClick={() => setChatHistory(prev => [...prev, {id: 'init', role: 'user', text: 'Hello'}])}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center">
                <MessageSquare className="text-white" fill="white" size={20} />
              </div>
              <span className="font-medium text-lg">Ask me anything</span>
            </div>
            <ChevronRight className="text-zinc-500" />
          </div>

          <h3 className="text-lg font-bold mb-4 px-2">Learn how to...</h3>
          <div className="space-y-3 overflow-y-auto">
            {COACH_TOPICS.map(topic => (
              <button 
                key={topic.id}
                onClick={() => {
                    const msg = `How do I ${topic.title.toLowerCase()}?`;
                    setChatInput(msg);
                    handleSendMessage(); 
                }}
                className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${topic.color} flex items-center justify-center text-xl shadow-lg`}>
                    {topic.icon}
                  </div>
                  <span className="font-medium text-gray-200">{topic.title}</span>
                </div>
                <ChevronRight className="text-zinc-600 group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
         </>
       ) : (
         <div className="flex flex-col h-full">
            <div className="flex items-center mb-4 pt-1">
                <button 
                    onClick={() => setChatHistory([{ id: '1', role: 'model', text: 'I am your AI aesthetics coach. Ask me anything about looksmaxxing, physiology, or style.' }])}
                    className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-400 hover:text-white mr-4 active:scale-95 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <h3 className="font-bold text-xl">Chat Session</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 px-2 scrollbar-hide pb-4">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-sm' 
                      : 'bg-zinc-800 text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 text-gray-400 p-4 rounded-2xl rounded-tl-sm text-sm">Thinking...</div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="bg-zinc-900 p-2 rounded-full border border-zinc-800 flex items-center gap-2 mt-2">
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask advice..."
                className="bg-transparent flex-1 px-4 py-2 outline-none text-white text-sm"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isChatLoading}
                className="p-3 bg-brand-primary rounded-full text-white disabled:opacity-50"
              >
                <Zap size={18} fill="currentColor" />
              </button>
            </div>
         </div>
       )}
    </div>
  );

  const renderExtrasView = () => (
    <div className="h-full px-6 pt-10 pb-24 flex flex-col overflow-y-auto animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-brand-danger/20 rounded-xl text-brand-danger">
                <Swords size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold uppercase tracking-tight">Mog Checker</h2>
                <p className="text-zinc-400 text-xs">Compare faces & check stats</p>
            </div>
        </div>

        {/* Input Area */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div 
                onClick={() => mogInput1Ref.current?.click()}
                className={`aspect-[3/4] rounded-2xl border-2 border-dashed ${mogImage1 ? 'border-brand-primary' : 'border-zinc-700'} bg-zinc-900 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden`}
            >
                {mogImage1 ? (
                    <img src={mogImage1} className="w-full h-full object-cover" />
                ) : (
                    <>
                        <Upload className="text-zinc-600 mb-2" />
                        <span className="text-xs text-zinc-500 font-bold">YOU</span>
                    </>
                )}
            </div>
            
            <div 
                onClick={() => mogInput2Ref.current?.click()}
                className={`aspect-[3/4] rounded-2xl border-2 border-dashed ${mogImage2 ? 'border-brand-primary' : 'border-zinc-700'} bg-zinc-900 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden`}
            >
                {mogImage2 ? (
                    <img src={mogImage2} className="w-full h-full object-cover" />
                ) : (
                    <>
                        <Upload className="text-zinc-600 mb-2" />
                        <span className="text-xs text-zinc-500 font-bold">OPPONENT</span>
                    </>
                )}
            </div>
        </div>

        {/* Hidden Inputs */}
        <input ref={mogInput1Ref} type="file" className="hidden" accept="image/*" onChange={(e) => handleMogSelect(e, 1)} />
        <input ref={mogInput2Ref} type="file" className="hidden" accept="image/*" onChange={(e) => handleMogSelect(e, 2)} />

        {/* Action Button */}
        {!mogResult && (
            <button 
                onClick={startMogBattle}
                disabled={!mogImage1 || !mogImage2 || isMogging}
                className="w-full bg-brand-danger text-white font-black italic text-xl py-4 rounded-xl disabled:opacity-50 disabled:grayscale mb-8 shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 transition-all"
            >
                {isMogging ? "ANALYZING..." : "START BATTLE"}
            </button>
        )}

        {/* Results */}
        {mogResult && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-danger"></div>
                
                <div className="flex flex-col items-center text-center mb-6">
                    <Trophy className="text-yellow-400 mb-2 w-10 h-10" />
                    <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none mb-1">
                        {mogResult.winnerTitle}
                    </h3>
                    <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-mono text-zinc-300">
                        {mogResult.winnerIndex === 0 ? "LEFT" : "RIGHT"} WINS BY {mogResult.diffScore} PTS
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="p-4 bg-brand-black rounded-xl border border-zinc-800">
                        <p className="text-xs text-brand-primary font-bold uppercase mb-1">The Advantage</p>
                        <p className="text-sm text-white font-medium">{mogResult.reason}</p>
                    </div>
                    
                    <div className="p-4 bg-red-950/30 rounded-xl border border-red-900/50">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle size={12} className="text-red-500" />
                            <p className="text-xs text-red-500 font-bold uppercase">The Roast</p>
                        </div>
                        <p className="text-sm text-red-200 italic">"{mogResult.roast}"</p>
                    </div>
                </div>

                <button 
                    onClick={() => { setMogResult(null); setMogImage1(null); setMogImage2(null); }}
                    className="w-full mt-6 py-3 text-zinc-500 font-bold text-sm hover:text-white transition-colors"
                >
                    Reset Battle
                </button>
            </div>
        )}
    </div>
  );

  // Authentication Gating
  if (authLoading) {
      return (
          <div className="bg-brand-black min-h-screen flex items-center justify-center text-white">
              <div className="animate-pulse flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span className="text-sm font-medium text-zinc-400">Loading FaceiQ...</span>
              </div>
          </div>
      );
  }

  if (!user) {
      return <Auth />;
  }

  return (
    <div className="bg-brand-black min-h-screen text-white font-sans selection:bg-brand-primary selection:text-white max-w-md mx-auto relative border-x border-zinc-900 shadow-2xl">
      
      {/* Dynamic Content */}
      <main 
        className="h-screen overflow-y-auto no-scrollbar"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeTab === AppTab.SCAN && renderScanView()}
        {activeTab === AppTab.DAILY && renderDailyView()}
        {activeTab === AppTab.COACH && renderCoachView()}
        {activeTab === AppTab.EXTRAS && renderExtrasView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-brand-black/90 backdrop-blur-lg border-t border-zinc-900 pb-6 pt-3 px-6 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab(AppTab.SCAN)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === AppTab.SCAN ? 'text-white' : 'text-zinc-600'}`}
        >
          <Camera size={24} />
          <span className="text-[10px] font-bold tracking-wide">SCAN</span>
        </button>
        
        <button 
          onClick={() => setActiveTab(AppTab.EXTRAS)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === AppTab.EXTRAS ? 'text-white' : 'text-zinc-600'}`}
        >
           <Swords size={24} />
           <span className="text-[10px] font-bold tracking-wide">MOG</span>
        </button>

        <button 
          onClick={() => setActiveTab(AppTab.DAILY)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === AppTab.DAILY ? 'text-white' : 'text-zinc-600'}`}
        >
           <Zap size={24} />
           <span className="text-[10px] font-bold tracking-wide">DAILY</span>
        </button>

        <button 
          onClick={() => setActiveTab(AppTab.COACH)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === AppTab.COACH ? 'text-white' : 'text-zinc-600'}`}
        >
           <MessageSquare size={24} />
           <span className="text-[10px] font-bold tracking-wide">COACH</span>
        </button>
      </nav>

      {/* Tailwind Custom Animation Injection */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mask-image-gradient {
            mask-image: linear-gradient(to right, transparent, black 40%);
        }
      `}</style>
    </div>
  );
};

export default App;