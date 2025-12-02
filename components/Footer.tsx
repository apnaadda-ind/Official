import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 bg-black border-t border-zinc-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-2">
        <p className="text-zinc-500 text-xs tracking-wider">
          &copy; {new Date().getFullYear()} APNA ADDA. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
           <span className="h-px w-8 bg-zinc-800"></span>
           <p className="text-zinc-400 text-xs uppercase tracking-widest">
             Designed by <span className="text-red-600 font-bold">Premanshu Kumar</span>
           </p>
           <span className="h-px w-8 bg-zinc-800"></span>
        </div>
      </div>
    </footer>
  );
};