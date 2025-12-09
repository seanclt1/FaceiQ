import React, { useState, useRef, useEffect } from 'react';
import { Camera, Zap, Activity, MessageSquare, Upload, X, ChevronRight, ChevronLeft, User, Swords, Trophy, AlertTriangle, Scan, Eye, Dumbbell, Sparkles, Scissors, Shield, Check, SwitchCamera, Star, TrendingUp } from 'lucide-react';
import { AnalysisResult, AppTab, TIER_MAP, COACH_TOPICS, DAILY_TASKS, ChatMessage, MogResult } from './types';
import { analyzeFace, getCoachResponse, compareFaces } from './services/geminiService';
import ScoreCard from './components/ScoreCard';
import RadarChart from './components/RadarChart';

// -----------------------------------------------------------------------------
// CONFIGURATION: Replace this URL with your own image URL or Base64 string.
// -----------------------------------------------------------------------------
const HERO_IMAGE_URL = "https://www.famousbirthdays.com/faces/clavicular-image.jpg";

const App: React.FC = () => {
  // Auth state removed

  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SCAN);
  
  // Analysis State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Scan Options Modal State
  const [showScanOptions, setShowScanOptions] = useState(false);

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

  // Daily Tasks State
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  // Camera Lifecycle
  useEffect(() => {
    if (!isCameraOpen) return;

    let localStream: MediaStream | null = null;

    const initCamera = async () => {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setCameraStream(localStream);
        } catch (e) {
            console.error("Camera access denied:", e);
            alert("Could not access camera. Please check permissions.");
            setIsCameraOpen(false);
        }
    };

    initCamera();

    return () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        setCameraStream(null);
    };
  }, [isCameraOpen, facingMode]);

  // Bind stream to video element
  useEffect(() => {
      if (videoRef.current && cameraStream) {
          videoRef.current.srcObject = cameraStream;
          videoRef.current.play().catch(e => console.error("Video play error:", e));
      }
  }, [cameraStream]);

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
    // Reset so same file can be selected again if needed
    event.target.value = '';
  };

  const capturePhoto = () => {
      if (videoRef.current) {
          const video = videoRef.current;
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
               // Mirror if user facing
              if (facingMode === 'user') {
                  ctx.translate(canvas.width, 0);
                  ctx.scale(-1, 1);
              }
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const base64 = canvas.toDataURL('image/jpeg');
              
              setIsCameraOpen(false); // This triggers cleanup via useEffect
              setSelectedImage(base64);
              startAnalysis(base64.split(',')[1]);
          }
      }
  };

  const handleMog1Select = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMogImage1(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handleMog2Select = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMogImage2(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
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

  const toggleTask = (id: number) => {
    setCompletedTasks(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
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
      // ORDER: Daily -> Extras(Mog) -> Scan -> Rating -> Coach
      const tabs = [AppTab.DAILY, AppTab.EXTRAS, AppTab.SCAN, AppTab.RATING, AppTab.COACH];
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

  const renderCameraOverlay = () => {
      if (!isCameraOpen) return null;
      return (
          <div className="fixed inset-0 z-[60] bg-black flex flex-col">
              <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                  playsInline 
                  muted 
                  autoPlay 
              />
              
              {/* Header Controls */}
              <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/60 to-transparent pt-12">
                   <button 
                      type="button"
                      onClick={() => setIsCameraOpen(false)} 
                      className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white cursor-pointer hover:bg-black/60 transition-colors"
                   >
                      <X size={24} />
                   </button>
              </div>
              
              {/* Face Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="w-64 h-80 border-2 border-white/40 rounded-[45%] relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-1/3 h-1 bg-white/70 rounded-full"></div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-1 w-1/3 h-1 bg-white/70 rounded-full"></div>
                      {/* Crosshairs */}
                      <div className="absolute top-1/2 left-4 right-4 h-px bg-white/10"></div>
                      <div className="absolute left-1/2 top-4 bottom-4 w-px bg-white/10"></div>
                   </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 w-full p-10 flex justify-around items-center bg-gradient-to-t from-black/90 via-black/40 to-transparent pb-16">
                  <div className="w-10"></div> {/* Spacer to center shutter */}
                  
                  <button 
                      type="button"
                      onClick={capturePhoto}
                      className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative active:scale-90 transition-transform cursor-pointer shadow-lg"
                  >
                      <div className="w-16 h-16 bg-white rounded-full"></div>
                  </button>

                  <button 
                      type="button"
                      onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} 
                      className="p-3 bg-zinc-800/60 backdrop-blur rounded-full text-white cursor-pointer hover:bg-zinc-700/80 transition-colors"
                  >
                      <SwitchCamera size={24} />
                  </button>
              </div>
          </div>
      );
  };

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
      // Prepare data for Radar Chart
      const radarData = [
        { label: 'Jaw', value: result.scores.jawline },
        { label: 'Skin', value: result.scores.skinQuality },
        { label: 'Cheeks', value: result.scores.cheekbones },
        { label: 'Eyes', value: result.scores.eyeArea },
        { label: 'Masc', value: result.scores.masculinity },
        { label: 'Potent.', value: result.scores.potential },
      ];

      return (
        <div className="pb-24 px-4 pt-6 animate-fade-in relative">
          {/* Back Button */}
          <button 
            type="button"
            onClick={() => { setSelectedImage(null); setResult(null); }}
            className="absolute top-6 left-4 z-10 p-3 bg-zinc-900/80 backdrop-blur-md rounded-full text-zinc-400 hover:text-white border border-zinc-800 active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:border-zinc-600"
          >
            <ChevronLeft size={24} />
          </button>

          {/* New Header with Radar Chart */}
          <div className="flex flex-col items-center mb-2 mt-4">
             <div className="relative">
                 <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-brand-primary to-brand-accent mb-4">
                    <img src={selectedImage} className="w-full h-full rounded-full object-cover border-4 border-brand-black" alt="Profile" />
                 </div>
                 <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-brand-secondary whitespace-nowrap shadow-lg">
                   {result.tier}
                 </div>
             </div>

             {/* STAT POLYGON */}
             <div className="w-full -mt-2">
                <RadarChart data={radarData} size={300} />
             </div>
          </div>

          {/* Score Grid (Simplified since we have radar) */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <ScoreCard label="Overall Score" score={result.scores.overall} fullWidth />
            {/* Other details are in the radar, keeping Overall is essential. 
                Maybe keep specific interesting ones that might not be on radar if any, 
                but Radar covers most. Let's keep a couple key ones below for quick reading. */}
            <div className="col-span-2 grid grid-cols-3 gap-2">
                 <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-center">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Age Est.</div>
                    <div className="text-lg font-bold text-white">24</div>
                 </div>
                 <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-center">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Symm.</div>
                    <div className="text-lg font-bold text-white">92%</div>
                 </div>
                 <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-center">
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">Contrast</div>
                    <div className="text-lg font-bold text-white">Med</div>
                 </div>
            </div>
          </div>

          {/* Improvements */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-secondary" />
              Priorities
            </h3>
            <div className="space-y-3">
              {result.improvements.map((imp, idx) => (
                <div key={idx} className={`bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 flex items-center gap-5 transition-transform hover:bg-zinc-800/50`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${getPriorityStyles(imp.priority)}`}>
                    {getImprovementIcon(imp.area)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-gray-200">{imp.area}</h4>
                      {imp.priority === 'High' && (
                        <span className="text-[9px] bg-brand-danger text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
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
            type="button"
            onClick={() => { setSelectedImage(null); setResult(null); }}
            className="w-full py-4 bg-brand-primary hover:bg-violet-600 text-white font-bold rounded-2xl mb-8 shadow-[0_0_20px_rgba(139,92,246,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            New Scan
          </button>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col pt-8 pb-24 px-6 relative overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[80px]"></div>
            <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-brand-accent/5 rounded-full blur-[80px]"></div>
         </div>

         <div className="flex justify-between items-center mb-6 relative z-10">
            <h1 className="text-4xl font-extrabold tracking-tighter">FaceiQ</h1>
            <button 
                type="button"
                className="p-3 bg-zinc-900/80 backdrop-blur-md border border-zinc-800/50 rounded-full text-zinc-400 hover:text-white transition-colors active:scale-95 cursor-pointer shadow-md"
                onClick={() => alert("User profiles coming soon!")}
            >
                <User size={24} />
            </button>
         </div>

         {/* Hero Image / Placeholder */}
         <div className="flex-1 flex flex-col relative z-10">
            <div className="w-full h-full max-h-[75vh] bg-zinc-900 rounded-[2.5rem] overflow-hidden relative group border border-zinc-800 shadow-2xl">
               <img 
                 src={HERO_IMAGE_URL} 
                 className="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-80 transition-opacity duration-500 scale-105 group-hover:scale-100 ease-out"
                 alt="Model" 
               />
               
               {/* Overlay Content */}
               <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-black via-black/40 to-transparent">
                  <div className="w-full px-6 pb-8 text-center">
                    <p className="text-white text-xl font-medium mb-6 drop-shadow-md leading-tight text-balance">Know your stats.<br/>Maximize your potential.</p>
                    
                    {/* Action Buttons */}
                    <div className="w-full mt-2">
                        <button 
                          type="button"
                          onClick={() => setShowScanOptions(true)}
                          className="w-full bg-brand-primary hover:bg-violet-600 text-white font-semibold py-4 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer border border-white/10 group"
                        >
                          <Scan size={24} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-bold uppercase tracking-wide">Scan Face</span>
                        </button>
                    </div>

                    <p className="text-zinc-400 text-[10px] mt-6 font-medium tracking-wide uppercase opacity-70">Powered by Gemini 3 • 100% Private</p>
                  </div>
               </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileSelect} 
            />
         </div>

         {/* Scan Options Modal */}
         {showScanOptions && (
             <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in" onClick={() => setShowScanOptions(false)}>
                <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 flex flex-col gap-3 shadow-2xl transform transition-all scale-100 mb-20 sm:mb-0" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-2 sm:hidden"></div>
                    <h3 className="text-center text-lg font-bold text-white mb-2">Choose Method</h3>
                    
                    <button 
                        onClick={() => { setShowScanOptions(false); setIsCameraOpen(true); }}
                        className="flex items-center gap-4 p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl border border-zinc-700/50 transition-all active:scale-95 group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                            <Camera size={24} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-bold text-white">Camera</span>
                            <span className="text-xs text-zinc-400">Take a photo now</span>
                        </div>
                        <ChevronRight className="ml-auto text-zinc-600" size={20} />
                    </button>

                    <button 
                        onClick={() => { setShowScanOptions(false); fileInputRef.current?.click(); }}
                        className="flex items-center gap-4 p-4 bg-zinc-800/50 hover:bg-zinc-800 rounded-2xl border border-zinc-700/50 transition-all active:scale-95 group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="font-bold text-white">Upload</span>
                            <span className="text-xs text-zinc-400">Choose from gallery</span>
                        </div>
                        <ChevronRight className="ml-auto text-zinc-600" size={20} />
                    </button>
                    
                    <button 
                        onClick={() => setShowScanOptions(false)}
                        className="mt-2 py-3 text-zinc-500 font-bold text-sm cursor-pointer hover:text-white"
                    >
                        Cancel
                    </button>
                </div>
             </div>
         )}
      </div>
    );
  };

  const renderDailyView = () => (
    <div className="pt-10 pb-24 px-6 animate-fade-in relative">
      {/* Bg Decor */}
      <div className="absolute top-20 right-0 w-[60%] h-[40%] bg-brand-primary/10 blur-[80px] pointer-events-none"></div>

      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">{Math.max(1, completedTasks.length)}</span>
          <span className="text-3xl animate-pulse">🔥</span>
          <div className="flex flex-col leading-none ml-1">
             <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Day</span>
             <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Streak</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-brand-primary to-violet-900 rounded-3xl p-6 mb-8 relative overflow-hidden shadow-lg shadow-brand-primary/20">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-4 text-white">Your progress</h2>
          <button 
            type="button"
            onClick={() => alert("Detailed stats coming soon!")}
            className="bg-white/90 backdrop-blur text-brand-primary px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform cursor-pointer hover:bg-white"
          >
            View Stats
          </button>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/2">
           {selectedImage ? (
               <img src={selectedImage} className="h-full w-full object-cover opacity-60 mix-blend-overlay mask-image-gradient" alt="User" />
           ) : (
             <div className="h-full w-full bg-white/5 backdrop-blur-sm"></div>
           )}
        </div>
      </div>

      <h3 className="text-lg font-bold mb-4 text-zinc-300 uppercase tracking-wider text-xs">Today's Routine</h3>
      <div className="space-y-3 relative z-10">
        {DAILY_TASKS.map(task => {
          const isCompleted = completedTasks.includes(task.id);
          return (
            <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className={`group border p-4 rounded-2xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all duration-300 ${isCompleted ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{task.icon}</span>
                <span className={`font-medium transition-colors ${isCompleted ? 'text-brand-primary line-through opacity-70' : 'text-gray-200'}`}>{task.title}</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-brand-primary border-brand-primary scale-110' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                 {isCompleted && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRatingView = () => (
    <div className="h-full px-6 pt-10 pb-24 flex flex-col overflow-y-auto animate-fade-in relative">
         <div className="absolute top-0 left-0 w-[60%] h-[40%] bg-brand-accent/10 blur-[80px] pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl text-white shadow-lg shadow-yellow-500/20">
                <Star size={24} fill="currentColor" />
            </div>
            <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Global Ratings</h2>
                <p className="text-zinc-400 text-xs font-medium">Top profiles this week</p>
            </div>
        </div>

        <div className="space-y-4 relative z-10">
            {[
                { name: 'Alex M.', score: 98, tier: 'True Adam', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop' },
                { name: 'Jordan K.', score: 96, tier: 'True Adam', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop' },
                { name: 'Casey L.', score: 94, tier: 'Chad', img: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=150&h=150&fit=crop' },
                { name: 'You', score: result?.scores.overall || '-', tier: result?.tier || 'Not Ranked', img: selectedImage || null, highlight: true },
                 { name: 'Riley P.', score: 91, tier: 'Chad', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop' },
            ].map((user, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${user.highlight ? 'bg-brand-primary/10 border-brand-primary' : 'bg-zinc-900/50 border-zinc-800'}`}>
                    <div className="font-bold text-zinc-500 w-6">{user.highlight ? '#' : i + 1}</div>
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-800">
                        {user.img ? <img src={user.img} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-800" />}
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-[10px] text-zinc-400 uppercase tracking-wider">{user.tier}</div>
                    </div>
                    <div className="text-xl font-bold text-white">{user.score}</div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderCoachView = () => (
    <div className="h-screen pb-24 flex flex-col pt-10 px-4 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none"></div>

       {!chatHistory.length || chatHistory.length === 1 ? (
         <>
          <div className="flex justify-between items-center mb-6 px-2 relative z-10">
            <h1 className="text-3xl font-bold">Your Coach</h1>
          </div>

          <div 
             className="bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-2xl p-5 mb-8 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform shadow-lg relative z-10 hover:bg-zinc-800/80"
             onClick={() => setChatHistory(prev => [...prev, {id: 'init', role: 'user', text: 'Hello'}])}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/30">
                <MessageSquare className="text-white" fill="white" size={20} />
              </div>
              <div>
                  <span className="font-bold text-lg block text-white">Ask me anything</span>
                  <span className="text-xs text-zinc-400">Instant aesthetic advice</span>
              </div>
            </div>
            <ChevronRight className="text-zinc-500" />
          </div>

          <h3 className="text-xs font-bold mb-4 px-2 text-zinc-500 uppercase tracking-widest">Suggested Topics</h3>
          <div className="space-y-3 overflow-y-auto pb-4 relative z-10">
            {COACH_TOPICS.map(topic => (
              <button 
                type="button"
                key={topic.id}
                onClick={() => {
                    const msg = `How do I ${topic.title.toLowerCase()}?`;
                    setChatInput(msg);
                    handleSendMessage(); 
                }}
                className="w-full bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/50 p-4 rounded-xl flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${topic.color} flex items-center justify-center text-lg shadow-md`}>
                    {topic.icon}
                  </div>
                  <span className="font-medium text-gray-200 text-sm">{topic.title}</span>
                </div>
                <ChevronRight className="text-zinc-600 group-hover:text-white transition-colors" size={16} />
              </button>
            ))}
          </div>
         </>
       ) : (
         <div className="flex flex-col h-full relative z-10">
            <div className="flex items-center mb-4 pt-1 pb-2 border-b border-zinc-800/50">
                <button 
                    type="button"
                    onClick={() => setChatHistory([{ id: '1', role: 'model', text: 'I am your AI aesthetics coach. Ask me anything about looksmaxxing, physiology, or style.' }])}
                    className="p-3 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-400 hover:text-white mr-4 active:scale-95 transition-all cursor-pointer shadow-md"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h3 className="font-bold text-lg">Coach</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-green-500 font-medium">Online</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 px-1 scrollbar-hide pb-4">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'model' && (
                      <div className="w-8 h-8 rounded-full bg-brand-primary flex-shrink-0 mr-2 flex items-center justify-center self-end mb-1">
                          <MessageSquare size={14} fill="white" className="text-white"/>
                      </div>
                  )}
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-sm' 
                      : 'bg-zinc-800 border border-zinc-700/50 text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-brand-primary flex-shrink-0 mr-2 flex items-center justify-center self-end mb-1">
                          <MessageSquare size={14} fill="white" className="text-white"/>
                    </div>
                    <div className="bg-zinc-800 text-gray-400 p-4 rounded-2xl rounded-tl-sm text-sm animate-pulse">Thinking...</div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="bg-zinc-900/90 backdrop-blur p-2 rounded-[2rem] border border-zinc-700/50 flex items-center gap-2 mt-2 shadow-lg">
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask advice..."
                className="bg-transparent flex-1 px-4 py-2 outline-none text-white text-sm placeholder-zinc-500"
              />
              <button 
                type="button"
                onClick={handleSendMessage}
                disabled={isChatLoading}
                className="p-3 bg-brand-primary hover:bg-violet-600 rounded-full text-white disabled:opacity-50 transition-colors shadow-md shadow-brand-primary/20 cursor-pointer"
              >
                <Zap size={18} fill="currentColor" />
              </button>
            </div>
         </div>
       )}
    </div>
  );

  const renderExtrasView = () => (
    <div className="h-full px-6 pt-10 pb-24 flex flex-col overflow-y-auto animate-fade-in relative">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-red-500/5 blur-[100px] pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl text-white shadow-lg shadow-red-500/20">
                <Swords size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Mog Battle</h2>
                <p className="text-zinc-400 text-xs font-medium">1v1 Comparison Engine</p>
            </div>
        </div>

        {/* Input Area */}
        <div className="relative mb-8 z-10">
            <div className="grid grid-cols-2 gap-4">
                <div 
                    onClick={() => mogInput1Ref.current?.click()}
                    className={`aspect-[3/4] rounded-2xl border-2 border-dashed ${mogImage1 ? 'border-brand-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'border-zinc-700 hover:border-zinc-600'} bg-zinc-900 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden active:scale-95 transition-all duration-300 hover:bg-zinc-800`}
                >
                    {mogImage1 ? (
                        <img src={mogImage1} className="w-full h-full object-cover" alt="You" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <div className="p-3 bg-zinc-800 rounded-full mb-3 text-zinc-500">
                                <Upload size={20} />
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Left</span>
                        </div>
                    )}
                </div>
                
                <div 
                    onClick={() => mogInput2Ref.current?.click()}
                    className={`aspect-[3/4] rounded-2xl border-2 border-dashed ${mogImage2 ? 'border-brand-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'border-zinc-700 hover:border-zinc-600'} bg-zinc-900 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden active:scale-95 transition-all duration-300 hover:bg-zinc-800`}
                >
                    {mogImage2 ? (
                        <img src={mogImage2} className="w-full h-full object-cover" alt="Opponent" />
                    ) : (
                        <div className="flex flex-col items-center">
                             <div className="p-3 bg-zinc-800 rounded-full mb-3 text-zinc-500">
                                <Upload size={20} />
                            </div>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Right</span>
                        </div>
                    )}
                </div>
            </div>

            {/* VS Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-full border-4 border-zinc-900 flex items-center justify-center z-20 shadow-xl">
                 <span className="text-red-500 font-black italic text-sm">VS</span>
            </div>
        </div>

        {/* Hidden Inputs */}
        <input ref={mogInput1Ref} type="file" className="hidden" accept="image/*" onChange={handleMog1Select} />
        <input ref={mogInput2Ref} type="file" className="hidden" accept="image/*" onChange={handleMog2Select} />

        {/* Action Button */}
        {!mogResult && (
            <button 
                type="button"
                onClick={startMogBattle}
                disabled={!mogImage1 || !mogImage2 || isMogging}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-black italic text-xl py-4 rounded-2xl disabled:opacity-50 disabled:grayscale mb-8 shadow-[0_0_25px_rgba(239,68,68,0.4)] active:scale-95 transition-all relative overflow-hidden group z-10 cursor-pointer"
            >
                {isMogging ? (
                    <span className="flex items-center justify-center gap-2">
                        <Activity className="animate-spin" /> CALCULATING...
                    </span>
                ) : (
                    <span className="relative z-10 group-hover:tracking-widest transition-all duration-300">START BATTLE</span>
                )}
            </button>
        )}

        {/* Results */}
        {mogResult && (
            <div className="bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-3xl p-6 relative overflow-hidden animate-fade-in shadow-2xl z-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-danger"></div>
                
                <div className="flex flex-col items-center text-center mb-6">
                    <Trophy className="text-yellow-400 mb-3 w-12 h-12 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" fill="currentColor" />
                    <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none mb-2">
                        {mogResult.winnerTitle}
                    </h3>
                    <div className="inline-block px-4 py-1.5 bg-zinc-800/50 rounded-full border border-zinc-700">
                        <span className="text-xs font-mono text-zinc-300 font-bold">
                            {mogResult.winnerIndex === 0 ? "LEFT" : "RIGHT"} WINS (+{mogResult.diffScore})
                        </span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="p-4 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                        <p className="text-[10px] text-brand-primary font-bold uppercase mb-1 tracking-wider">The Edge</p>
                        <p className="text-sm text-white font-medium leading-relaxed">{mogResult.reason}</p>
                    </div>
                    
                    <div className="p-4 bg-red-950/20 rounded-xl border border-red-900/30">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle size={12} className="text-red-500" />
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">The Roast</p>
                        </div>
                        <p className="text-sm text-red-200/80 italic">"{mogResult.roast}"</p>
                    </div>
                </div>

                <button 
                    type="button"
                    onClick={() => { setMogResult(null); setMogImage1(null); setMogImage2(null); }}
                    className="w-full mt-6 py-3 text-zinc-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
                >
                    Reset Battle
                </button>
            </div>
        )}
    </div>
  );

  return (
    <div className="bg-brand-black min-h-screen text-white font-sans selection:bg-brand-primary selection:text-white max-w-md mx-auto relative border-x border-zinc-900 shadow-2xl overflow-hidden">
      
      {/* Fullscreen Camera Overlay */}
      {renderCameraOverlay()}

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
        {activeTab === AppTab.RATING && renderRatingView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-brand-black/80 backdrop-blur-xl border-t border-zinc-800 pb-6 pt-3 px-4 flex justify-between items-center z-50">
        <button 
          type="button"
          onClick={() => setActiveTab(AppTab.DAILY)}
          className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 cursor-pointer ${activeTab === AppTab.DAILY ? 'text-brand-warn scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
           <Zap size={22} strokeWidth={activeTab === AppTab.DAILY ? 2.5 : 2} />
           <span className="text-[9px] font-bold tracking-widest uppercase">Daily</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab(AppTab.EXTRAS)}
          className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 cursor-pointer ${activeTab === AppTab.EXTRAS ? 'text-brand-danger scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
           <Swords size={22} strokeWidth={activeTab === AppTab.EXTRAS ? 2.5 : 2} />
           <span className="text-[9px] font-bold tracking-widest uppercase">Mog</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab(AppTab.SCAN)}
          className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 cursor-pointer ${activeTab === AppTab.SCAN ? 'text-brand-primary scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          <Camera size={22} strokeWidth={activeTab === AppTab.SCAN ? 2.5 : 2} />
          <span className="text-[9px] font-bold tracking-widest uppercase">Scan</span>
        </button>
        
        <button 
          type="button"
          onClick={() => setActiveTab(AppTab.RATING)}
          className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 cursor-pointer ${activeTab === AppTab.RATING ? 'text-brand-accent scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
           <Star size={22} strokeWidth={activeTab === AppTab.RATING ? 2.5 : 2} />
           <span className="text-[9px] font-bold tracking-widest uppercase">Rating</span>
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab(AppTab.COACH)}
          className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 cursor-pointer ${activeTab === AppTab.COACH ? 'text-brand-secondary scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
           <MessageSquare size={22} strokeWidth={activeTab === AppTab.COACH ? 2.5 : 2} />
           <span className="text-[9px] font-bold tracking-widest uppercase">Coach</span>
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
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mask-image-gradient {
            mask-image: linear-gradient(to right, transparent, black 40%);
        }
        .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default App;