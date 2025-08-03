import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name, email } = data;
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
  }
  const participant = await prisma.participant.create({
    data: { name, email },
  });
  return NextResponse.json(participant);
}


export async function GET() {
  const participants = await prisma.participant.findMany();
  return NextResponse.json(participants);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, name, email } = data;
  
  if (!id || !name || !email) {
    return NextResponse.json({ error: 'ID, name, and email required' }, { status: 400 });
  }
  
  try {
    const participant = await prisma.participant.update({
      where: { id },
      data: { name, email },
    });
    return NextResponse.json(participant);
  } catch (error) {
    return NextResponse.json({ error: 'Participant not found or could not be updated' }, { status: 404 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Participant ID required' }, { status: 400 });
  }
  try {
    await prisma.participant.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Participant not found or could not be deleted' }, { status: 404 });
  }
}
