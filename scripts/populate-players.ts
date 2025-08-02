import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const playersData = [
  // Men's Singles
  { name: "SINNER, Jannik", gender: "male", seed: 1 },
  { name: "ALCARAZ, Carlos", gender: "male", seed: 2 },
  { name: "ZVEREV, Alexander", gender: "male", seed: 3 },
  { name: "DRAPER, Jack", gender: "male", seed: 4 },
  { name: "FRITZ, Taylor", gender: "male", seed: 5 },
  { name: "DJOKOVIC, Novak", gender: "male", seed: 6 },
  { name: "MUSETTI, Lorenzo", gender: "male", seed: 7 },
  { name: "RUNE, Holger", gender: "male", seed: 8 },
  { name: "MEDVEDEV, Daniil", gender: "male", seed: 9 },
  { name: "SHELTON, Ben", gender: "male", seed: 10 },
  { name: "DE MINAUR, Alex", gender: "male", seed: 11 },
  { name: "TIAFOE, Frances", gender: "male", seed: 12 },
  { name: "PAUL, Tommy", gender: "male", seed: 13 },
  { name: "RUBLEV, Andrey", gender: "male", seed: 14 },
  { name: "MENSIK, Jakub", gender: "male", seed: 15 },
  { name: "CERUNDOLO, Francisco", gender: "male", seed: 16 },
  { name: "KHACHANOV, Karen", gender: "male", seed: 17 },
  { name: "HUMBERT, Ugo", gender: "male", seed: 18 },
  { name: "DIMITROV, Grigor", gender: "male", seed: 19 },
  { name: "POPYRIN, Alexei", gender: "male", seed: 20 },
  { name: "MACHAC, Tomas", gender: "male", seed: 21 },
  { name: "COBOLLI, Flavio", gender: "male", seed: 22 },
  { name: "LEHECKA, Jiri", gender: "male", seed: 23 },
  { name: "TSITSIPAS, Stefanos", gender: "male", seed: 24 },
  { name: "AUGER-ALIASSIME, Felix", gender: "male", seed: 25 },
  { name: "DAVIDOVICH FOKINA, Alejandro", gender: "male", seed: 26 },
  { name: "SHAPOVALOV, Denis", gender: "male", seed: 27 },
  { name: "BUBLIK, Alexander", gender: "male", seed: 28 },
  { name: "NAKASHIMA, Brandon", gender: "male", seed: 29 },
  { name: "MICHELSEN, Alex", gender: "male", seed: 30 },
  { name: "GRIEKSPOOR, Tallon", gender: "male", seed: 31 },
  { name: "BERRETTINI, Matteo", gender: "male", seed: 32 },

  // Women's Singles
  { name: "SABALENKA, Aryna", gender: "female", seed: 1 },
  { name: "GAUFF, Coco", gender: "female", seed: 2 },
  { name: "PEGULA, Jessica", gender: "female", seed: 3 },
  { name: "PAOLINI, Jasmine", gender: "female", seed: 4 },
  { name: "ZHENG, Qinwen", gender: "female", seed: 5 },
  { name: "KEYS, Madison", gender: "female", seed: 6 },
  { name: "ANDREEVA, Mirra", gender: "female", seed: 7 },
  { name: "SWIATEK, Iga", gender: "female", seed: 8 },
  { name: "BADOSA, Paula", gender: "female", seed: 9 },
  { name: "NAVARRO, Emma", gender: "female", seed: 10 },
  { name: "RYBAKINA, Elena", gender: "female", seed: 11 },
  { name: "SHNAIDER, Diana", gender: "female", seed: 12 },
  { name: "ANISIMOVA, Amanda", gender: "female", seed: 13 },
  { name: "SVITOLINA, Elina", gender: "female", seed: 14 },
  { name: "MUCHOVA, Karolina", gender: "female", seed: 15 },
  { name: "KASATKINA, Daria", gender: "female", seed: 16 },
  { name: "KREJCIKOVA, Barbora", gender: "female", seed: 17 },
  { name: "ALEXANDROVA, Ekaterina", gender: "female", seed: 18 },
  { name: "SAMSONOVA, Liudmila", gender: "female", seed: 19 },
  { name: "OSTAPENKO, Jelena", gender: "female", seed: 20 },
  { name: "HADDAD MAIA, Beatriz", gender: "female", seed: 21 },
  { name: "VEKIC, Donna", gender: "female", seed: 22 },
  { name: "TAUSON, Clara", gender: "female", seed: 23 },
  { name: "MERTENS, Elise", gender: "female", seed: 24 },
  { name: "FRECH, Magdalena", gender: "female", seed: 25 },
  { name: "KOSTYUK, Marta", gender: "female", seed: 26 },
  { name: "LINETTE, Magda", gender: "female", seed: 27 },
  { name: "KENIN, Sofia", gender: "female", seed: 28 },
  { name: "FERNANDEZ, Leylah", gender: "female", seed: 29 },
  { name: "NOSKOVA, Linda", gender: "female", seed: 30 },
  { name: "KRUEGER, Ashlyn", gender: "female", seed: 31 },
  { name: "KESSLER, McCartney", gender: "female", seed: 32 },

  // Some additional non-seeded players from qualifying
  { name: "FUCSOVICS, Marton", gender: "male", seed: null },
  { name: "SCHOOLKATE, Tristan", gender: "male", seed: null },
  { name: "CERUNDOLO, Juan Manuel", gender: "male", seed: null },
  { name: "GALAN, Daniel Elahi", gender: "male", seed: null },
  { name: "BARRIOS VERA, Tomas", gender: "male", seed: null },
  { name: "ROYER, Valentin", gender: "male", seed: null },
  { name: "CAZAUX, Arthur", gender: "male", seed: null },
  { name: "GARIN, Cristian", gender: "male", seed: null },
  { name: "BOYER, Tristan", gender: "male", seed: null },
  { name: "SPIZZIRRI, Eliot", gender: "male", seed: null },
  { name: "FARIA, Jaime", gender: "male", seed: null },
  { name: "SEYBOTH WILD, Thiago", gender: "male", seed: null },
  { name: "NAVA, Emilio", gender: "male", seed: null },
  { name: "ATMANE, Terence", gender: "male", seed: null },
  { name: "SVRCINA, Dalibor", gender: "male", seed: null },
  { name: "BASILASHVILI, Nikoloz", gender: "male", seed: null },
  { name: "HERBERT, Pierre-Hugues", gender: "male", seed: null },
  { name: "MANNARINO, Adrian", gender: "male", seed: null },
  { name: "TIRANTE, Thiago Agustin", gender: "male", seed: null },
  { name: "TABERNER, Carlos", gender: "male", seed: null },

  { name: "BOISSON, Lois", gender: "female", seed: null },
  { name: "PARRIZAS DIAZ, Nuria", gender: "female", seed: null },
  { name: "JOVIC, Iva", gender: "female", seed: null },
  { name: "ZAKHAROVA, Anastasia", gender: "female", seed: null },
  { name: "JEANJEAN, Leolia", gender: "female", seed: null },
  { name: "MBOKO, Victoria", gender: "female", seed: null },
  { name: "TOWNSEND, Taylor", gender: "female", seed: null },
  { name: "RUZIC, Antonia", gender: "female", seed: null },
  { name: "MARINO, Rebecca", gender: "female", seed: null },
  { name: "SIERRA, Solana", gender: "female", seed: null },
  { name: "ANDREEVA, Erika", gender: "female", seed: null },
  { name: "SASNOVICH, Aliaksandra", gender: "female", seed: null },
  { name: "SEIDEL, Ella", gender: "female", seed: null },
  { name: "MASAROVA, Rebeka", gender: "female", seed: null },
  { name: "JACQUEMOT, Elsa", gender: "female", seed: null },
  { name: "MONTGOMERY, Robin", gender: "female", seed: null },
  { name: "PARRY, Diane", gender: "female", seed: null },
  { name: "VALENTOVA, Tereza", gender: "female", seed: null },
  { name: "LEPCHENKO, Varvara", gender: "female", seed: null },
  { name: "CARLE, Maria Lourdes", gender: "female", seed: null },
];

async function main() {
  console.log('Starting database population...');
  
  try {
    // Clear existing players
    await prisma.matchResult.deleteMany();
    await prisma.teamPlayer.deleteMany();
    await prisma.player.deleteMany();
    console.log('Cleared existing players');

    // Insert players
    for (const player of playersData) {
      await prisma.player.create({
        data: player,
      });
    }
    
    console.log(`Inserted ${playersData.length} players`);
    
    // Display summary
    const maleSeeded = playersData.filter(p => p.gender === 'male' && p.seed !== null).length;
    const femaleSeeded = playersData.filter(p => p.gender === 'female' && p.seed !== null).length;
    const maleUnseeded = playersData.filter(p => p.gender === 'male' && p.seed === null).length;
    const femaleUnseeded = playersData.filter(p => p.gender === 'female' && p.seed === null).length;
    
    console.log(`Summary:`);
    console.log(`- Male seeded players: ${maleSeeded}`);
    console.log(`- Female seeded players: ${femaleSeeded}`);
    console.log(`- Male non-seeded players: ${maleUnseeded}`);
    console.log(`- Female non-seeded players: ${femaleUnseeded}`);
    
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
