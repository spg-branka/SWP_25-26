const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching 50 trivia questions from Open Trivia DB...");
  const res = await fetch("https://opentdb.com/api.php?amount=50");
  const data = await res.json();

  for (const item of data.results) {
    // --- Upsert Difficulty ---
    // Ensures that the same difficulty (easy, medium, hard) is not duplicated
    const difficulty = await prisma.difficulty.upsert({
      where: { level: item.difficulty },
      update: {},
      create: { level: item.difficulty },
    });

    // --- Upsert Category ---
    // Uses a numeric hash of the category name to ensure uniqueness
    const category = await prisma.category.upsert({
      where: { opentdb_id: item.category.hashCode() },
      update: {},
      create: { name: item.category, opentdb_id: item.category.hashCode() },
    });

    // --- Upsert Type ---
    // Avoids duplicating question types (multiple, boolean)
    const type = await prisma.type.upsert({
      where: { type: item.type },
      update: {},
      create: { type: item.type },
    });

    // --- Upsert Correct Answer ---
    // Only create a new Answer if it doesn't already exist
    let correctAnswer = await prisma.answer.findFirst({
      where: { answer: item.correct_answer },
    });
    if (!correctAnswer) {
      correctAnswer = await prisma.answer.create({
        data: { answer: item.correct_answer },
      });
    }

    // --- Upsert Incorrect Answers ---
    const incorrectAnswers = [];
    for (const wrong of item.incorrect_answers) {
      // Avoid duplicate Answer entries for the same text
      let ans = await prisma.answer.findFirst({ where: { answer: wrong } });
      if (!ans) {
        ans = await prisma.answer.create({ data: { answer: wrong } });
      }
      incorrectAnswers.push(ans);
    }

    // --- Upsert Question ---
    // Ensures the same question text is not added twice
    await prisma.question.upsert({
      where: { question: item.question },
      update: {}, // do nothing if it exists
      create: {
        question: item.question,
        difficultyId: difficulty.id,
        categoryId: category.id,
        typeId: type.id,
        correct_answer_id: correctAnswer.id,
        incorrect_answers: {
          connect: incorrectAnswers.map((ans) => ({ id: ans.id })),
        },
      },
    });
  }

  console.log("Seeding complete!");
}

// --- Utility: string hash for unique category IDs ---
// Generates a numeric ID from the category name
String.prototype.hashCode = function () {
  let hash = 0,
    i,
    chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash);
};

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
