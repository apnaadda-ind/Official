import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { AppData } from '../types';
import { AppCard } from '../components/AppCard';
import { Loader2 } from 'lucide-react';

export const Home: React.FC = () => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time updates using Modular SDK syntax
    const appsCollectionRef = collection(db, 'apps');
    const q = query(appsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppData[];
      setApps(appsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Global Background Grid */}
      <div className="absolute inset-0 z-0 bg-grid-pattern bg-[length:50px_50px] opacity-20 pointer-events-none"></div>
      
      {/* Hero Section */}
      <section className="relative w-full py-24 sm:py-40 flex flex-col items-center justify-center text-center px-4">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
        
        <div className="relative z-10 animate-fade-in-up space-y-6">
          <div className="inline-block border border-red-900/50 bg-red-950/20 px-4 py-1.5 rounded-full backdrop-blur-md mb-4">
            <span className="text-red-400 text-xs font-bold tracking-widest uppercase">The Future of Apps</span>
          </div>

          <h1 className="text-6xl sm:text-9xl font-black tracking-tighter text-white drop-shadow-2xl">
            APNA <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 to-red-800 text-glow">ADDA</span>
          </h1>
          
          <p className="text-lg sm:text-2xl text-zinc-400 font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
            Your Digital Hangout. Where <span className="text-white font-semibold">Innovation</span> Meets <span className="text-white font-semibold">Entertainment</span>.
          </p>
        </div>
      </section>

      {/* Apps Grid */}
      <section id="apps" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full bg-gradient-to-b from-transparent via-black to-black">
        <div className="flex items-center gap-6 mb-16">
          <div className="h-px bg-gradient-to-r from-transparent via-red-900 to-transparent flex-1"></div>
          <h2 className="text-3xl font-black text-white uppercase tracking-[0.2em] relative">
            Our Apps
            <span className="absolute -inset-1 blur-lg bg-red-600/20 rounded-full -z-10"></span>
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-red-900 to-transparent flex-1"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-zinc-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-red-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-zinc-500 text-sm tracking-widest animate-pulse">LOADING APPS...</p>
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20 border border-zinc-800 border-dashed rounded-3xl bg-zinc-950/50">
            <p className="text-zinc-500 text-xl font-light">No apps available yet. Stay tuned!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};