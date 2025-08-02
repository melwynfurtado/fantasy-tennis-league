import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  // Aggregate points for each participant's team
  const teams = await prisma.team.findMany({
    include: {
      participant: true,
      teamPlayers: {
        include: {
          player: {
            include: {
              matchResults: true,
            },
          },
        },
      },
    },
  });

  const leaderboard = teams.map(team => {
    const totalPoints = team.teamPlayers.reduce((sum, tp) => {
      const playerPoints = tp.player.matchResults.reduce((pSum, mr) => pSum + mr.points, 0);
      return sum + playerPoints;
    }, 0);
    return {
      participant: team.participant.name,
      totalPoints,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  return NextResponse.json(leaderboard);
}
