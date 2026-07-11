/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GamePhase, GridNode, PhaseObjective } from '../types';
import { Target, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarStatsProps {
  score: number;
  multiplier: number;
  nodes: GridNode[];
  stability: number;
  phase: GamePhase;
  objectives: PhaseObjective[];
}

export const SidebarStats: React.FC<SidebarStatsProps> = ({
  score,
  multiplier,
  nodes,
  stability,
  phase,
  objectives,
}) => {
  const activeCount = nodes.filter(n => n.state === 'active' || n.state === 'connected').length;
  const isCriticalStability = stability < 80;

  return (
    <aside className="w-72 border-r border-white/10 flex flex-col p-6 bg-[#0F0F17]/50 overflow-y-auto select-none">
      <div className="space-y-10">
        {/* Core Statistics Section */}
        <section>
          <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Core Statistics</h3>
          <div className="space-y-5">
            {/* Total Score */}
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-xs text-slate-400 font-mono">TOTAL_SCORE</span>
              <motion.span 
                key={score}
                initial={{ scale: 1.1, color: '#f59e0b' }}
                animate={{ scale: 1, color: '#ffffff' }}
                className="text-2xl font-mono font-bold"
              >
                {score.toLocaleString()}
              </motion.span>
            </div>

            {/* Score Multiplier */}
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-xs text-slate-400 font-mono">MULTIPLIER</span>
              <span className="text-2xl font-mono text-indigo-400 font-bold">
                x{multiplier.toFixed(1)}
              </span>
            </div>

            {/* Live nodes active count */}
            <div className="flex justify-between items-end border-b border-white/5 pb-2">
              <span className="text-xs text-slate-400 font-mono">NODES_ACTIVE</span>
              <span className="text-2xl font-mono font-semibold">
                {activeCount} <span className="text-xs text-slate-500">/ 49</span>
              </span>
            </div>
          </div>
        </section>

        {/* Current Mission Objectives */}
        <section>
          <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Active Objectives</h3>
          <ul className="space-y-3.5 font-sans">
            {objectives.map((obj) => (
              <li key={obj.id} className="flex gap-3 items-start">
                <div className="mt-0.5">
                  {obj.isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs ${obj.isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                    {obj.text}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Efficiency vs Reward Intel Panel */}
        <section className="bg-slate-950/45 p-3.5 rounded border border-white/5 space-y-3 font-sans">
          <h4 className="text-[9px] font-bold text-amber-400 uppercase tracking-widest font-mono">⚡ SYSTEM ALIGNMENT INTELLIGENCE</h4>
          
          <div className="space-y-2">
            <div className="text-[11px] leading-relaxed">
              <span className="text-emerald-400 font-bold block mb-0.5 font-mono text-[10px]">1. QUICK & CHEAP PATH</span>
              <p className="text-slate-400">Avoid detours. Complete the link directly to save energy and get <strong className="text-emerald-300 font-mono font-bold text-[10px]">+400 PTS</strong> for each unused connection slot below the limit!</p>
            </div>
            
            <div className="text-[11px] leading-relaxed border-t border-white/5 pt-2">
              <span className="text-fuchsia-400 font-bold block mb-0.5 font-mono text-[10px]">2. BUY MORE DETOURS</span>
              <p className="text-slate-400">Expand your route ("buy" extra nodes using energy) to reach premium elements. Every connected <strong className="text-fuchsia-300 font-bold">Cache Node is worth +2,500 PTS</strong>!</p>
            </div>
          </div>
        </section>
      </div>

      {/* Stability Warning Progress bar */}
      <div className="mt-auto pt-6">
        <div className={`p-4 rounded-lg border transition-colors ${
          isCriticalStability 
            ? 'bg-red-950/20 border-red-500/30 animate-pulse' 
            : 'bg-indigo-950/20 border-indigo-500/30'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isCriticalStability ? 'text-red-400' : 'text-indigo-300'
            }`}>
              {isCriticalStability ? 'Stability Compromised' : 'Grid Stability'}
            </span>
            <span className={`text-xs font-mono font-bold ${
              isCriticalStability ? 'text-red-400' : 'text-indigo-400'
            }`}>
              {stability}%
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: `${stability}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full ${isCriticalStability ? 'bg-red-500' : 'bg-indigo-500'}`}
            />
          </div>

          {isCriticalStability && (
            <div className="mt-2 flex items-center gap-1.5 text-[9px] text-red-400 font-semibold uppercase font-mono animate-bounce">
              <AlertCircle className="w-3.5 h-3.5" />
              SYSTEM_FAULT_THREAT: DEGRADE
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
