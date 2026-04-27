import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPEN_AI_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OpenAI API key is not configured. Set OPEN_AI_API_KEY in your environment.",
    );
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

const systemPrompt = `You write Jeopardy! game data as RFC 8259 compliant JSON. The user gives you a THEME and a list of TEAM NAMES. You generate:

1. A "Jeopardy" round: 6 categories, each with 5 clues (values 200, 400, 600, 800, 1000), in increasing difficulty.
2. A "Double Jeopardy" round: 6 different categories, each with 5 clues (values 400, 800, 1200, 1600, 2000), in increasing difficulty.
3. A single "Final Jeopardy" clue: one category, one challenging clue, one factual answer.

RULES:
- All clues must have a single specific factual answer. No matters of opinion.
- Categories must relate to the user's THEME but be diverse.
- The 12 round-category names must all be unique.
- (Real Jeopardy: the host reads the "answer" and contestants supply the "question". Internally we store them as { question, answer } where "question" is the prompt the host reads aloud and "answer" is the correct response.)
- The "question" text MUST NOT contain the "answer", any part of the answer, or any content word that appears in the answer. Specifically:
  - Do not include the full answer string in the question.
  - Do not include any individual word from the answer in the question (case-insensitive, ignoring punctuation), except for common English stop words: a, an, the, of, in, on, at, and, or, to, for, with, by, from, is, are, was, were, be, this, that, these, those, it, its.
  - Do not include obvious word-stems or close variants of answer content words (e.g. if the answer is "Painters", do not use "paint", "painting", or "painted" in the question).
  - Do not include translations or alternate-language forms of answer content words.
  - Rephrase the clue using synonyms, definitions, descriptions, or context clues so a contestant must infer the answer rather than read it back.
- Final Jeopardy should be hard but fair, and follows the same no-overlap rule above.
- Output ONLY valid JSON in this exact shape, no commentary, no markdown fences:

{
  "jeopardy": [
    { "name": "<category>", "clues": [
      { "question": "<200-tier clue>", "answer": "<answer>", "value": 200 },
      { "question": "<400-tier clue>", "answer": "<answer>", "value": 400 },
      { "question": "<600-tier clue>", "answer": "<answer>", "value": 600 },
      { "question": "<800-tier clue>", "answer": "<answer>", "value": 800 },
      { "question": "<1000-tier clue>", "answer": "<answer>", "value": 1000 }
    ] }
    // ...exactly 6 categories
  ],
  "double": [
    { "name": "<category>", "clues": [
      { "question": "<400-tier clue>", "answer": "<answer>", "value": 400 },
      { "question": "<800-tier clue>", "answer": "<answer>", "value": 800 },
      { "question": "<1200-tier clue>", "answer": "<answer>", "value": 1200 },
      { "question": "<1600-tier clue>", "answer": "<answer>", "value": 1600 },
      { "question": "<2000-tier clue>", "answer": "<answer>", "value": 2000 }
    ] }
    // ...exactly 6 categories
  ],
  "final": {
    "category": "<category>",
    "question": "<single hard clue>",
    "answer": "<single factual answer>"
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const { theme, teams } = (await req.json()) as {
      theme?: string;
      teams?: string[];
    };

    if (!theme || typeof theme !== "string") {
      return NextResponse.json(
        { error: "Missing required field: theme" },
        { status: 400 },
      );
    }

    const userPayload = JSON.stringify({
      theme,
      teams: Array.isArray(teams) ? teams : [],
    });

    const response = await getClient().chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPayload },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? null;
    if (!content) {
      return NextResponse.json(
        { error: "Model returned an empty response." },
        { status: 502 },
      );
    }

    return NextResponse.json({ message: content });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const maxDuration = 120;
