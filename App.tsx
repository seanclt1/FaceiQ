import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Zap, Upload, X, ChevronRight, ChevronLeft, SwitchCamera, 
  Scan, Eye, Dumbbell, Sparkles, Scissors, Shield, 
  Home, Grid, MessageCircle, User, Activity, Crown, Swords, Send, CheckCircle2, Circle
} from 'lucide-react';
import { AnalysisResult, AppTab, ChatMessage, WorkoutTask } from './types';
import { analyzeFace, getCoachResponse } from './services/geminiService';
import ScoreCard from './components/ScoreCard';
import RadarChart from './components/RadarChart';
import ProUpsellModal from './components/ProUpsellModal';
import FemaleProUpsellModal from './components/FemaleProUpsellModal';
import GenderSwitchModal from './components/GenderSwitchModal';

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------
const HERO_IMAGE_URL = "https://www.famousbirthdays.com/faces/clavicular-image.jpg";

const DEFAULT_WORKOUTS: WorkoutTask[] = [
  { id: '1', title: 'Hard Mewing', reps: '10 mins', category: 'Structure', completed: false },
  { id: '2', title: 'Chin Tucks', reps: '20 reps', category: 'Structure', completed: false },
  { id: '3', title: 'Ice Facial', reps: '3 mins', category: 'Skin', completed: false },
  { id: '4', title: 'Eyelid Pulling', reps: '30 secs', category: 'Eyes', completed: false },
  { id: '5', title: 'Masseter Gum Chew', reps: '15 mins', category: 'Structure', completed: false },
];

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  // App Flow State
  const [showUpsell, setShowUpsell] = useState(true);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [pendingGender, setPendingGender] = useState<'Male' | 'Female' | null>(null);

  // Analysis State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Modal State
  const [showScanOptions, setShowScanOptions] = useState(false);

  // Coach State
  const [coachMode, setCoachMode] = useState<'chat' | 'workouts'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: "Ready to ascend? Send me a photo or ask me how to mog." }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [workouts, setWorkouts] = useState<WorkoutTask[]>(DEFAULT_WORKOUTS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'coach' && coachMode === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, coachMode]);

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
              
              setIsCameraOpen(false); 
              setSelectedImage(base64);
              startAnalysis(base64.split(',')[1]);
          }
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
      setTimeout(() => setIsAnalyzing(false), 500); 
    } catch (error) {
      alert("Analysis failed. Please try a different photo.");
      setIsAnalyzing(false);
      setSelectedImage(null);
    }
  };

  const resetApp = () => {
      setSelectedImage(null);
      setResult(null);
      setAnalysisProgress(0);
  };

  const openScan = () => {
      setShowScanOptions(true);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newUserMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: chatInput 
    };

    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsTyping(true);

    const reply = await getCoachResponse(newUserMsg.text, chatMessages, result);

    const newBotMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: reply
    };

    setChatMessages(prev => [...prev, newBotMsg]);
    setIsTyping(false);
  };

  const toggleWorkout = (id: string) => {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, completed: !w.completed } : w));
  };

  const handleGenderToggle = () => {
    const nextGender = gender === 'Male' ? 'Female' : 'Male';
    setPendingGender(nextGender);
  };

  const confirmGenderSwitch = () => {
    if (pendingGender) {
        setGender(pendingGender);
        // Explicitly load female upsell when switching to female
        if (pendingGender === 'Female') {
            setShowUpsell(true);
        }
        setPendingGender(null);
    }
  };

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

  // ---------------------------------------------------------------------------
  // RENDER CONTENT
  // ---------------------------------------------------------------------------

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <div className="flex-1 flex flex-col px-6 pb-12 relative z-10 justify-center">
             <div className="w-full aspect-[3/4] max-h-[55vh] bg-zinc-900 rounded-[2.5rem] overflow-hidden relative group shadow-2xl mb-8 mt-4">
               <img 
                 src={HERO_IMAGE_URL} 
                 className="w-full h-full object-cover opacity-60 grayscale group-hover:opacity-80 transition-opacity duration-500 scale-105 group-hover:scale-100 ease-out"
                 alt="Model" 
               />
               
               <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-black via-black/40 to-transparent px-6 pb-5 text-center">
                    <p className="text-white text-3xl font-bold drop-shadow-md leading-tight text-balance">
                        Know your stats.<br/>Maximize your potential.
                    </p>
               </div>
            </div>

            <button 
                type="button"
                onClick={openScan}
                className="w-full bg-brand-primary hover:bg-violet-600 text-white font-semibold py-5 rounded-2xl shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer border border-white/10 group"
            >
                <Scan size={24} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                <span className="text-lg font-bold uppercase tracking-wide">Scan Face</span>
            </button>
            
            <p className="text-zinc-500 text-center text-[10px] mt-6 font-medium tracking-wide uppercase opacity-70">
                Powered by Gemini • 100% Private
            </p>
          </div>
        );

      case 'tools':
        const tools = [
          { id: 'full-scan', label: 'Full Analysis', icon: Scan, color: 'text-brand-primary' },
          { id: 'eye-rating', label: 'Eye Rating', icon: Eye, color: 'text-blue-400' },
          { id: 'jaw-check', label: 'Jawline Check', icon: Shield, color: 'text-emerald-400' },
          { id: 'skin-health', label: 'Skin Health', icon: Sparkles, color: 'text-pink-400' },
          { id: 'mog-battle', label: 'Mog Battle', icon: Swords, color: 'text-red-500' },
          { id: 'potential', label: 'Potential', icon: Activity, color: 'text-amber-400' },
        ];
        
        return (
          <div className="flex-1 px-6 pt-8 pb-24 overflow-y-auto">
             <h2 className="text-2xl font-bold mb-6">Tools</h2>
             <div className="grid grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={openScan}
                    className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-zinc-800 active:scale-95 transition-all aspect-square shadow-lg"
                  >
                    <div className={`w-14 h-14 rounded-full bg-zinc-950 flex items-center justify-center ${tool.color} shadow-inner`}>
                      <tool.icon size={28} />
                    </div>
                    <span className="font-semibold text-sm">{tool.label}</span>
                  </button>
                ))}
             </div>
          </div>
        );

      case 'coach':
        return (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
             {/* Coach Header / Tabs */}
             <div className="px-6 pt-6 pb-4">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="text-brand-primary" /> Coach AI
                </h2>
                <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                    <button 
                        onClick={() => setCoachMode('chat')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${coachMode === 'chat' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Live Chat
                    </button>
                    <button 
                        onClick={() => setCoachMode('workouts')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${coachMode === 'workouts' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Daily Workouts
                    </button>
                </div>
             </div>

             {/* Coach Content */}
             <div className="flex-1 overflow-y-auto pb-24 px-6">
                {coachMode === 'chat' ? (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 space-y-4 mb-4">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-brand-primary text-white rounded-br-none' 
                                            : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-none'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-zinc-900 px-4 py-3 rounded-2xl rounded-bl-none border border-zinc-800 flex gap-1">
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        {/* Input Area */}
                        <div className="sticky bottom-0 bg-brand-black pt-2 pb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask about looksmaxxing..."
                                    className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-full py-4 pl-5 pr-14 focus:outline-none focus:border-brand-primary/50 transition-colors"
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-primary rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/80 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-gradient-to-r from-brand-primary/20 to-brand-accent/10 border border-brand-primary/20 rounded-2xl p-5 mb-6">
                            <h3 className="font-bold text-white mb-1">Today's Plan</h3>
                            <p className="text-xs text-zinc-400">Complete these tasks to improve your rating.</p>
                            <div className="w-full bg-black/30 h-1.5 rounded-full mt-4 overflow-hidden">
                                <div 
                                    className="h-full bg-brand-accent transition-all duration-500" 
                                    style={{ width: `${(workouts.filter(w => w.completed).length / workouts.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        {workouts.map((task) => (
                            <div 
                                key={task.id}
                                onClick={() => toggleWorkout(task.id)}
                                className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                    task.completed 
                                        ? 'bg-zinc-900/50 border-zinc-800 opacity-60' 
                                        : 'bg-zinc-900 border-zinc-800 hover:border-brand-primary/50'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        task.completed ? 'bg-zinc-800 text-zinc-600' : 'bg-brand-primary/10 text-brand-primary'
                                    }`}>
                                        {task.category === 'Structure' && <Shield size={18} />}
                                        {task.category === 'Skin' && <Sparkles size={18} />}
                                        {task.category === 'Eyes' && <Eye size={18} />}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${task.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                                            {task.title}
                                        </h4>
                                        <span className="text-xs text-zinc-500 font-mono">{task.reps}</span>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    task.completed ? 'bg-brand-accent border-brand-accent' : 'border-zinc-600 group-hover:border-zinc-400'
                                }`}>
                                    {task.completed && <CheckCircle2 size={14} className="text-black" />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          </div>
        );

      case 'profile':
        return (
          <div className="flex-1 px-6 pt-8">
             <h2 className="text-2xl font-bold mb-6">Profile</h2>
             <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Guest User</h3>
                  <p className="text-zinc-500 text-xs">No scans saved yet</p>
                </div>
             </div>
             
             <div className="space-y-2">
                <div className="bg-zinc-900/50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-zinc-400">Total Scans</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-zinc-400">Highest Tier</span>
                  <span className="font-bold">-</span>
                </div>
             </div>
          </div>
        );
    }
  };

  if (isCameraOpen) {
      return (
          <div className="fixed inset-0 z-[60] bg-black flex flex-col">
              <video 
                  ref={videoRef} 
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                  playsInline 
                  muted 
                  autoPlay 
              />
              
              <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/60 to-transparent pt-12">
                   <button 
                      type="button"
                      onClick={() => setIsCameraOpen(false)} 
                      className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white cursor-pointer hover:bg-black/60 transition-colors"
                   >
                      <X size={24} />
                   </button>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="w-64 h-80 border-2 border-white/40 rounded-[45%] relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-1/3 h-1 bg-white/70 rounded-full"></div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-1 w-1/3 h-1 bg-white/70 rounded-full"></div>
                   </div>
              </div>

              {/* Bottom Toolbar - Strictly Centered Capture Button */}
              <div className="absolute bottom-0 w-full py-8 px-6 grid grid-cols-3 items-center z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  {/* Left: Placeholder or Gallery */}
                  <div className="flex justify-start pl-4">
                      {/* Placeholder for balance, or could be a gallery button */}
                  </div>

                  {/* Center: Capture Button */}
                  <div className="flex justify-center">
                      <button 
                          type="button"
                          onClick={capturePhoto}
                          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative active:scale-90 transition-transform cursor-pointer shadow-lg"
                      >
                          <div className="w-16 h-16 bg-white rounded-full"></div>
                      </button>
                  </div>

                  {/* Right: Switch Camera */}
                  <div className="flex justify-end pr-4">
                      <button 
                          type="button"
                          onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')} 
                          className="p-3 bg-zinc-800/60 backdrop-blur rounded-full text-white cursor-pointer hover:bg-zinc-700/80 transition-colors"
                      >
                          <SwitchCamera size={24} />
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-brand-black text-white">
        <div className="relative w-64 h-80 rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-brand-primary/20 border border-zinc-800">
          {selectedImage && <img src={selectedImage} alt="Scanning" className="w-full h-full object-cover opacity-60" />}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent"></div>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary shadow-[0_0_15px_#8B5CF6] animate-[scan_2s_ease-in-out_infinite]"></div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Analyzing Features</h2>
        <div className="w-full max-w-xs bg-zinc-800 h-4 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-brand-primary transition-all duration-300 ease-out" style={{ width: `${analysisProgress}%` }}></div>
        </div>
        <p className="text-zinc-500 font-mono">{analysisProgress}%</p>
      </div>
    );
  }

  if (result && selectedImage) {
    return (
      <div className="flex flex-col h-screen bg-brand-black text-white overflow-y-auto">
        <div className="relative w-full h-96 shrink-0">
          <img src={selectedImage} alt="Analyzed" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent" />
          <button 
            onClick={resetApp}
            className="absolute top-6 left-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors z-20"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="absolute bottom-0 left-0 w-full p-6">
             <div className="flex items-end gap-3 mb-1">
                <h1 className="text-4xl font-extrabold tracking-tighter text-white">{result.scores.overall}</h1>
                <span className="text-xl font-bold text-zinc-400 mb-1.5">/ 100</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-brand-primary rounded-full text-xs font-bold uppercase tracking-wide">
                    {result.tier}
                </div>
                {result.scores.overall >= 90 && (
                    <div className="px-3 py-1 bg-brand-accent text-black rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                        <Crown size={12} /> God Mode
                    </div>
                )}
             </div>
          </div>
        </div>

        <div className="px-6 pb-24 space-y-8">
            {/* Radar Chart */}
            <div className="bg-zinc-900/50 rounded-3xl p-4 border border-zinc-800 flex justify-center">
                <RadarChart 
                    data={[
                        { label: 'Jaw', value: result.scores.jawline },
                        { label: 'Skin', value: result.scores.skinQuality },
                        { label: 'Eyes', value: result.scores.eyeArea },
                        { label: 'Cheek', value: result.scores.cheekbones },
                        { label: 'Masc', value: result.scores.masculinity },
                        { label: 'Poten', value: result.scores.potential },
                    ]} 
                    size={280}
                />
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 gap-4">
                <ScoreCard label="Potential" score={result.scores.potential} color="bg-brand-accent" fullWidth />
                <ScoreCard label="Jawline" score={result.scores.jawline} />
                <ScoreCard label="Skin Quality" score={result.scores.skinQuality} />
                <ScoreCard label="Cheekbones" score={result.scores.cheekbones} />
                <ScoreCard label="Eye Area" score={result.scores.eyeArea} />
            </div>

            {/* Feedback */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="text-brand-primary" /> Analysis
                </h3>
                <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800 space-y-3">
                    {result.feedback.map((point, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                            <p className="text-sm text-zinc-300 leading-relaxed">{point}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Improvements */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="text-brand-accent" /> Action Plan
                </h3>
                <div className="space-y-3">
                    {result.improvements.map((item, i) => (
                        <div key={i} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex gap-4">
                            <div className="mt-1">
                                {getImprovementIcon(item.area)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-sm text-white">{item.area}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityStyles(item.priority)}`}>
                                        {item.priority}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">{item.advice}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={resetApp} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold text-white transition-colors cursor-pointer">
                Scan Another Face
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-brand-black text-white font-sans selection:bg-brand-primary selection:text-white overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-12 pb-2 flex justify-between items-center z-20">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center transform rotate-3 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                    <Scan className="text-white" size={18} strokeWidth={3} />
                </div>
                <h1 className="text-xl font-extrabold tracking-tighter">Face<span className="text-brand-primary">iQ</span></h1>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Gender Toggle */}
                <button
                    onClick={handleGenderToggle}
                    className="flex items-center bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1.5 h-9 cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                    <span className={`text-xs font-bold ${gender === 'Male' ? 'text-blue-400' : 'text-zinc-600'}`}>M</span>
                    <span className="text-zinc-600 mx-1.5 text-[10px]">/</span>
                    <span className={`text-xs font-bold ${gender === 'Female' ? 'text-pink-400' : 'text-zinc-600'}`}>F</span>
                </button>

                {/* Pro Button (Crown Only) */}
                <button 
                    onClick={() => setShowUpsell(true)}
                    className="bg-zinc-800 hover:bg-zinc-700 w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-brand-primary/10"
                >
                    <Crown size={16} className="text-brand-accent" />
                </button>
            </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Tab Bar */}
        <div className="fixed bottom-0 left-0 w-full bg-brand-black/90 backdrop-blur-lg border-t border-zinc-800 pb-8 pt-4 px-6 z-30">
            <div className="flex justify-between items-center">
                <NavButton icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <NavButton icon={Grid} label="Tools" active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
                <div className="w-12"></div> {/* Spacer for FAB */}
                <NavButton icon={MessageCircle} label="Coach" active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} />
                <NavButton icon={User} label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            </div>

            {/* Floating Action Button (Scan) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button 
                    onClick={openScan}
                    className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] border-4 border-brand-black hover:scale-105 active:scale-95 transition-all group cursor-pointer"
                >
                    <Scan size={28} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </div>
        </div>

        {/* Modals */}
        {pendingGender && (
            <GenderSwitchModal 
                targetGender={pendingGender}
                onConfirm={confirmGenderSwitch}
                onCancel={() => setPendingGender(null)}
            />
        )}

        {showUpsell && !pendingGender && (
            gender === 'Female' 
            ? <FemaleProUpsellModal onClose={() => setShowUpsell(false)} onSubscribe={() => setShowUpsell(false)} />
            : <ProUpsellModal onClose={() => setShowUpsell(false)} onSubscribe={() => setShowUpsell(false)} />
        )}
        
        {/* Scan Options Modal */}
        {showScanOptions && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowScanOptions(false)}>
                <div className="w-full bg-zinc-900 rounded-t-3xl p-6 pb-10 animate-slide-up border-t border-zinc-800" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold mb-6 text-center">New Analysis</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => { setShowScanOptions(false); setIsCameraOpen(true); }}
                            className="bg-zinc-800 hover:bg-zinc-700 p-6 rounded-2xl flex flex-col items-center gap-3 transition-colors group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Camera size={24} className="text-brand-primary" />
                            </div>
                            <span className="font-semibold">Take Photo</span>
                        </button>
                        
                        <label className="bg-zinc-800 hover:bg-zinc-700 p-6 rounded-2xl flex flex-col items-center gap-3 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload size={24} className="text-brand-accent" />
                            </div>
                            <span className="font-semibold">Upload</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => { setShowScanOptions(false); handleFileSelect(e); }} 
                                ref={fileInputRef}
                            />
                        </label>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

const NavButton: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${active ? 'text-brand-primary' : 'text-zinc-600 hover:text-zinc-400'}`}
    >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default App;