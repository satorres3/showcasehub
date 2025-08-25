/**
 * Simple Azure Function endpoint that answers questions from a knowledge base
 * using a basic ML similarity algorithm (Jaccard similarity) to pick the best
 * matching answer.
 */

interface KnowledgeItem {
    question: string;
    answer: string;
}

// Sample in-memory knowledge base. In a real application this would be
// stored in a database or external service.
const knowledgeBase: KnowledgeItem[] = [
    {
        question: 'What is the Hub Nice State app?',
        answer: 'Hub Nice State is a framework-free SPA that hosts multiple AI containers.'
    },
    {
        question: 'How do I reset my password?',
        answer: 'Use the reset link on the login page or contact an administrator.'
    },
    {
        question: 'Where are knowledge files stored?',
        answer: 'Knowledge files are persisted on the backend service for all users.'
    }
];

function jaccardSimilarity(a: string, b: string): number {
    const aWords = new Set(a.toLowerCase().match(/\b\w+\b/g) || []);
    const bWords = new Set(b.toLowerCase().match(/\b\w+\b/g) || []);
    const intersection = Array.from(aWords).filter(w => bWords.has(w)).length;
    const union = new Set([...aWords, ...bWords]).size;
    return union === 0 ? 0 : intersection / union;
}

function findBestAnswer(question: string): string | null {
    const ranked = knowledgeBase
        .map(item => ({ item, score: jaccardSimilarity(question, item.question) }))
        .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    return best && best.score > 0 ? best.item.answer : null;
}

export default async function (context: any, req: any): Promise<void> {
    const q = (req.query?.q || req.body?.question || '').toString();
    if (!q) {
        context.res = { status: 400, body: { error: 'Question is required.' } };
        return;
    }

    const answer = findBestAnswer(q);
    context.res = {
        headers: { 'Content-Type': 'application/json' },
        body: { answer }
    };
}

