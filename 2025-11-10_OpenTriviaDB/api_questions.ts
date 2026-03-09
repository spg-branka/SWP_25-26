// api_questions.ts
import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { PrismaClient, Prisma } from "./generated/prisma/client.ts";
import type { Question, Answer } from "./generated/prisma/client.ts";

const prisma = new PrismaClient();

function parseIntOrDefault(val: string | null | undefined, def: number) {
    const n = parseInt(val ?? "");
    return isNaN(n) ? def : n;
}

serve(async (req: Request) => {
    const url = new URL(req.url);
    if (url.pathname !== "/api/questions") {
        return new Response("Not found", { status: 404 });
    }

    // Get query params
    const categoryParam = url.searchParams.get("category");
    const hardnessParam = url.searchParams.get("hardness");
    const amountParam = url.searchParams.get("amount");

    // Map category value (opentdb_id) to Category.id
    let categoryId: string | undefined = undefined;
    if (categoryParam && categoryParam !== "0") {
        const cat = await prisma.category.findUnique({ where: { opentdb_id: parseInt(categoryParam) } });
        if (cat) categoryId = cat.id;
    }

    // Map hardness value to Difficulty.id
    let difficultyId: string | undefined = undefined;
    if (hardnessParam) {
        const diff = await prisma.difficulty.findUnique({ where: { level: hardnessParam } });
        if (diff) difficultyId = diff.id;
    }

    const amount = parseIntOrDefault(amountParam, 3);

    // Build Prisma query
    const where: Prisma.QuestionWhereInput = {};
    if (categoryId) {
        where.categoryId = categoryId;
    }
    if (difficultyId) {
        where.difficultyId = difficultyId;
    }

    try {
        const questions = await prisma.question.findMany({
            where,
            take: amount,
            include: {
                correct_answer: true,
                incorrect_answers: true,
                category: true,
                difficulty: true,
            },
        });

        // Format for frontend
        const formatted = questions.map((q: Question) => ({
            id: q.id,
            text: q.question,
            correct_answer: q.correct_answer?.answer ?? "",
            answers: [q.correct_answer?.answer, ...q.incorrect_answers.map((a: Answer) => a.answer)].filter(Boolean),
            category: q.category?.name ?? "",
            difficulty: q.difficulty?.level ?? "",
        }));

        return new Response(JSON.stringify(formatted), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
