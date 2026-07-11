/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GamePhase, PhaseObjective } from '../types';
import { RotateCcw, Play, Award, AlertOctagon, HelpCircle, X, ShieldAlert, Zap, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameStatusModalProps {
  isOpen: boolean;
  type: 'win' | 'fail' | 'instructions';
  score: number;
  phase: GamePhase;
  stability: number;
  multiplier: number;
  objectives: PhaseObjective[];
  onAction: () => void; // Next Level, Retry, Close
  onClose?: () => void;
}

export const GameStatusModal: React.FC<GameStatusModalProps> = ({
  isOpen,
  type,
  score,
  phase,
  stability,
  multiplier,
  objectives,
  onAction,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`w-full max-w-lg border rounded-lg p-6 text-white text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden ${
          type === 'win' 
            ? 'bg-gradient-to-b from-[#0F0F17] to-[#0A0A0F] border-indigo-500/40' 
            : type === 'fail'
            ? 'bg-gradient-to-b from-[#1c0d12] to-[#0A0A0F] border-red-500/40'
            : 'bg-gradient-to-b from-[#0F0F17] to-[#0A0A0F] border-white/10'
        }`}
      >
        {/* Absolute Background Hexagon Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-5">
          <Globe className="w-80 h-80 animate-spin" style={{ animationDuration: '60s' }} />
        </div>

        {/* Close Button only for Help Info mode */}
        {type === 'instructions' && onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content Stages */}
        {type === 'win' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-400/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-3">
                <Award className="w-8 h-8 text-amber-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold tracking-widest uppercase font-mono">Terminal Link Complete</h2>
              <p className="text-xs text-amber-400/80 uppercase tracking-wider font-mono font-bold mt-1">
                Phase {phase.number} Security Cleared
              </p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded p-4 text-left space-y-3 font-mono">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-xs text-slate-400">Total Phase Score:</span>
                <span className="text-sm font-bold text-white">{(score + 500).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-xs text-slate-400">Terminal Connection Bonus:</span>
                <span className="text-sm font-bold text-indigo-400">+500 PTS</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-xs text-slate-400">Stability Achieved:</span>
                <span className="text-sm font-bold text-indigo-400">{stability}%</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-xs text-slate-400">Active Multiplier:</span>
                <span className="text-sm font-bold text-amber-400">x{multiplier.toFixed(1)}</span>
              </div>
              <div className="text-[10px] text-fuchsia-400/90 leading-normal border-t border-white/5 pt-2 font-sans">
                💡 Space-saving loop efficiency (+400 PTS per node saved) and High-Yield Caches (+2,500 PTS each) are fully factored with the multipliers.
              </div>
            </div>

            {/* Objectives checklist status summary */}
            <div className="text-left space-y-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Objectives Clearance</span>
              <div className="space-y-1.5">
                {objectives.map(o => (
                  <div key={o.id} className="text-xs flex items-center gap-2">
                    <span className={o.isCompleted ? "text-emerald-400" : "text-slate-500"}>
                      {o.isCompleted ? "● [COMPLETED]" : "○ [FAILED]"}
                    </span>
                    <span className={o.isCompleted ? "text-slate-300" : "text-slate-500 line-through"}>
                      {o.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onAction}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all rounded shadow-md flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Initialize Next Phase
            </button>
          </div>
        )}

        {type === 'fail' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)] mb-3">
                <AlertOctagon className="w-8 h-8 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold tracking-widest uppercase font-mono text-red-500">System Link Breached</h2>
              <p className="text-xs text-red-400 uppercase tracking-widest font-mono font-bold mt-1">
                ENERGY_COLLAPSE / GRID_STABILITY_FAILURE
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              The continuous pipeline connection collapsed under firewall countermeasures. Either your system energy dropped to zero or structural node stability was degraded below minimum thresholds.
            </p>

            <button
              onClick={onAction}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest transition-all rounded shadow-md flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reboot Terminal System
            </button>
          </div>
        )}

        {type === 'instructions' && (
          <div className="space-y-5 text-left">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <HelpCircle className="w-6 h-6 text-indigo-400" />
              <h3 className="text-lg font-bold tracking-widest uppercase font-mono">System Protocol Logs</h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed font-sans">
              <p>
                Welcome to <strong className="text-white">Nexus Grid</strong>, a modular connection game. Your objective is to build a secure line link from the <strong className="text-indigo-400">START</strong> terminal to the <strong className="text-amber-400">LINK</strong> terminal.
              </p>

              <div className="space-y-2 border-l-2 border-indigo-500/30 pl-3 py-1">
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-bold block min-w-[20px]">01.</span>
                  <span>Click on inactive grid squares to toggle them as active path cells. Each grid toggle costs <strong className="text-indigo-300">2% system Energy</strong>.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-bold block min-w-[20px]">02.</span>
                  <span>Active squares must form a continuous orthogonal connection link back to the Start node to stay power-connected.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-bold block min-w-[20px]">03.</span>
                  <span>Connect with <strong className="text-emerald-400">Power Core nodes 🔋</strong> to fully recharge your system Energy reservoir by +30%!</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-bold block min-w-[20px]">04.</span>
                  <span>Avoid contacting <strong className="text-pink-500">Firewall blocks 🛑</strong>. Hovering or clicking firewalls reduces critical stability, and triggers an instant loss of <strong className="text-pink-400">10% Energy</strong>!</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-bold block min-w-[20px]">05.</span>
                  <span><strong className="text-amber-400">Less is Better (Minimalist Bonus):</strong> Secure the loop using fewer nodes than the phase limit to get <strong className="text-amber-300">+400 PTS per spared node</strong>!</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="text-indigo-400 font-bold block min-w-[20px]">06.</span>
                  <span><strong className="text-fuchsia-400">High-Yield Caches 💎:</strong> Divert paths to link fuchsia Cache Nodes back to the start terminal for <strong className="text-fuchsia-300">+2,500 PTS</strong> each and upfront multiplier boosts!</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded text-[11px] font-mono leading-normal text-indigo-300 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>SUBROUTINES ALERT:</strong> Use Subroutine A (Overclock) to gain a score multiplier bonus, or Subroutine B (Deep Scan) to trace the hidden connection paths when you get stuck! Reach Phase 3 to unlock EMP Blast capability.
                </div>
              </div>
            </div>

            <button
              onClick={onAction}
              className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all rounded flex items-center justify-center gap-2"
            >
              Authorize Grid Start
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
