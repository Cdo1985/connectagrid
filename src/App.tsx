/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { GridNode, GamePhase, PhaseObjective, NodeType, NodeState } from './types';
import { getPhasePreset } from './lib/phases';
import { calculateConnectedNodes, checkWinCondition, getNodeAt } from './lib/pathfinder';
import { soundEffects, toggleMute, getMuteState } from './lib/audio';
import { GridBoard } from './components/GridBoard';
import { SidebarStats } from './components/SidebarStats';
import { SidebarControls } from './components/SidebarControls';
import { ConceptViewer } from './components/ConceptViewer';
import { GameStatusModal } from './components/GameStatusModal';
import { Play, Pause, RefreshCw, HelpCircle, LayoutGrid, Award, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Game Core Progression States
  const [phaseNum, setPhaseNum] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(100);
  const [stability, setStability] = useState<number>(100);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [playerLevel, setPlayerLevel] = useState<number>(1);
  const [overclockActive, setOverclockActive] = useState<boolean>(false);
  
  // Grid Node States
  const [nodes, setNodes] = useState<GridNode[]>([]);
  
  // Modal Overlays
  const [activeModal, setActiveModal] = useState<'win' | 'fail' | 'instructions' | null>('instructions');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showStoryConcept, setShowStoryConcept] = useState<boolean>(false);

  // User interactive state tracking
  const [hoveredNode, setHoveredNode] = useState<GridNode | null>(null);
  const [scannedNodeIds, setScannedNodeIds] = useState<Set<string>>(new Set());
  const [winningPathIds, setWinningPathIds] = useState<string[]>([]);
  const [consecutiveInstalls, setConsecutiveInstalls] = useState<number>(0);

  // Retrieve active campaign parameters
  const currentPhasePres: GamePhase = useMemo(() => {
    return getPhasePreset(phaseNum);
  }, [phaseNum]);

  // Generate the default grid for the selected Phase
  const initializeGrid = (phase: GamePhase) => {
    const gridRows = 7;
    const gridCols = 7;
    const initialNodes: GridNode[] = [];

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const id = `node-${r}-${c}`;
        let type: NodeType = 'standard';
        let state: NodeState = 'inactive';

        // Set start & end terminals
        if (r === phase.startCoord.r && c === phase.startCoord.c) {
          type = 'start';
          state = 'connected'; // Always connected
        } else if (r === phase.endCoord.r && c === phase.endCoord.c) {
          type = 'end';
        } else if (phase.firewalls.some(f => f.r === r && f.c === c)) {
          type = 'firewall';
        } else if (phase.powerNodes.some(p => p.r === r && p.c === c)) {
          type = 'power';
        } else if (phase.cacheNodes?.some(chk => chk.r === r && chk.c === c)) {
          type = 'cache';
        }

        initialNodes.push({ id, row: r, col: c, type, state });
      }
    }

    setNodes(initialNodes);
    setEnergy(100);
    setStability(100);
    setScannedNodeIds(new Set());
    setOverclockActive(false);
    setWinningPathIds([]);
    setConsecutiveInstalls(0);
  };

  // Build current state checklist objectives
  const objectives: PhaseObjective[] = useMemo(() => {
    const list: PhaseObjective[] = [];
    const activeCount = nodes.filter(n => n.state === 'active' || n.state === 'connected').length;

    // Objective 1: Connect Start and End Terminals
    const { isConnected } = checkWinCondition(
      nodes,
      currentPhasePres.startCoord,
      currentPhasePres.endCoord
    );
    list.push({
      id: 'connect',
      text: `Link START at (${currentPhasePres.startCoord.r}, ${currentPhasePres.startCoord.c}) to LINK at (${currentPhasePres.endCoord.r}, ${currentPhasePres.endCoord.c})`,
      isCompleted: isConnected,
      type: 'connect',
    });

    // Objective 2: Keep nodes count within target limits
    if (currentPhasePres.targetNodesLimit) {
      list.push({
        id: 'node-limit',
        text: `Secure link path with under ${currentPhasePres.targetNodesLimit} total nodes (Current: ${activeCount})`,
        isCompleted: activeCount <= currentPhasePres.targetNodesLimit && activeCount > 0,
        type: 'connect',
      });
    }

    // Objective 3: Maintain overall system stability limit
    list.push({
      id: 'stability-limit',
      text: `Maintain high electrical grid stability above ${currentPhasePres.minStabilityRequired}% (Current: ${stability}%)`,
      isCompleted: stability >= currentPhasePres.minStabilityRequired,
      type: 'stability',
    });

    // Objective 4: Touch all power nodes (optional custom bonus challenge!)
    const totalPowerNodes = nodes.filter(n => n.type === 'power').length;
    const activatedPowerNodes = nodes.filter(n => n.type === 'power' && n.state === 'connected').length;
    if (totalPowerNodes > 0) {
      list.push({
        id: 'power-cores',
        text: `Engage and connect Power Core slots (${activatedPowerNodes}/${totalPowerNodes}) to charge cells`,
        isCompleted: activatedPowerNodes === totalPowerNodes,
        type: 'power',
      });
    }

    // Objective 5: Retrieve all caches (optional high-yield bonus challenge!)
    const totalCacheNodes = nodes.filter(n => n.type === 'cache').length;
    const activatedCacheNodes = nodes.filter(n => n.type === 'cache' && n.state === 'connected').length;
    if (totalCacheNodes > 0) {
      list.push({
        id: 'cache-cores',
        text: `Secure high-yield Cache Cores (${activatedCacheNodes}/${totalCacheNodes}) for +2,500 PTS each`,
        isCompleted: activatedCacheNodes === totalCacheNodes,
        type: 'cache',
      });
    }

    return list;
  }, [nodes, currentPhasePres, stability]);

  // Effect: Build grid on phase configuration shifts
  useEffect(() => {
    initializeGrid(currentPhasePres);
  }, [phaseNum, currentPhasePres]);

  // Effect: Live system state calculation. Whenever the nodes configuration changes,
  // we compute connected flows and judge victories!
  useEffect(() => {
    if (nodes.length === 0 || activeModal) return;

    // 1. Mark which nodes are actively connected back to Start
    const connectedSet = calculateConnectedNodes(nodes, currentPhasePres.startCoord);
    
    // Check if configuration has changed to update states
    let hasChanged = false;
    const updatedNodes = nodes.map(node => {
      // Start is always connected
      if (node.type === 'start') return node;

      if (connectedSet.has(node.id)) {
        if (node.state !== 'connected') {
          hasChanged = true;
          return { ...node, state: 'connected' as NodeState };
        }
      } else {
        if (node.state === 'connected') {
          hasChanged = true;
          return { ...node, state: 'active' as NodeState };
        }
      }
      return node;
    });

    if (hasChanged) {
      setNodes(updatedNodes);
      return; // return to let next tick process state clean
    }

    // 2. Evaluate win condition
    const winResult = checkWinCondition(nodes, currentPhasePres.startCoord, currentPhasePres.endCoord);
    if (winResult.isConnected) {
      soundEffects.levelComplete();
      
      // Calculate final level score multiplier
      const finalMultiplier = overclockActive ? multiplier + 1.0 : multiplier;
      const baseReward = 1000;
      const stabilityBonus = Math.floor(stability * 5);

      // Cache Rewards
      const connectedCaches = nodes.filter(n => n.type === 'cache' && n.state === 'connected').length;
      const cacheRewards = connectedCaches * 2500;

      // Minimalist Efficiency Rating Bonus: 'less is better'
      const activeCount = nodes.filter(n => n.state === 'active' || n.state === 'connected').length;
      let minimalistBonus = 0;
      if (currentPhasePres.targetNodesLimit && activeCount < currentPhasePres.targetNodesLimit) {
        const nodeSavings = currentPhasePres.targetNodesLimit - activeCount;
        minimalistBonus = nodeSavings * 400; // Big points for direct routing!
      }

      const levelTotal = Math.floor((baseReward + stabilityBonus + cacheRewards + minimalistBonus) * finalMultiplier);

      setScore(prev => prev + levelTotal);
      setWinningPathIds(winResult.pathNodeIds);
      setActiveModal('win');

      // Increase Player Level experience!
      if (phaseNum >= playerLevel * 2) {
        setPlayerLevel(prev => prev + 1);
      }
    }

    // 3. Evaluate failure condition
    if (energy <= 0 || stability <= 0) {
      soundEffects.gameOver();
      setActiveModal('fail');
    }

  }, [nodes, currentPhasePres, activeModal, energy, stability, overclockActive, multiplier, phaseNum, playerLevel]);

  // Handle click on clean nodes to paint connectivity
  const handleNodeClick = (node: GridNode) => {
    if (isPaused || activeModal) return;

    // Prevent direct edits of terminal nodes
    if (node.type === 'start' || node.type === 'end') {
      return;
    }

    // Triggers severe penalties if they accidentally or intentionally click a locked Firewall!
    if (node.type === 'firewall') {
      soundEffects.error();
      setEnergy(prev => Math.max(0, prev - 12));
      setStability(prev => Math.max(0, prev - 15));
      setConsecutiveInstalls(0);
      return;
    }

    // Toggle logic for standard or power nodes
    const isNowActive = node.state === 'inactive';
    
    if (isNowActive) {
      // Activating cell costs energy
      setEnergy(prev => Math.max(0, prev - 2));
      soundEffects.click();
      
      // Bonus: If it is a power node, play high pitch arpeggio and recharge energy significantly!
      if (node.type === 'power') {
        soundEffects.powerUp();
        setEnergy(prev => Math.min(100, prev + 30));
      }

      // Bonus: If it is a cache node, play high pitch and boost initial multiplier
      if (node.type === 'cache') {
        soundEffects.powerUp();
        setMultiplier(prev => Math.min(5.0, prev + 0.3));
      }

      setConsecutiveInstalls(prev => prev + 1);
    } else {
      // Refunding some energy on dismantle
      setEnergy(prev => Math.min(100, prev + 1));
      soundEffects.deactivate();
      setConsecutiveInstalls(0);
    }

    // Update state
    setNodes(prevNodes => prevNodes.map(n => 
      n.id === node.id 
        ? { ...n, state: (isNowActive ? 'active' : 'inactive') as NodeState } 
        : n
    ));

    // Dynamic Multiplier scaling: consecutive successful alignments boost multiplier safely!
    if (isNowActive && consecutiveInstalls > 2) {
      setMultiplier(prev => Math.min(5.0, prev + 0.2));
    }
  };

  // Subroutine activations
  const useOverclock = () => {
    if (energy < 15) return;
    soundEffects.overclock();
    setEnergy(prev => Math.max(0, prev - 15));
    setStability(prev => Math.max(0, prev - 10));
    setMultiplier(prev => prev + 1.0);
    setOverclockActive(true);
  };

  const useDeepScan = () => {
    if (energy < 25) return;
    soundEffects.deepScan();
    setEnergy(prev => Math.max(0, prev - 25));

    // Calculate a valid direct path to end to show as helper hints
    const gridWithAllClear = nodes.map(n => 
      n.type !== 'firewall' ? { ...n, state: 'active' as NodeState } : n
    );
    const result = checkWinCondition(gridWithAllClear, currentPhasePres.startCoord, currentPhasePres.endCoord);
    
    if (result.pathNodeIds.length > 0) {
      const scanIds = new Set(result.pathNodeIds);
      setScannedNodeIds(scanIds);
      // Path fades out in 5 seconds
      setTimeout(() => {
        setScannedNodeIds(new Set());
      }, 5000);
    }
  };

  const useEMPBlast = () => {
    if (energy < 40 || playerLevel < 3) return;
    soundEffects.deepScan();
    setEnergy(prev => Math.max(0, prev - 40));

    // Decimate up to 3 firewall nodes securely
    let modifiedCount = 0;
    setNodes(prev => prev.map(node => {
      if (node.type === 'firewall' && modifiedCount < 3) {
        modifiedCount++;
        return { ...node, type: 'standard', state: 'inactive' };
      }
      return node;
    }));
  };

  const handlesToggleMute = () => {
    const nextMute = toggleMute();
    setIsMuted(nextMute);
  };

  const handleNextPhase = () => {
    setActiveModal(null);
    setPhaseNum(prev => Math.min(24, prev + 1));
    setMultiplier(1.0);
  };

  const handleReboot = () => {
    setActiveModal(null);
    initializeGrid(currentPhasePres);
    setMultiplier(1.0);
  };

  const handleOpenHelp = () => {
    setActiveModal('instructions');
    setIsPaused(true);
  };

  const handleCloseHelp = () => {
    setActiveModal(null);
    setIsPaused(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0F] text-white font-sans flex flex-col justify-between overflow-x-hidden relative">
      {/* Decorative Grid Line Accents */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/10" />
      <div className="absolute top-0 bottom-0 left-[240px] w-[1px] bg-indigo-500/5 hidden xl:block" />
      <div className="absolute top-0 bottom-0 right-[240px] w-[1px] bg-indigo-500/5 hidden xl:block" />

      {/* Top Header Navigation Panel */}
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0F0F17] relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-sm rotate-45 flex items-center justify-center cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm md:text-base font-bold tracking-[0.25em] uppercase font-mono text-white">NEXUS_GRID</span>
            <span className="text-[9px] text-indigo-400 font-mono tracking-widest leading-none mt-0.5">ESTABLISHED_FLOW_ONLINE</span>
          </div>
        </div>

        {/* Level Jumper Manual overrides */}
        <div className="flex gap-4 items-center md:gap-7">
          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-1 rounded-sm">
            <span className="text-[10px] text-slate-400 font-mono">PHASE:</span>
            <select
              value={phaseNum}
              onChange={(e) => {
                setPhaseNum(Number(e.target.value));
                setMultiplier(1.0);
              }}
              className="bg-[#050508] border-none text-xs text-indigo-300 font-mono font-bold focus:outline-none cursor-pointer"
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {String(i + 1).padStart(2, '0')} / 24
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">PILOT_LVL</span>
            <span className="text-base font-bold leading-none font-mono text-amber-400">LVL {playerLevel}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono font-bold">ENERGY</span>
            <span className={`text-base leading-none font-mono font-bold ${energy < 30 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {energy}%
            </span>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={handleOpenHelp}
              className="p-2 rounded border border-white/10 hover:border-indigo-400 hover:bg-indigo-500/10 text-slate-300 transition-colors"
              title="View Manual Guide Log"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowStoryConcept(prev => !prev)}
              className={`p-2 rounded border transition-colors flex items-center gap-1.5 text-xs font-mono font-bold ${
                showStoryConcept 
                  ? 'border-amber-400/50 bg-amber-500/10 text-amber-300' 
                  : 'border-white/10 text-slate-300 hover:border-amber-400'
              }`}
              title="Show comic storyboard specs"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline">COMIC_ARCHIVE</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Stats column */}
        <SidebarStats
          score={score}
          multiplier={multiplier}
          nodes={nodes}
          stability={stability}
          phase={currentPhasePres}
          objectives={objectives}
        />

        {/* Center Canvas area */}
        <main className="flex-1 flex flex-col items-center justify-between p-6 relative overflow-y-auto">
          
          <div className="w-full text-center max-w-lg mb-4">
            <motion.div 
              key={phaseNum}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-block px-3 py-1 bg-indigo-500/5 border border-indigo-500/20 rounded-full mb-1"
            >
              <span className="text-[10px] text-indigo-300 uppercase tracking-[0.2em] font-mono">
                PHASE 0{phaseNum}: {currentPhasePres.name}
              </span>
            </motion.div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-normal">
              {currentPhasePres.description}
            </p>
          </div>

          <div className="w-full flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {showStoryConcept ? (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-sm"
                >
                  <ConceptViewer />
                </motion.div>
              ) : (
                <GridBoard
                  nodes={nodes}
                  startCoord={currentPhasePres.startCoord}
                  endCoord={currentPhasePres.endCoord}
                  onNodeClick={handleNodeClick}
                  hoveredNode={hoveredNode}
                  setHoveredNode={setHoveredNode}
                  scannedNodeIds={scannedNodeIds}
                  winningPathIds={winningPathIds}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Controls Quick Manuals */}
          <div className="w-full max-w-lg mt-6 bg-[#0F0F17]/30 border border-white/5 rounded p-3 text-center flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-500 font-mono tracking-tight text-left">
              * Click adjacent nodes connected to Start node to extend routing. Avoid firewall block sectors.
            </span>
            <button
              onClick={handleReboot}
              className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 hover:text-indigo-400 border border-white/10 hover:border-indigo-400 px-3 py-1 bg-[#0A0A0F]"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              Reset Area
            </button>
          </div>
        </main>

        {/* Right controls sidebars */}
        <SidebarControls
          playerLevel={playerLevel}
          energy={energy}
          onUseOverclock={useOverclock}
          onUseDeepScan={useDeepScan}
          onUseEMPBlast={useEMPBlast}
          isMuted={isMuted}
          onToggleMute={handlesToggleMute}
          overclockActive={overclockActive}
        />
      </div>

      {/* Modern Console footer bar */}
      <footer className="h-10 border-t border-white/10 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500 bg-[#0F0F17] relative z-10">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-1.5 text-emerald-400/95 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            CONSOLE_OK
          </span>
          <span className="hidden sm:inline">LATENCY: 14ms</span>
          <span className="hidden md:inline">BANDWIDTH: 1.2 GB/S</span>
        </div>

        <div className="flex gap-4">
          <span className="text-indigo-400 font-semibold tracking-wider">
            {hoveredNode ? (
              `HOVER_COORD: R${hoveredNode.row}.C${hoveredNode.col} [S:${hoveredNode.state.toUpperCase()}]`
            ) : (
              `NODE_COORD: X42.Y12 [IDLE]`
            )}
          </span>
          <span className="text-slate-500 uppercase tracking-widest hidden sm:inline">V2.4.0_STABLE</span>
        </div>
      </footer>

      {/* Dynamic Overlays */}
      <AnimatePresence>
        {activeModal && (
          <GameStatusModal
            isOpen={activeModal !== null}
            type={activeModal as 'win' | 'fail' | 'instructions'}
            score={score}
            phase={currentPhasePres}
            stability={stability}
            multiplier={multiplier}
            objectives={objectives}
            onAction={activeModal === 'win' ? handleNextPhase : activeModal === 'fail' ? handleReboot : handleCloseHelp}
            onClose={activeModal === 'instructions' ? handleCloseHelp : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
