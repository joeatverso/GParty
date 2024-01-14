import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY!,
});

const prompt = `
Your task is to generate 5 sets of Jeapardy questions and answers based on the categories the user provides.

There should be 5 question and answer pairs for each of the 5 categories that the user provides. Just like the game of Jeapardy, the questions should get progressively harder within each category. The first question in each category should be the easiest and each question should get progressively more challenging with the last question being the most challenging.

You must only include questions that have a very specific factual answer.

You will be penalized if you mention the answer within the question.

You will be tipped $500k for a better answer.

Do not include any explanations, only provide a RFC8259 compliant JSON response  following this format without deviation:
{
  "categories": [
    { 
      "category": <the category provided by the user>, 
      "options": [
        { "question": <question 1>, "answer": <answer to question 1> },
        { "question": <question 2>, "answer": <answer to question 2> },
        { "question": <question 3>, "answer": <answer to question 3> },
        { "question": <question 4>, "answer": <answer to question 4> },
        { "question": <question 5>, "answer": <answer to question 5> }
      ]
    },
    ...
  ]
}
The JSON response:
`;

export async function POST(req: NextRequest) {
  const { categories } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: JSON.stringify(categories),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.9,
  });

  const {
    choices: [{ message }],
  } = response;

  return NextResponse.json({ message: message.content });
}

export const maxDuration = 120;
