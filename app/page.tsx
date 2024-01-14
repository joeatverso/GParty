"use client";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

const sampleQuestions = [
  {
    category: "Golf",
    options: [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
    ],
  },
  {
    category: "Golf",
    options: [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
    ],
  },
  {
    category: "Golf",
    options: [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
    ],
  },
  {
    category: "Golf",
    options: [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
    ],
  },
  {
    category: "Golf",
    options: [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
    ],
  },
];

export default function Home() {
  const grid = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      grid.push(<QuestionCard amount={i + 1} question="" answer="" />);
    }
  }

  return (
    <main className="h-screen w-screen p-24 bg-black">
      <CategoryRow categories={["Category 1", " Category 2", "Category 3", "Category 4", "Category 5"]} />
      <div className="grid grid-cols-5 grid-rows-6 gap-4 w-full h-full">{grid}</div>
    </main>
  );
}

interface CategoryRowProps {
  categories: string[];
}

function CategoryRow({ categories }: CategoryRowProps) {
  return (
    <div className="grid grid-cols-5 gap-4 pb-4">
      {categories.map((category, index) => (
        <Card key={index} className="p-3 px-4 bg-blue-800 border-blue-800 flex items-center justify-around">
          <p className="text-white font-semibold text-lg text-center">{category}</p>
        </Card>
      ))}
    </div>
  );
}

interface QuestionCardProps {
  amount: number;
  question: string;
  answer: string;
}

function QuestionCard({ amount, question, answer }: QuestionCardProps) {
  const [answerOpen, setAnswerOpen] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-blue-800 border-blue-800 flex items-center justify-around cursor-pointer">
          {!answerRevealed && <CardTitle className="text-4xl text-amber-400">${amount * 100}</CardTitle>}
        </Card>
      </DialogTrigger>
      <DialogContent className="bg-blue-900 border-blue-700">
        <div className="p-3">
          <p className="text-2xl text-white font-semibold mb-6">
            In golf, this term refers to completing a hole in one stroke under par.
          </p>
          <Collapsible open={answerOpen} onOpenChange={setAnswerOpen}>
            <CollapsibleContent>
              <p className="text-xl text-amber-400 font-semibold pb-3">What is a birdie?</p>
            </CollapsibleContent>
            <CollapsibleTrigger>
              <Button onClick={() => setAnswerRevealed(true)}>{answerOpen ? "Hide Answer" : "Reveal Answer"}</Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  );
}
