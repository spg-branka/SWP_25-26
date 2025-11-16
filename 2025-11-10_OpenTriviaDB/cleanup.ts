import { PrismaClient } from "./generated/prisma/client.ts";
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning duplicates…");

  // 1. REMOVE DUPLICATE QUESTIONS
  const questions = await prisma.question.findMany({
    orderBy: { id: "asc" },
  });

  const seenQuestions = new Set<string>();

  for (const q of questions) {
    if (seenQuestions.has(q.question)) {
      console.log("Deleting duplicate question:", q.question);
      await prisma.question.delete({
        where: { id: q.id },
      });
      continue;
    }
    seenQuestions.add(q.question);
  }

  // 2. REMOVE DUPLICATE ANSWERS
  const answers = await prisma.answer.findMany({
    orderBy: { id: "asc" },
    include: {
      incorrect_in_questions: true,
      correct_in_questions: true,
    },
  });

  const seenAnswers = new Set<string>();

  for (const a of answers) {
    if (seenAnswers.has(a.answer)) {
      console.log("Deleting duplicate answer:", a.answer);
      await prisma.answer.delete({
        where: { id: a.id },
      });
      continue;
    }
    seenAnswers.add(a.answer);
  }

  console.log("Cleanup complete!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
