// prisma/seed.js
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // --- 1. Types einfügen ---
  const types = ["multiple", "boolean"];
  await Promise.all(types.map(async t => {
    await prisma.type.upsert({
      where: { type: t },
      update: {},
      create: { type: t }
    });
  }));
  console.log("Types seeded");

  // --- 2. Difficulties einfügen ---
  const difficulties = ["easy", "medium", "hard"];
  await Promise.all(difficulties.map(async d => {
    await prisma.difficulty.upsert({
      where: { level: d },
      update: {},
      create: { level: d }
    });
  }));
  console.log("Difficulties seeded");

  // --- 3. Kategorien von OpenTDB holen ---
  const catRes = await fetch("https://opentdb.com/api_category.php");
  const categories = (await catRes.json()).trivia_categories;

  // wähle eine Kategorie (z. B. General Knowledge)
  const chosenCategory = categories.find(c => c.name === "General Knowledge");
  if (!chosenCategory) throw new Error("Kategorie nicht gefunden!");

  // in DB speichern (oder updaten falls vorhanden)
  const category = await prisma.category.upsert({
    where: { opentdb_id: chosenCategory.id },
    update: {},
    create: {
      name: chosenCategory.name,
      opentdb_id: chosenCategory.id
    }
  });
  console.log(`Category seeded: ${category.name}`);

  // --- 4. Fragen für diese Kategorie holen ---
  const qRes = await fetch(`https://opentdb.com/api.php?amount=10&category=${category.opentdb_id}`);
  const questions = (await qRes.json()).results;

  for (const q of questions) {
    // hole die IDs der Typen + Difficulty aus DB
    const [typeObj, diffObj] = await Promise.all([
      prisma.type.findUnique({ where: { type: q.type } }),
      prisma.difficulty.findUnique({ where: { level: q.difficulty } }),
    ]);

    // erstelle die korrekte Antwort
    const correctAnswer = await prisma.answer.create({
      data: { answer: q.correct_answer }
    });

    // erstelle alle falschen Antworten
    const incorrectAnswers = await Promise.all(q.incorrect_answers.map(a =>
      prisma.answer.create({ data: { answer: a } })
    ));

    // erstelle die Frage
    await prisma.question.create({
      data: {
        question: q.question,
        typeId: typeObj.id,
        difficultyId: diffObj.id,
        categoryId: category.id,
        correct_answer_id: correctAnswer.id,
        incorrect_answers: { connect: incorrectAnswers.map(i => ({ id: i.id })) }
      }
    });
  }

  console.log("Fragen erfolgreich eingefügt!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
