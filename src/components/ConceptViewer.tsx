/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Sparkles, Image, Check, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ComicPanel {
  num: number;
  title: string;
  illustration: React.ReactNode;
  narrative: string;
  uiInstruction: string;
}

export const ConceptViewer: React.FC = () => {
  const [activePanel, setActivePanel] = useState<number>(0);

  const panels: ComicPanel[] = [
    {
      num: 1,
      title: 'Model Initialization',
      illustration: (
        <div className="w-full h-44 rounded-md border border-amber-300/30 bg-gradient-to-br from-amber-500/10 via-indigo-950/40 to-[#0F0F17] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute top-2 left-2 text-[9px] font-mono text-amber-400">INPUT: MODEL_INIT</div>
          <motion.div 
            animate={{ rotate: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="w-16 h-16 bg-amber-400 rounded-sm rotate-12 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-white/20"
          >
            <span className="text-3xl">🍌</span>
          </motion.div>
          <div className="mt-4 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-slate-300">
            Selected: <span className="text-indigo-400 font-bold">\"Thinking with 3 Pro\"</span>
          </div>
        </div>
      ),
      narrative: 'A hand with dynamic ink strokes taps the interactive selection cluster: "Create image". The system automatically boots with the deep Thinking with 3 Pro generative core.',
      uiInstruction: 'Action Required: Hold system click on terminal to verify node linkage.'
    },
    {
      num: 2,
      title: 'Optical Selfie Feed',
      illustration: (
        <div className="w-full h-44 rounded-md border border-amber-300/30 bg-gradient-to-br from-amber-500/10 via-indigo-950/40 to-[#0F0F17] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute top-2 left-2 text-[9px] font-mono text-amber-400">INPUT: OPTICAL_CAPTURE</div>
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-indigo-500/50 flex items-center justify-center bg-indigo-500/15 overflow-hidden">
              <span className="text-3xl text-indigo-300 animate-pulse">👤</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-amber-500 p-1 rounded-sm border border-white/20">
              <span className="text-[10px] leading-none">🔋</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] font-semibold font-mono text-indigo-400 animate-pulse">CAMERA_STREAMING: LOCAL_FEED</div>
        </div>
      ),
      narrative: 'The terminal initiates high-resolution optical feed capturing the pilot portrait. Ink washes flow around details, creating paper texture artifacts.',
      uiInstruction: 'Action Required: Align your nodes smoothly to stream feed power correctly.'
    },
    {
      num: 3,
      title: 'Plushie & Style Forecast',
      illustration: (
        <div className="w-full h-44 rounded-md border border-amber-300/30 bg-gradient-to-br from-amber-500/10 via-indigo-950/40 to-[#0F0F17] grid grid-cols-3 gap-2 px-3 py-4 relative overflow-hidden">
          <div className="absolute top-1 left-2 text-[9px] font-mono text-amber-400">NARRATIVE_PRESETS</div>
          <div className="rounded border border-indigo-500/20 bg-indigo-950/20 flex flex-col items-center justify-center p-1 hover:border-amber-400 transition-colors">
            <span className="text-xl">🧸</span>
            <span className="text-[9px] font-mono mt-1 text-slate-300 text-center">Plushie</span>
          </div>
          <div className="rounded border border-indigo-500/20 bg-indigo-950/20 flex flex-col items-center justify-center p-1 hover:border-amber-400 transition-colors">
            <span className="text-xl">🦹</span>
            <span className="text-[9px] font-mono mt-1 text-slate-300 text-center">Mohawk</span>
          </div>
          <div className="rounded border border-indigo-500/20 bg-indigo-950/20 flex flex-col items-center justify-center p-1 hover:border-amber-400 transition-colors">
            <span className="text-xl">🤖</span>
            <span className="text-[9px] font-mono mt-1 text-slate-300 text-center">Figurine</span>
          </div>
        </div>
      ),
      narrative: 'The mind core creates multiple active projections: transform portrait into soft watercolor toy plushies, futuristic high-spike mohawks, or modular structural figures.',
      uiInstruction: 'Action Required: Connect terminal lines to activate latent prediction paths.'
    },
    {
      num: 4,
      title: 'Prompt Synthesizer',
      illustration: (
        <div className="w-full h-44 rounded-md border border-amber-300/30 bg-gradient-to-br from-amber-500/10 via-indigo-950/40 to-[#0F0F17] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute top-2 left-2 text-[9px] font-mono text-amber-400">INPUT: PROMPT_ENGINE</div>
          <div className="w-full max-w-[200px] bg-slate-900 border border-white/10 rounded p-2 text-left">
            <div className="text-[8px] font-mono text-indigo-400">// Natural Voice Query</div>
            <div className="text-xs text-white italic mt-1 font-serif">\"Transform me into a delicate watercolor painting\"</div>
          </div>
          <div className="mt-3 flex gap-1.5 items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase">Synthesizing...</span>
          </div>
        </div>
      ),
      narrative: 'An elegant cursive text box renders the natural command with soft-bleeding watercolors to maintain aesthetic integrity and instruction cohesion.',
      uiInstruction: 'Action Required: High grid stability improves precision. Maintain grid status > 80%.'
    },
    {
      num: 5,
      title: 'Live Generative Finisher',
      illustration: (
        <div className="w-full h-44 rounded-md border border-amber-300/30 bg-gradient-to-br from-amber-500/10 via-indigo-950/40 to-[#0F0F17] flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute top-2 left-2 text-[9px] font-mono text-amber-400">OUTPUT: RESULT_RENDERED</div>
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }} 
            transition={{ repeat: Infinity, duration: 3 }}
            className="p-1 rounded bg-gradient-to-tr from-amber-500 to-indigo-500 shadow-xl"
          >
            <div className="bg-[#0A0A0F] p-3 text-center rounded-sm">
              <span className="text-3xl">🎨</span>
              <div className="text-[10px] font-bold text-amber-300 mt-1 uppercase tracking-widest font-mono">FINISHER COMPLETE</div>
            </div>
          </motion.div>
        </div>
      ),
      narrative: 'The processed image renders cleanly as beautiful ink-washed art. Real-time updates allow tweaking details directly in the dialogue slot.',
      uiInstruction: 'System Target Reached: Clear the puzzle terminals completely to unlock final modules!'
    }
  ];

  const currentPanel = panels[activePanel];

  return (
    <div className="bg-[#0F0F17]/30 border border-white/10 rounded-xl p-5 select-none relative backdrop-blur-sm max-w-md w-full mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          NANO BANANA STORY ARCHIVE
        </h4>
        <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 px-2 py-0.5 rounded-full">
          {activePanel + 1} / {panels.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activePanel}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Illustration Stage */}
          {currentPanel.illustration}

          {/* Descriptive Content */}
          <div className="space-y-1.5">
            <h5 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {currentPanel.title}
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed min-h-[50px]">
              {currentPanel.narrative}
            </p>
          </div>

          <div className="p-2.5 rounded bg-slate-900 border border-amber-300/10 text-[10px] font-mono text-amber-300/90 leading-tight">
            {currentPanel.uiInstruction}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Navigation */}
      <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/5">
        <button
          onClick={() => setActivePanel((prev) => Math.max(0, prev - 1))}
          disabled={activePanel === 0}
          className="p-1 px-3 rounded-sm border border-white/10 hover:border-indigo-400 disabled:opacity-30 disabled:hover:border-white/10 hover:bg-white/5 text-xs font-mono transition-all flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>
        <div className="flex gap-1.5">
          {panels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActivePanel(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                activePanel === idx ? 'bg-amber-400 w-4' : 'bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setActivePanel((prev) => Math.min(panels.length - 1, prev + 1))}
          disabled={activePanel === panels.length - 1}
          className="p-1 px-3 rounded-sm border border-white/10 hover:border-indigo-400 disabled:opacity-30 disabled:hover:border-white/10 hover:bg-white/5 text-xs font-mono transition-all flex items-center gap-1"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
