import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const players = await prisma.player.findMany();
  return NextResponse.json(players);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, name, gender, seed } = data;
  
  if (!id || !name || !gender) {
    return NextResponse.json({ error: 'ID, name, and gender required' }, { status: 400 });
  }
  
  try {
    const player = await prisma.player.update({
      where: { id },
      data: { name, gender, seed: seed || null },
    });
    return NextResponse.json(player);
  } catch (error) {
    return NextResponse.json({ error: 'Player not found or could not be updated' }, { status: 404 });
  }
}


export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, gender, seed } = data;
  if (!name || !gender) {
    return NextResponse.json({ error: 'Name and gender required' }, { status: 400 });
  }
  const player = await prisma.player.create({
    data: { name, gender, seed },
  });
  return NextResponse.json(player);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
  }
  try {
    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Player not found or could not be deleted' }, { status: 404 });
  }
}
