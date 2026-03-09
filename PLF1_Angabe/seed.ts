import { load } from "@std/dotenv";
import { faker } from "@faker-js/faker";
import { PrismaClient } from "./prisma/client/client.ts";

await load({ export: true });

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.bestellzeile.deleteMany();
  await prisma.bestellung.deleteMany();
  await prisma.speise.deleteMany();
  await prisma.allergen.deleteMany();
  await prisma.tisch.deleteMany();

  // Create allergens
  const allergens = [
    "Gluten (Getreide)",
    "Milch",
    "Ei",
    "Soja",
    "Nüsse (Schalenfrüchte)",
    "Erdnuss",
    "Sellerie",
    "Senf",
    "Sesam",
    "Fisch",
    "Krebstiere/Weichtiere",
    "Sulfite",
    "Lupinen"
  ];

  const allergenRecords = [];
  for (const name of allergens) {
    const allergen = await prisma.allergen.create({
      data: { name }
    });
    allergenRecords.push(allergen);
  }

  // Create dishes using FakerJS food category
  const dishRecords = [];
  for (let i = 0; i < 20; i++) {
    // Generate dish name using faker.food
    const dishName = faker.food.dish();
    const price = faker.number.float({ min: 5.50, max: 15.90});
    const description = faker.food.description();

    // Randomly assign 0-3 allergens to each dish
    const numAllergens = faker.number.int({ min: 0, max: 3 });
    const selectedAllergens = faker.helpers.arrayElements(allergenRecords, numAllergens);

    const createdDish = await prisma.speise.create({
      data: {
        name: dishName,
        preis: price,
        beschreibung: description,
        allergene: {
          connect: selectedAllergens.map(a => ({ id: a.id }))
        }
      }
    });
    dishRecords.push(createdDish);
  }

  // Create tables
  const tableRecords = [];
  for (let i = 1; i <= 10; i++) {
    const table = await prisma.tisch.create({
      data: {}
    });
    tableRecords.push(table);
  }

  // Create orders with order lines
  for (let i = 0; i < 25; i++) {
    const table = faker.helpers.arrayElement(tableRecords);
    const orderTime = faker.date.recent({ days: 7 });

    const order = await prisma.bestellung.create({
      data: {
        tischId: table.id,
        zeitpunkt: orderTime
      }
    });

    // Create 1-4 order lines per order
    const numLines = faker.number.int({ min: 1, max: 4 });
    for (let j = 0; j < numLines; j++) {
      const dish = faker.helpers.arrayElement(dishRecords);
      await prisma.bestellzeile.create({
        data: {
          bestellungId: order.id,
          speiseId: dish.id,
          menge: faker.number.int({ min: 1, max: 3 })
        }
      });
    }
  }

  console.log("Database seeded successfully!");
  console.log(`Created ${allergenRecords.length} allergens`);
  console.log(`Created ${dishRecords.length} dishes`);
  console.log(`Created ${tableRecords.length} tables`);
  console.log("Created 25 orders with order lines");
}

await main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });