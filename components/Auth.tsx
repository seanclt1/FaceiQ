import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '../services/firebase';
import { User, Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // We aren't saving user info to database yet, but we can set the display name on the auth object
        if (name) {
            await updateProfile(userCredential.user, { displayName: name });
        }
      }
    } catch (err: any) {
      console.error(err);
      const code = err.code;
      if (code === 'auth/email-already-in-use') {
        setError("User already exists. Sign in?");
      } else if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setError("Password or Email Incorrect");
      } else if (code === 'auth/weak-password') {
        setError("Password should be at least 6 characters");
      } else {
        setError(err.message || "Authentication failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-sm z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tight mb-2">FaceiQ</h1>
        </div>

        <div className="bg-brand-card/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Sign Up Fields */}
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Name</label>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center px-4 py-3 focus-within:border-brand-primary transition-colors">
                    <User size={18} className="text-zinc-500 mr-3" />
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-zinc-600"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Common Fields */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email</label>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center px-4 py-3 focus-within:border-brand-primary transition-colors">
                <Mail size={18} className="text-zinc-500 mr-3" />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-zinc-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Password</label>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center px-4 py-3 focus-within:border-brand-primary transition-colors">
                <Lock size={18} className="text-zinc-500 mr-3" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-zinc-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Repeat Password</label>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center px-4 py-3 focus-within:border-brand-primary transition-colors">
                  <Lock size={18} className="text-zinc-500 mr-3" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-zinc-600"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={14} />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-brand-primary hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <span>{isLogin ? "Sign In" : "Create Account"}</span>
              <ChevronRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-500 text-xs mb-2">
              {isLogin ? "New to FaceiQ?" : "Already have an account?"}
            </p>
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
              className="text-brand-secondary font-bold text-sm hover:underline"
            >
              {isLogin ? "Create an account" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;