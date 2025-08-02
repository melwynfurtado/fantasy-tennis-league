import prisma from '../src/lib/prisma';
import { JSDOM } from 'jsdom';
// Use native fetch (Node 18+)
// If using Node <18, install 'undici' and use globalThis.fetch = require('undici').fetch;
// import fetch from 'node-fetch';
// import type { JSDOM } from 'jsdom';

// Helper to parse set scores and determine points
function getPoints(gender: string, setsWon: number, setsLost: number, winner: boolean): number {
  if (gender === 'male') {
    if (winner) {
      if (setsWon === 3 && setsLost === 0) return 5;
      if (setsWon === 3 && setsLost === 1) return 4;
      if (setsWon === 3 && setsLost === 2) return 3;
    } else {
      if (setsWon === 2 && setsLost === 3) return 2;
      if (setsWon === 1 && setsLost === 3) return 1;
      if (setsWon === 0 && setsLost === 3) return 0;
    }
  } else {
    if (winner) {
      if (setsWon === 2 && setsLost === 0) return 5;
      if (setsWon === 2 && setsLost === 1) return 3;
    } else {
      if (setsWon === 1 && setsLost === 2) return 1;
      if (setsWon === 0 && setsLost === 2) return 0;
    }
  }
  return 0;
}

async function importResults(day: number) {
  const url = `https://www.wimbledon.com/en_GB/scores/results/day${day}.html`;
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  // This selector may need adjustment based on Wimbledon HTML structure
  const matches = doc.querySelectorAll('.scores-table tbody tr');
  for (const match of matches) {
    const cells: NodeListOf<HTMLTableCellElement> = match.querySelectorAll('td');
    if (cells.length < 6) continue;
    const playerName: string = cells[1].textContent?.trim() || '';
    const opponentName: string = cells[2].textContent?.trim() || '';
    const scoreStr: string = cells[3].textContent?.trim() || '';
    const roundStr: string = cells[0].textContent?.trim() || '';
    const gender: string = roundStr.toLowerCase().includes('women') ? 'female' : 'male';
    // Parse set scores
    const sets: string[] = scoreStr.split(',').map((s: string) => s.trim());
    let setsWon = 0, setsLost = 0;
    sets.forEach((set: string) => {
      const [p1, p2] = set.split('-').map(Number);
      if (p1 > p2) setsWon++;
      else setsLost++;
    });
    // Determine winner
    const winner = setsWon > setsLost;
    const points = getPoints(gender, setsWon, setsLost, winner);
    // Find player in DB
    const player = await prisma.player.findFirst({ where: { name: playerName } });
    if (!player) continue;
    // Save result
    await prisma.matchResult.create({
      data: {
        playerId: player.id,
        round: day,
        score: scoreStr,
        points,
      },
    });
  }
}

(async () => {
  for (let day = 8; day <= 14; day++) {
    await importResults(day);
    console.log(`Imported results for day ${day}`);
  }
})();
