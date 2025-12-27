
import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="w-72 bg-slate-900 text-slate-300 h-full p-8 flex flex-col gap-10 hidden lg:flex border-r border-white/5">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-500/20">
            <i className="fas fa-bolt font-black"></i>
          </div>
          <h2 className="text-white font-black text-lg tracking-tight">ECO-LOGIC</h2>
        </div>

        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Software Guide</h3>
        <ul className="space-y-4">
          <li className="group">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-400 group-hover:text-emerald-400 cursor-pointer transition-all">
              <i className="fas fa-terminal opacity-50 text-xs"></i>
              Instruction List (IL)
            </div>
          </li>
          <li className="group">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-400 group-hover:text-emerald-400 cursor-pointer transition-all">
              <i className="fas fa-table-list opacity-50 text-xs"></i>
              Symbol Management
            </div>
          </li>
          <li className="group">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-400 group-hover:text-emerald-400 cursor-pointer transition-all">
              <i className="fas fa-vial opacity-50 text-xs"></i>
              M221 Simulation
            </div>
          </li>
        </ul>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <h4 className="text-red-400 font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
          <i className="fas fa-circle-exclamation"></i> DO NOT DO THIS
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed font-medium">
          "Invalid Format" error se bachne ke liye <strong>File -> Open</strong> mat kijiye. Download ki gayi file project file nahi hai, balki code data hai.
        </p>
      </div>

      <div className="mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 shadow-inner">
          <h4 className="text-emerald-400 font-black text-[10px] uppercase tracking-widest mb-2 italic underline decoration-2 underline-offset-4">Pro Tip</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            M221 software mein hamesha "List" editor use karein IL code paste karne ke liye. Ladder mein direct paste nahi hota.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
