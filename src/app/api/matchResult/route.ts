import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { playerId, round, setsWon, setsLost, points, score } = data;
  
  if (!playerId || !round || setsWon === undefined || setsLost === undefined || points === undefined) {
    return NextResponse.json({ error: 'Player ID, round, sets won/lost, and points required' }, { status: 400 });
  }
  
  try {
    // Check if this player already has a result for this round
    const existingResult = await prisma.matchResult.findFirst({
      where: {
        playerId: playerId,
        round: round
      }
    });
    
    if (existingResult) {
      return NextResponse.json({ error: 'Match result already exists for this player in this round' }, { status: 400 });
    }
    
    const result = await prisma.matchResult.create({
      data: {
        playerId,
        round,
        score: score || `${setsWon}-${setsLost}`,
        points,
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating match result:', error);
    return NextResponse.json({ error: 'Failed to create match result' }, { status: 500 });
  }
}

export async function GET() {
  const results = await prisma.matchResult.findMany();
  return NextResponse.json(results);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Match result ID required' }, { status: 400 });
  }
  try {
    await prisma.matchResult.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Match result not found or could not be deleted' }, { status: 404 });
  }
}
