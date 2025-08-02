
import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();
const filePath = path.join(process.cwd(), 'public', 'Seeding.csv');
const csv = fs.readFileSync(filePath, 'utf-8');

function parseCSV(csv: string) {
  const lines = csv.split('\n').filter(l => l.trim());
  const players = [];
  for (const line of lines) {
    const parts = line.replace(/"/g, '').split(',');
    if (parts.length < 3) {
      console.warn('Skipping malformed line:', line);
      continue;
    }
    const [nameRaw, genderRaw, seedRaw] = parts;
    const name = nameRaw.trim();
    let gender = genderRaw.trim().toLowerCase();
    if (gender === 'male' || gender === 'm') gender = 'male';
    else if (gender === 'female' || gender === 'f') gender = 'female';
    else gender = 'other';
    const seed = parseInt(seedRaw.trim());
    if (!name || !gender || isNaN(seed)) {
      console.warn('Skipping invalid player:', { name, gender, seed });
      continue;
    }
    players.push({ name, gender, seed });
  }
  return players;
}

const players = parseCSV(csv);

async function main() {
    console.log('Seeding players...');
    console.log(players);
  await prisma.player.createMany({
    data: players,
    skipDuplicates: true,
  });
  console.log('Seeded players imported!');
}

main().finally(() => prisma.$disconnect());
