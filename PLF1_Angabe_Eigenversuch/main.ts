import '@std/dotenv';
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env["DATABASE_URL"]! }),
});
await prisma.$connect();

async function main() {
  const tables = await prisma.tisch.findMany();
  console.log("Tische:", tables);
}

await main();
await prisma.$disconnect();
