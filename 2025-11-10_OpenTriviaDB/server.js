// server.js
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Serve static files (index.html, etc.) from this directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

app.get('/api/questions', async (req, res) => {
  const category = req.query.category;
  const hardness = req.query.hardness;
  const amount = Number(req.query.amount || 3);

  // Map category/opentdb to categoryId and difficulty to difficultyId as in your Deno logic
  // For example:
  const cat = category && Number(category) !== 0 ? await prisma.category.findUnique({ where: { opentdb_id: Number(category) } }) : undefined;
  const difficulty = hardness ? await prisma.difficulty.findUnique({ where: { level: String(hardness) } }) : undefined;

  const questions = await prisma.question.findMany({
    where: {
      ...(cat ? { categoryId: cat.id } : {}),
      ...(difficulty ? { difficultyId: difficulty.id } : {}),
    },
    include: {
      correct_answer: true,
      incorrect_answers: true,
      category: true,
      difficulty: true,
    },
    take: amount,
  });

  const formatted = questions.map(q => ({
    id: q.id,
    text: q.question,
    correct_answer: q.correct_answer?.answer ?? '',
    answers: [q.correct_answer?.answer, ...q.incorrect_answers.map(a => a.answer)].filter(Boolean),
    category: q.category?.name ?? '',
    difficulty: q.difficulty?.level ?? '',
  }));
  res.json(formatted);
});

app.listen(8000, () => console.log('Server listening on http://localhost:8000'));