/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GridNode } from '../types';

export function getNodeAt(grid: GridNode[], r: number, c: number): GridNode | undefined {
  return grid.find(node => node.row === r && node.col === c);
}

/**
 * Calculates all Active nodes that have a valid path back to the Start Terminal.
 */
export function calculateConnectedNodes(
  grid: GridNode[],
  startCoord: { r: number; c: number }
): Set<string> {
  const connectedIds = new Set<string>();
  const startNode = getNodeAt(grid, startCoord.r, startCoord.c);
  
  if (!startNode || startNode.state === 'inactive') {
    return connectedIds;
  }

  const queue: GridNode[] = [startNode];
  connectedIds.add(startNode.id);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = [
      { r: current.row - 1, c: current.col },
      { r: current.row + 1, c: current.col },
      { r: current.row, c: current.col - 1 },
      { r: current.row, c: current.col + 1 }
    ];

    for (const neighbor of neighbors) {
      const neighborNode = getNodeAt(grid, neighbor.r, neighbor.c);
      if (
        neighborNode &&
        (neighborNode.state === 'active' || neighborNode.state === 'connected' || neighborNode.type === 'end') &&
        neighborNode.type !== 'firewall' &&
        !connectedIds.has(neighborNode.id)
      ) {
        connectedIds.add(neighborNode.id);
        queue.push(neighborNode);
      }
    }
  }

  return connectedIds;
}

/**
 * Uses Breadth-First-Search (BFS) to find if a connected path exists from start to end,
 * returning the sequence of node IDs.
 */
export function checkWinCondition(
  grid: GridNode[],
  startCoord: { r: number; c: number },
  endCoord: { r: number; c: number }
): { isConnected: boolean; pathNodeIds: string[] } {
  const startNode = getNodeAt(grid, startCoord.r, startCoord.c);
  const endNode = getNodeAt(grid, endCoord.r, endCoord.c);

  if (!startNode || !endNode) {
    return { isConnected: false, pathNodeIds: [] };
  }

  const queue: { node: GridNode; path: string[] }[] = [];
  const visited = new Set<string>();

  queue.push({ node: startNode, path: [startNode.id] });
  visited.add(startNode.id);

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;

    if (node.row === endCoord.r && node.col === endCoord.c) {
      return { isConnected: true, pathNodeIds: path };
    }

    const neighbors = [
      { r: node.row - 1, c: node.col },
      { r: node.row + 1, c: node.col },
      { r: node.row, c: node.col - 1 },
      { r: node.row, c: node.col + 1 }
    ];

    for (const neighbor of neighbors) {
      const neighborNode = getNodeAt(grid, neighbor.r, neighbor.c);
      if (
        neighborNode &&
        (neighborNode.state === 'active' || neighborNode.state === 'connected' || neighborNode.type === 'end') &&
        neighborNode.type !== 'firewall' &&
        !visited.has(neighborNode.id)
      ) {
        visited.add(neighborNode.id);
        queue.push({
          node: neighborNode,
          path: [...path, neighborNode.id]
        });
      }
    }
  }

  return { isConnected: false, pathNodeIds: [] };
}
