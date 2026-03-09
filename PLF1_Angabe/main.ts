import { load } from "@std/dotenv";
import { PrismaClient } from "./prisma/client/client.ts";

await load({ export: true });

const prisma = new PrismaClient();
await prisma.$connect();

async function main() {
  const tables = await prisma.tisch.findMany();
  console.log("Tische:", tables);
}

await main();
await prisma.$disconnect();
