// import { PrismaClient } from "./generated/prisma/client.ts";

// const prisma = new PrismaClient();

// function decodeHtmlEntities(text: string) {
//   const map: Record<string, string> = {
//     "&quot;": '"',
//     "&#039;": "'",
//     "&amp;": "&",
//     "&lt;": "<",
//     "&gt;": ">",
//   };
//   return text.replace(/(&quot;|&#039;|&amp;|&lt;|&gt;)/g, (m) => map[m]);
// }

// async function getSessionToken(): Promise<string> {
//   const tokenRes = await fetch(
//     "https://opentdb.com/api_token.php?command=request"
//   );
//   const tokenData = await tokenRes.json();
//   if (!tokenData.token) {
//     throw new Error("Failed to get session token from Open Trivia DB.");
//   }
//   console.log("Obtained session token:", tokenData.token);
//   return tokenData.token;
// }

// async function main() {
//   const token = await getSessionToken();

//   console.log("Fetching questions from Open Trivia DB...");
//   const response = await fetch(
//     `https://opentdb.com/api.php?amount=50&token=${token}`
//   );
//   const data = await response.json();

//   console.log("API response:", data);

//   if (data.response_code !== 0) {
//     console.error("API returned an error:", data.response_code, data);
//     return;
//   }

//   for (const q of data.results) {
//     const decodedQuestion = decodeHtmlEntities(q.question);

//     // Upsert Type
//     const type = await prisma.type.upsert({
//       where: { type: q.type },
//       update: {},
//       create: { type: q.type },
//     });

//     // Upsert Difficulty
//     const difficulty = await prisma.difficulty.upsert({
//       where: { level: q.difficulty },
//       update: {},
//       create: { level: q.difficulty },
//     });

//     // Upsert Category
//     const category = await prisma.category.upsert({
//       where: { name: q.category },
//       update: {},
//       create: {
//         name: q.category,
//         opentdb_id: Math.floor(Math.random() * 1000),
//       },
//     });

//     // Create Correct Answer
//     const correctAnswer = await prisma.answer.create({
//       data: { answer: decodeHtmlEntities(q.correct_answer) },
//     });

//     // Create Incorrect Answers
//     const incorrectAnswersConnections = [];
//     for (const ans of q.incorrect_answers) {
//       const incorrect = await prisma.answer.create({
//         data: { answer: decodeHtmlEntities(ans) },
//       });
//       incorrectAnswersConnections.push({ id: incorrect.id });
//     }

//     // Create Question — skip if already exists
//     try {
//       const questionRecord = await prisma.question.create({
//         data: {
//           question: decodedQuestion,
//           typeId: type.id,
//           difficultyId: difficulty.id,
//           categoryId: category.id,
//           correct_answer_id: correctAnswer.id,
//           incorrect_answers: { connect: incorrectAnswersConnections },
//         },
//       });
//       console.log("Question inserted:", decodedQuestion, "ID:", questionRecord.id);
//     } catch (err) {
//       console.warn("Skipped duplicate question:", decodedQuestion);
//     }

//     console.log("--------------------------------------------------");
//   }

//   console.log("All questions processed!");
// }

// main()
//   .catch((e) => console.error(e))
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

import { PrismaClient } from "./generated/prisma/client.ts";

const prisma = new PrismaClient();

// Helper function to decode HTML entities from Open Trivia DB
function decodeHtmlEntities(text: string) {
  const map: Record<string, string> = {
    "&quot;": '"',
    "&#039;": "'",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
  };
  return text.replace(/(&quot;|&#039;|&amp;|&lt;|&gt;)/g, (m) => map[m]);
}

// Helper to request a session token
async function getSessionToken(): Promise<string> {
  const tokenRes = await fetch(
    "https://opentdb.com/api_token.php?command=request"
  );
  const tokenData = await tokenRes.json();
  if (!tokenData.token) {
    throw new Error("Failed to get session token from Open Trivia DB.");
  }
  console.log("Obtained session token:", tokenData.token);
  return tokenData.token;
}

async function main() {
  const token = await getSessionToken();

  console.log("Fetching questions from Open Trivia DB...");
  const response = await fetch(
    `https://opentdb.com/api.php?amount=50&token=${token}`
  );
  const data = await response.json();

  console.log("API response:", data);

  if (data.response_code !== 0) {
    console.error("API returned an error:", data.response_code, data);
    return;
  }

  // Insert into database with detailed console logs
  for (const q of data.results) {
    const decodedQuestion = decodeHtmlEntities(q.question);

    const type = await prisma.type.upsert({
      where: { type: q.type },
      update: {},
      create: { type: q.type },
    });
    console.log("Type inserted/upserted:", type.type, "ID:", type.id);

    const difficulty = await prisma.difficulty.upsert({
      where: { level: q.difficulty },
      update: {},
      create: { level: q.difficulty },
    });
    console.log("Difficulty inserted/upserted:", difficulty.level, "ID:", difficulty.id);

    const category = await prisma.category.upsert({
      where: { name: q.category },
      update: {},
      create: {
        name: q.category,
        opentdb_id: Math.floor(Math.random() * 1000),
      },
    });
    console.log("Category inserted/upserted:", category.name, "ID:", category.id);

    const correctAnswer = await prisma.answer.create({
      data: { answer: decodeHtmlEntities(q.correct_answer) },
    });
    console.log("Correct answer inserted:", correctAnswer.answer, "ID:", correctAnswer.id);

    const incorrectAnswers = [];
    for (const ans of q.incorrect_answers) {
      const incorrect = await prisma.answer.create({
        data: { answer: decodeHtmlEntities(ans) },
      });
      incorrectAnswers.push({ id: incorrect.id });
      console.log("Incorrect answer inserted:", incorrect.answer, "ID:", incorrect.id);
    }

    // Create Question — skip if duplicate
    try {
      const questionRecord = await prisma.question.create({
        data: {
          question: decodedQuestion,
          typeId: type.id,
          difficultyId: difficulty.id,
          categoryId: category.id,
          correct_answer_id: correctAnswer.id,
          incorrect_answers: {
            connect: incorrectAnswers,
          },
        },
      });
      console.log("Question inserted:", decodeHtmlEntities(questionRecord.question), "ID:", questionRecord.id);
    } catch (err) {
      console.warn("Question already exists, skipping:", decodedQuestion);
    }

    console.log("--------------------------------------------------");
  }

  console.log("All questions have been inserted!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
