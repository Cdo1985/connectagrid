/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GridNode } from '../types';
import { Zap, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface GridBoardProps {
  nodes: GridNode[];
  startCoord: { r: number; c: number };
  endCoord: { r: number; c: number };
  onNodeClick: (node: GridNode) => void;
  hoveredNode: GridNode | null;
  setHoveredNode: (node: GridNode | null) => void;
  scannedNodeIds: Set<string>;
  winningPathIds: string[];
}

export const GridBoard: React.FC<GridBoardProps> = ({
  nodes,
  startCoord,
  endCoord,
  onNodeClick,
  hoveredNode,
  setHoveredNode,
  scannedNodeIds,
  winningPathIds,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* 7x7 Grid */}
      <div 
        className="grid grid-cols-7 grid-rows-7 gap-2.5 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl relative select-none shadow-2xl"
        id="nexus-grid-board"
      >
        {/* Radial Dotted Decorative Overlay */}
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none rounded-xl"
          style={{
            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {nodes.map((node) => {
          const isStart = node.row === startCoord.r && node.col === startCoord.c;
          const isEnd = node.row === endCoord.r && node.col === endCoord.c;
          const isPartOffWinningPath = winningPathIds.includes(node.id);
          const isScanned = scannedNodeIds.has(node.id);

          // Node styling state
          let cellStyle = 'bg-indigo-500/10 border-indigo-500/30';
          let hoverStyle = 'hover:bg-indigo-500/20 hover:border-indigo-500/50 cursor-pointer';

          if (node.type === 'firewall') {
            cellStyle = 'bg-pink-500/20 border-pink-500/50';
            hoverStyle = 'hover:bg-pink-600/30 cursor-not-allowed';
          } else if (node.type === 'cache') {
            if (node.state === 'connected') {
              cellStyle = 'bg-fuchsia-500/40 border-fuchsia-400 shadow-[0_0_18px_rgba(217,70,239,0.5)]';
            } else if (node.state === 'active') {
              cellStyle = 'bg-indigo-500/30 border-fuchsia-500/50';
            } else {
              cellStyle = 'bg-transparent border-dashed border-fuchsia-500/40 text-fuchsia-400/80';
            }
          } else if (node.type === 'power') {
            if (node.state === 'connected') {
              cellStyle = 'bg-emerald-500/40 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
            } else if (node.state === 'active') {
              cellStyle = 'bg-indigo-500/30 border-emerald-500/50';
            } else {
              cellStyle = 'bg-transparent border-dashed border-emerald-500/40';
            }
          } else if (isStart) {
            cellStyle = 'bg-indigo-600 border-white/50 shadow-[0_0_20px_rgba(99,102,241,0.6)]';
          } else if (isEnd) {
            cellStyle = node.state === 'connected' 
              ? 'bg-amber-500 border-white/80 shadow-[0_0_25px_rgba(245,158,11,0.8)]'
              : 'bg-indigo-900/40 border-amber-500/50';
          } else if (node.state === 'connected') {
            cellStyle = isPartOffWinningPath
              ? 'bg-indigo-500 border-white/60 shadow-[0_0_20px_rgba(99,102,241,0.8)]'
              : 'bg-indigo-500/70 border-white/30 shadow-[0_0_12px_rgba(99,102,241,0.4)]';
          } else if (node.state === 'active') {
            // Active but disconnected from network
            cellStyle = 'bg-indigo-900 border-indigo-500/60 shadow-[0_0_8px_rgba(99,102,241,0.2)]';
          }

          // Deep scan helper high-intensity highlighting
          if (isScanned) {
            cellStyle += ' ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0A0A0F] animate-pulse';
          }

          return (
            <motion.div
              key={node.id}
              id={`node-${node.row}-${node.col}`}
              layout="position"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={
                node.state === 'connected'
                  ? {
                      scale: isPartOffWinningPath ? [1.02, 1.12, 1.04] : [1, 1.08, 1.02],
                      opacity: 1,
                      boxShadow: isPartOffWinningPath
                        ? [
                            "0 0 15px rgba(99,102,241,0.6)",
                            "0 0 30px rgba(99,102,241,0.9)",
                            "0 0 18px rgba(99,102,241,0.7)",
                          ]
                        : [
                            "0 0 8px rgba(99,102,241,0.3)",
                            "0 0 20px rgba(99,102,241,0.6)",
                            "0 0 10px rgba(99,102,241,0.4)",
                          ],
                    }
                  : node.state === 'active'
                  ? {
                      scale: 1.03,
                      opacity: 1,
                      boxShadow: "0 0 12px rgba(99,102,241,0.25)",
                    }
                  : {
                      scale: 1,
                      opacity: 1,
                      boxShadow: "none",
                    }
              }
              transition={
                node.state === 'connected'
                  ? {
                      scale: { duration: 0.35, ease: "easeOut" },
                      boxShadow: {
                        repeat: Infinity,
                        duration: 1.8,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      },
                    }
                  : {
                      duration: 0.15,
                    }
              }
              whileHover={node.type !== 'firewall' ? { scale: 1.1, zIndex: 10 } : {}}
              onClick={() => onNodeClick(node)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              className={`w-12 h-12 md:w-14 md:h-14 border rounded-sm flex items-center justify-center ${cellStyle} ${hoverStyle} relative`}
            >
              {/* Internal Node Glyphs */}
              {isStart && (
                <div className="text-[10px] font-bold text-white tracking-tighter uppercase">START</div>
              )}

              {isEnd && (
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-bold text-amber-300 tracking-tighter uppercase leading-none">LINK</span>
                </div>
              )}

              {node.type === 'cache' && node.state !== 'connected' && (
                <motion.div 
                  animate={{ scale: [0.95, 1.15, 0.95] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="flex flex-col items-center justify-center text-fuchsia-400"
                >
                  <Sparkles className="w-5 h-5 text-fuchsia-400" />
                  <span className="text-[7px] text-fuchsia-300 font-mono font-bold leading-none mt-0.5">CACHE</span>
                </motion.div>
              )}

              {node.type === 'cache' && node.state === 'connected' && (
                <motion.div 
                  animate={{ scale: [1, 1.10, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                  className="flex flex-col items-center justify-center text-amber-300"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span className="text-[7px] text-amber-300 font-mono font-bold leading-none mt-0.5 uppercase tracking-tighter">SECURED</span>
                </motion.div>
              )}

              {node.type === 'power' && node.state !== 'connected' && (
                <motion.div 
                  animate={{ scale: [0.9, 1.1, 0.9] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex items-center justify-center"
                >
                  <Zap className="w-5 h-5 text-emerald-400" />
                </motion.div>
              )}

              {node.type === 'power' && node.state === 'connected' && (
                <ShieldCheck className="w-5 h-5 text-white animate-bounce" />
              )}

              {node.type === 'firewall' && (
                <motion.div 
                  className="w-3.5 h-3.5 bg-pink-500 rotate-45 border border-white/50 shadow-[0_0_6px_rgba(244,63,94,0.6)]"
                  animate={{ rotate: [45, 225, 45] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                />
              )}

              {/* Connected standard nodes path lines indicators */}
              {node.type === 'standard' && node.state === 'connected' && (
                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-inner animate-ping" />
              )}

              {node.type === 'standard' && node.state === 'active' && (
                <div className="w-2 h-2 bg-indigo-300 rounded-full opacity-60" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Grid Footnotes */}
      <div className="mt-8 flex gap-4 text-[10px] font-bold uppercase tracking-widest">
        <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded text-indigo-300 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Sector Active Connection: {nodes.filter(n => n.state === 'connected').length} / 49
        </div>
        
        {nodes.some(n => n.type === 'firewall') ? (
          <div className="px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded text-pink-300 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
            Firewall Ingress Block Active
          </div>
        ) : (
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-300 flex items-center gap-2">
            Grid Clear - Clean Feed
          </div>
        )}
      </div>
    </div>
  );
};
