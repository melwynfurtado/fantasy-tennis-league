import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { participantId, players } = data;
  // players: [{ playerId, role }]
  if (!participantId || !players || players.length !== 12) {
    return NextResponse.json({ error: 'Participant and 12 players required' }, { status: 400 });
  }

  // Fetch player details for seeded picks only (positive IDs)
  const seededIds = players.filter((p: any) => p.playerId > 0).map((p: any) => p.playerId);
  const playerRecords = seededIds.length
    ? await prisma.player.findMany({ where: { id: { in: seededIds } } })
    : [];

  // Normalize all player objects with gender set
  const normalizedPlayers = players.map((p: any, idx: number) => {
    if (p.playerId > 0) {
      const record = playerRecords.find(r => r.id === p.playerId);
      if (!record) throw new Error(`Player not found: ${p.playerId}`);
      return { ...p, ...record };
    } else {
      if (!p.name || typeof p.name !== 'string' || p.name.trim() === '') {
        throw new Error(`Manual pick missing name at position ${idx + 1}`);
      }
      let gender = p.gender;
      if (!gender) {
        gender = idx < 6 ? 'male' : 'female';
      }
      return { ...p, gender };
    }
  });
  // Split by gender
  const malePlayers = normalizedPlayers.filter((p: any) => p.gender === 'male');
  const femalePlayers = normalizedPlayers.filter((p: any) => p.gender === 'female');
  if (malePlayers.length !== 6 || femalePlayers.length !== 6) {
    return NextResponse.json({ error: 'Must select 6 male and 6 female players' }, { status: 400 });
  }

  // Helper to validate seed pools and sum
  function validatePools(players: any[]) {
    // Seed pools
    const pools = [
      { min: 1, max: 7 },
      { min: 8, max: 15 },
      { min: 16, max: 23 },
      { min: 24, max: 32 },
    ];
    let poolPicks: any[] = [];
    let poolSum = 0;
    for (const pool of pools) {
      const pick = players.find(p => p.seed && p.seed >= pool.min && p.seed <= pool.max && p.role === 'seed-pool');
      if (!pick) return { valid: false, error: `Missing pick from seed pool ${pool.min}-${pool.max}` };
      poolPicks.push(pick);
      poolSum += pick.seed;
    }
    if (poolSum < 60) return { valid: false, error: 'Seed sum for pool picks must be 60 or over' };
    // Non-seeded
    const nonSeeded = players.find(p => !p.seed && p.role === 'non-seeded');
    if (!nonSeeded) return { valid: false, error: 'Missing non-seeded pick' };
    // Outside top 4
    const outsideTop4 = players.find(p => p.seed && p.seed > 4 && p.role === 'outside-top-4');
    if (!outsideTop4) return { valid: false, error: 'Missing outside-top-4 pick' };
    return { valid: true };
  }
  const maleValidation = validatePools(malePlayers);
  if (!maleValidation.valid) return NextResponse.json({ error: `Male picks: ${maleValidation.error}` }, { status: 400 });
  const femaleValidation = validatePools(femalePlayers);
  if (!femaleValidation.valid) return NextResponse.json({ error: `Female picks: ${femaleValidation.error}` }, { status: 400 });

  // All validation passed, create team
  // For manual picks, create a player record first and use its ID
  const teamPlayersToCreate = [];
  for (const [idx, p] of players.entries()) {
    if (p.playerId > 0) {
      teamPlayersToCreate.push({ playerId: p.playerId, role: p.role });
    } else {
      // Manual: ensure gender is set (fallback to index if missing)
      let gender = p.gender;
      if (!gender) {
        gender = idx < 6 ? 'male' : 'female';
      }
      const created = await prisma.player.create({
        data: {
          name: p.name,
          gender,
          seed: p.seed ?? null,
        },
      });
      teamPlayersToCreate.push({ playerId: created.id, role: p.role });
    }
  }
  const team = await prisma.team.create({
    data: {
      participantId,
      teamPlayers: {
        create: teamPlayersToCreate,
      },
    },
    include: { teamPlayers: true },
  });
  return NextResponse.json(team);
}

export async function GET() {
  const teams = await prisma.team.findMany({ include: { teamPlayers: true } });
  return NextResponse.json(teams);
}
