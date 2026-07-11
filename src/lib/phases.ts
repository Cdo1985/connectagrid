/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GamePhase } from '../types';

export const CAMPAIGN_PHASES: GamePhase[] = [
  {
    number: 1,
    name: 'Sector C4 Bypass',
    description: 'Establish node alignment while steering clear of Firewall Sector C4. Grab the High-Yield Cache for massive score multipliers.',
    startCoord: { r: 3, c: 0 },
    endCoord: { r: 3, c: 6 },
    firewalls: [
      { r: 3, c: 3 }, // Firewall Sector C4
      { r: 2, c: 3 },
      { r: 4, c: 3 }
    ],
    powerNodes: [
      { r: 1, c: 2 },
      { r: 5, c: 4 }
    ],
    cacheNodes: [
      { r: 0, c: 4 } // High-Yield Cache Node
    ],
    targetNodesLimit: 10, // Harder! (was 12)
    minStabilityRequired: 85
  },
  {
    number: 2,
    name: 'Highways Protocol',
    description: 'Construct a secure data highway through double checkpoints. Center caches provide immense rating bonuses.',
    startCoord: { r: 0, c: 3 },
    endCoord: { r: 6, c: 3 },
    firewalls: [
      { r: 2, c: 2 },
      { r: 2, c: 4 },
      { r: 4, c: 2 },
      { r: 4, c: 4 }
    ],
    powerNodes: [
      { r: 3, c: 1 },
      { r: 3, c: 5 }
    ],
    cacheNodes: [
      { r: 3, c: 3 } // Directly in the center crosshair!
    ],
    targetNodesLimit: 11, // Harder! (was 14)
    minStabilityRequired: 80
  },
  {
    number: 3,
    name: 'Modular Wall',
    description: 'Navigate around a physical grid split. Hidden side channels contain rich research cache relics.',
    startCoord: { r: 1, c: 0 },
    endCoord: { r: 5, c: 6 },
    firewalls: [
      { r: 1, c: 3 },
      { r: 2, c: 3 },
      { r: 3, c: 3 },
      { r: 4, c: 3 },
      { r: 5, c: 3 }
    ],
    powerNodes: [
      { r: 0, c: 3 },
      { r: 6, c: 3 }
    ],
    cacheNodes: [
      { r: 3, c: 1 },
      { r: 3, c: 5 }
    ],
    targetNodesLimit: 13, // Harder! (was 15)
    minStabilityRequired: 80
  },
  {
    number: 4,
    name: 'Central Core Cluster',
    description: 'The core is highly unstable. Loop around the perimeter firewall but watch out for corner caches.',
    startCoord: { r: 6, c: 0 },
    endCoord: { r: 0, c: 6 },
    firewalls: [
      { r: 3, c: 3 },
      { r: 2, c: 3 },
      { r: 4, c: 3 },
      { r: 3, c: 2 },
      { r: 3, c: 4 }
    ],
    powerNodes: [
      { r: 1, c: 1 },
      { r: 1, c: 5 },
      { r: 5, c: 1 },
      { r: 5, c: 5 }
    ],
    cacheNodes: [
      { r: 0, c: 0 },
      { r: 6, c: 6 }
    ],
    targetNodesLimit: 13, // Harder! (was 16)
    minStabilityRequired: 90
  }
];

export function getPhasePreset(phaseNum: number): GamePhase {
  if (phaseNum <= CAMPAIGN_PHASES.length) {
    return CAMPAIGN_PHASES[phaseNum - 1];
  }

  // Procedural generator for upper phases (up to 24 and beyond)
  // Generates unique, solvable configurations using deterministic formulas
  const seed = phaseNum * 12345;
  const startR = (seed % 5) + 1;
  const endR = ((seed >> 2) % 5) + 1;
  
  const startCoord = { r: startR, c: 0 };
  const endCoord = { r: endR, c: 6 };

  // Generate random firewalls, power slots, and caches
  const firewalls: { r: number; c: number }[] = [];
  const powerNodes: { r: number; c: number }[] = [];
  const cacheNodes: { r: number; c: number }[] = [];

  for (let r = 0; r < 7; r++) {
    for (let c = 1; c < 6; c++) {
      const uniqueVal = (r * 17 + c * 23 + seed) % 100;
      if (uniqueVal < 25) { // More firewalls! (was 20) Filter start & end paths
        if (!(r === startR && c === 1) && !(r === endR && c === 5)) {
          firewalls.push({ r, c });
        }
      } else if (uniqueVal >= 92) {
        powerNodes.push({ r, c });
      } else if (uniqueVal >= 82 && uniqueVal < 88) {
        cacheNodes.push({ r, c });
      }
    }
  }

  // Ensure there's at least 1 power node & 1 cache node
  if (powerNodes.length === 0) {
    powerNodes.push({ r: 3, c: 3 });
  }
  if (cacheNodes.length === 0) {
    cacheNodes.push({ r: Math.abs((seed + 2) % 7), c: 4 });
  }

  return {
    number: phaseNum,
    name: `Sector Node-${Math.abs(seed % 1000).toString(16).toUpperCase()}`,
    description: `Phase ${phaseNum} authorized. Establish continuous loop alignment. Connect cache cores for extreme rating spikes.`,
    startCoord,
    endCoord,
    firewalls,
    powerNodes,
    cacheNodes,
    targetNodesLimit: 11 + (phaseNum % 4), // Harder limit (was 14 + ...)
    minStabilityRequired: Math.min(95, Math.max(75, 92 - (phaseNum % 8)))
  };
}
