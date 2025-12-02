
import React from 'react';
import { AppData } from '../types';
import { ExternalLink, Calendar, Clock, Rocket, Info } from 'lucide-react';

interface AppCardProps {
  app: AppData;
}

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const getStatusDisplay = () => {
    switch (app.launchStatus) {
      case 'Launched':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-md shadow-[0_0_10px_rgba(74,222,128,0.2)]">
            <Rocket size={10} /> Launched
          </span>
        );
      case 'Coming in selected date':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-md">
            <Calendar size={10} /> {app.launchDate || 'TBA'}
          </span>
        );
      case 'Coming in selected weeks':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 backdrop-blur-md">
            <Clock size={10} /> {app.launchWeeks} Week{app.launchWeeks !== 1 ? 's' : ''}
          </span>
        );
      case 'Coming Soon':
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 backdrop-blur-md">
            Coming Soon
          </span>
        );
    }
  };

  // Generate a determinstic gradient based on the name length to give some variety
  const getGradient = () => {
    const len = app.name.length;
    if (len % 3 === 0) return "from-red-900 via-zinc-900 to-black";
    if (len % 3 === 1) return "from-zinc-900 via-red-950 to-black";
    return "from-black via-zinc-900 to-red-900";
  };

  return (
    <div className="group relative bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-800 transition-all duration-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] hover:-translate-y-2 flex flex-col h-full">
      
      {/* Fantastic App Name Art Area - 16:9 Aspect Ratio */}
      <div className={`w-full aspect-video relative overflow-hidden bg-gradient-to-br ${getGradient()}`}>
        
        {/* Abstract Background Patterns */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-grid-pattern bg-[length:20px_20px] opacity-10"></div>
        
        {/* Glowing orb effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-red-600/20 rounded-full blur-[50px] group-hover:bg-red-600/30 transition-all duration-700"></div>

        {/* Central Typography Art */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
          <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 drop-shadow-2xl scale-100 group-hover:scale-110 transition-transform duration-700 ease-in-out break-words w-full line-clamp-2 leading-[0.9]">
            {app.name}
          </h3>
          
          {/* Optional Tagline */}
          {app.tagline && (
            <div className="mt-3 overflow-hidden">
               <p className="text-xs sm:text-sm font-bold text-red-500/90 uppercase tracking-[0.3em] backdrop-blur-sm drop-shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100 delay-100">
                 {app.tagline}
               </p>
            </div>
          )}
        </div>

        {/* Status Badge Overlay */}
        <div className="absolute top-4 right-4 z-20">
          {getStatusDisplay()}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col relative">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-red-500 transition-colors duration-300">
            {app.name}
          </h3>
          
          {/* App Description */}
          {app.description ? (
            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 min-h-[4.5em]">
              {app.description}
            </p>
          ) : (
            <p className="text-zinc-600 text-sm italic min-h-[4.5em] flex items-center gap-2">
              <Info size={14} /> No description available.
            </p>
          )}

          <div className="h-px w-full bg-zinc-800/50 mt-4 group-hover:bg-red-900/30 transition-colors"></div>
        </div>
        
        <div className="mt-auto pt-2">
          {app.externalLink ? (
            <a 
              href={app.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full relative overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-red-900/20 group-hover:shadow-red-900/40"
            >
              <span className="relative z-10 flex items-center gap-2">
                Click Here <ExternalLink size={16} />
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </a>
          ) : (
            <button 
              disabled 
              className="w-full py-3 bg-zinc-900/50 text-zinc-600 border border-zinc-800 rounded-xl font-medium text-sm uppercase tracking-wider cursor-not-allowed"
            >
              Info Only
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
