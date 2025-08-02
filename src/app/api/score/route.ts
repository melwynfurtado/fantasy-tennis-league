import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Aggregate scores for all teams/players per round
export async function GET() {
  // Get all teams
  const teams = await prisma.team.findMany({ include: { teamPlayers: true } });
  // Get all match results
  const results = await prisma.matchResult.findMany();
  // Aggregate scores per team per round
  const teamScores: any[] = [];
  for (const team of teams) {
    const scoresByRound: { [round: number]: number } = {};
    for (const tp of team.teamPlayers) {
      const playerResults = results.filter(r => r.playerId === tp.playerId);
      for (const r of playerResults) {
        scoresByRound[r.round] = (scoresByRound[r.round] || 0) + r.points;
      }
    }
    teamScores.push({
      teamId: team.id,
      participantId: team.participantId,
      scores: scoresByRound,
      total: Object.values(scoresByRound).reduce((a, b) => a + b, 0),
    });
  }
  return NextResponse.json(teamScores);
}
