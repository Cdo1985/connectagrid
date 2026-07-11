/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ShieldAlert, Radio, Cpu, Zap, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarControlsProps {
  playerLevel: number;
  energy: number;
  onUseOverclock: () => void;
  onUseDeepScan: () => void;
  onUseEMPBlast: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  overclockActive: boolean;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  playerLevel,
  energy,
  onUseOverclock,
  onUseDeepScan,
  onUseEMPBlast,
  isMuted,
  onToggleMute,
  overclockActive,
}) => {
  // We simulate dynamic signal visualizer heights
  const [uplinkHeights, setUplinkHeights] = useState<number[]>([20, 60, 40, 90, 70, 30]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUplinkHeights(
        Array.from({ length: 6 }, () => Math.floor(Math.random() * 80) + 15)
      );
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const isOverclockDisabled = energy < 15;
  const isDeepScanDisabled = energy < 25;
  const isEMPDisabled = playerLevel < 3 || energy < 40;

  return (
    <aside className="w-72 border-l border-white/10 flex flex-col p-6 bg-[#0F0F17]/50 select-none">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Subroutines</h3>
        {/* Crisp Vol Controller Toggle Button */}
        <button
          onClick={onToggleMute}
          className="p-1 px-2.5 rounded-sm border border-white/10 hover:border-indigo-400 hover:bg-indigo-500/10 text-slate-400 hover:text-white transition-all flex items-center justify-center gap-1 text-[10px] font-mono"
          title="Toggle Audio Feedback"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
              MUTED
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              SOUND_ON
            </>
          )}
        </button>
      </div>

      <div className="space-y-4 flex-1">
        {/* Button A: Overclock */}
        <button 
          className={`w-full group text-left block transition-all ${
            isOverclockDisabled ? 'opacity-45 cursor-not-allowed' : ''
          }`}
          onClick={() => {
            if (!isOverclockDisabled) onUseOverclock();
          }}
          disabled={isOverclockDisabled}
        >
          <div className={`p-3.5 border rounded-sm transition-all flex items-center gap-3 ${
            overclockActive 
              ? 'border-indigo-400 bg-indigo-500/20' 
              : 'border-white/10 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5'
          }`}>
            <div className={`w-8 h-8 rounded-sm flex-shrink-0 flex items-center justify-center border text-xs font-mono transition-colors ${
              overclockActive
                ? 'bg-indigo-500 border-white text-white font-bold'
                : 'bg-slate-800 border-white/10 text-slate-300'
            }`}>
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                Overclock
                <Zap className={`w-3.5 h-3.5 ${overclockActive ? 'text-amber-400 animate-ping' : 'text-slate-400'}`} />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Score Multiplier +1.0. <br />
                <span className="text-pink-400 font-semibold font-mono">-15% Energy | -10% Stab</span>
              </div>
            </div>
          </div>
        </button>

        {/* Button B: Deep Scan */}
        <button 
          className={`w-full group text-left block transition-all ${
            isDeepScanDisabled ? 'opacity-45 cursor-not-allowed' : ''
          }`}
          onClick={() => {
            if (!isDeepScanDisabled) onUseDeepScan();
          }}
          disabled={isDeepScanDisabled}
        >
          <div className="p-3.5 border border-white/10 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all text-left flex items-center gap-3 rounded-sm">
            <div className="w-8 h-8 flex-shrink-0 bg-slate-800 flex items-center justify-center border border-white/10 text-xs font-mono text-slate-300">
              B
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                Deep Scan
                <Eye className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Highlight connection blueprint. <br />
                <span className="text-pink-400 font-semibold font-mono">-25% Energy</span>
              </div>
            </div>
          </div>
        </button>

        {/* Button C: EMP Blast */}
        <button 
          className={`w-full text-left block transition-all ${
            isEMPDisabled ? 'opacity-40 cursor-not-allowed' : 'group'
          }`}
          onClick={() => {
            if (!isEMPDisabled) onUseEMPBlast();
          }}
          disabled={isEMPDisabled}
        >
          <div className={`p-3.5 border rounded-sm transition-all text-left flex items-center gap-3 ${
            isEMPDisabled 
              ? 'border-white/5 bg-transparent' 
              : 'border-white/10 group-hover:border-pink-500/50 group-hover:bg-pink-500/5'
          }`}>
            <div className="w-8 h-8 flex-shrink-0 bg-slate-800 flex items-center justify-center border border-white/10 text-xs font-mono text-slate-500">
              C
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                EMP Blast
                <ShieldAlert className={`w-3.5 h-3.5 ${playerLevel < 3 ? 'text-slate-600' : 'text-pink-400 animate-pulse'}`} />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                {playerLevel < 3 ? (
                  <span className="text-pink-500/80 font-semibold italic">Requires Player Level 3</span>
                ) : (
                  <>
                    Clear nearby Firewall obstacles. <br />
                    <span className="text-pink-400 font-semibold font-mono">-40% Energy</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Aesthetic Signal Uplink Waveform Monitor */}
      <div className="mt-auto">
        <div className="text-[10px] uppercase text-slate-500 font-mono tracking-wider mb-2 flex items-center justify-between">
          <span>Signal Uplink</span>
          <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
        </div>
        <div className="flex gap-1 h-10 items-end border-b border-indigo-500/20 pb-1">
          {uplinkHeights.map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: `${h}%` }}
              transition={{ ease: 'easeInOut', duration: 0.15 }}
              className={`flex-1 ${overclockActive ? 'bg-amber-400' : 'bg-indigo-500'}`}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};
