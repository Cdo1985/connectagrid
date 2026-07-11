/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NodeType = 'standard' | 'start' | 'end' | 'firewall' | 'power' | 'cache';
export type NodeState = 'inactive' | 'active' | 'connected';

export interface GridNode {
  id: string;
  row: number;
  col: number;
  type: NodeType;
  state: NodeState;
}

export interface PhaseObjective {
  id: string;
  text: string;
  isCompleted: boolean;
  type: 'connect' | 'stability' | 'bypass' | 'power' | 'cache';
}

export interface GamePhase {
  number: number;
  name: string;
  description: string;
  startCoord: { r: number; c: number };
  endCoord: { r: number; c: number };
  firewalls: { r: number; c: number }[];
  powerNodes: { r: number; c: number }[];
  cacheNodes?: { r: number; c: number }[];
  targetNodesLimit?: number;
  minStabilityRequired: number;
}
