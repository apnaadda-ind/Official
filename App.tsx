import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { Loader2 } from 'lucide-react';

// Guard for Admin Route
const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-600">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Strict check for admin email
  if (user.email !== 'thepremanshu@gmail.com') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Guard for Login Route (Public Only)
const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-600">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  if (user) {
    // If logged in as admin, go to admin panel
    if (user.email === 'thepremanshu@gmail.com') {
      return <Navigate to="/admin" replace />;
    }
    // If logged in as normal user, go to home
    return <Navigate to="/" replace />;
  }

  return children;
};

// Splash Screen Component
const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("INITIALIZING");

  useEffect(() => {
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Random increment for realistic feel
        const increment = Math.random() * 5 + 2; 
        return Math.min(prev + increment, 100);
      });
    }, 40);

    // Text cycling
    const textTimeout1 = setTimeout(() => setText("LOADING ASSETS"), 600);
    const textTimeout2 = setTimeout(() => setText("CONNECTING SERVER"), 1200);
    const textTimeout3 = setTimeout(() => setText("WELCOME"), 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(textTimeout1);
      clearTimeout(textTimeout2);
      clearTimeout(textTimeout3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
        
        {/* Logo Title */}
        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-white mb-12 drop-shadow-[0_0_25px_rgba(220,38,38,0.5)] animate-fade-in-up">
          APNA <span className="text-red-600 inline-block animate-pulse-slow">ADDA</span>
        </h1>
        
        {/* Fantastic Loading Bar */}
        <div className="w-full relative mb-4">
          <div className="h-2 w-full bg-zinc-900/50 rounded-full overflow-hidden border border-zinc-800 backdrop-blur-sm">
             <div 
               className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all duration-75 ease-out relative"
               style={{ width: `${progress}%` }}
             >
               {/* Shine effect on bar */}
               <div className="absolute inset-0 bg-white/30 w-full animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
             </div>
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono tracking-widest text-red-500/80">
            <span>{text}</span>
            <span>{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Credit Section */}
      <div className="absolute bottom-10 animate-fade-in opacity-0 flex flex-col items-center" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
        <p className="text-zinc-600 text-[10px] uppercase tracking-[0.3em] mb-2">Designed By</p>
        <p className="text-white font-bold text-sm tracking-widest border-b border-red-600/50 pb-1">Premanshu Kumar</p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // FORCE RESET to Home Page on initial load
    if (window.location.hash !== '#/') {
       window.location.hash = '/';
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Increased slightly to enjoy the animation

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-black text-white font-sans selection:bg-red-900 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Default Route: Home Page */}
            <Route path="/" element={<Home />} />
            
            {/* Public Route: Login */}
            <Route 
              path="/login" 
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              } 
            />
            
            {/* Protected Route: Admin */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
            
            {/* Catch-all: Always redirect unknown paths to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;