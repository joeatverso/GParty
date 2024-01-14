"use client";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { useState } from "react";

export default function Home() {
  const [questions, setQuestions] = useState<any>(null);
  const [teams, setTeams] = useState<string[]>(["", ""]);
  const [teamPoints, setTeamPoints] = useState<number[]>([]);
  const [categories, setCategories] = useState<string[]>(["", "", "", "", ""]);

  const [loadingQuestions, setLoadingQuestions] = useState(false);

  async function getQuestions(categories: string[]) {
    const path = "/api/openai";
    const payload = { categories: categories };

    setTeamPoints([...teams.map(() => 0)]);
    setLoadingQuestions(true);
    await fetch(path, {
      body: JSON.stringify(payload),
      method: "POST",
    }).then(async (res) => {
      const response = await res.json();
      setQuestions(JSON.parse(response?.message).categories);
      // setQuestions(res.json());
      setLoadingQuestions(false);
    });
  }

  function addPoints(index: number, amount: number) {
    let teamsPointsCopy = [...teamPoints];
    teamsPointsCopy[index] = teamsPointsCopy[index] + amount;
    setTeamPoints(teamsPointsCopy);
  }

  function CategoryForm() {
    const setCategory = (index: number, value: string) => {
      let categoriesCopy = [...categories];
      categoriesCopy[index] = value;
      setCategories(categoriesCopy);
    };

    const setTeam = (index: number, value: string) => {
      let teamsCopy = [...teams];
      teamsCopy[index] = value;
      setTeams(teamsCopy);
    };

    const addTeam = () => {
      let teamsCopy = [...teams];
      teamsCopy.push("");
      setTeams(teamsCopy);
    };

    const removeTeam = (index: number) => {
      let teamsCopy = [...teams];
      teamsCopy.splice(index, 1);
      setTeams(teamsCopy);
    };

    const isButtonDisabled = categories.some((category) => category === "");

    return (
      <Card className="p-10 w-2/3 rounded-2xl">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl mb-2 font-semibold">Categories</h1>
          <Input placeholder="Category 1" defaultValue={categories[0]} onBlur={(event) => setCategory(0, event.target.value)} />
          <Input placeholder="Category 2" defaultValue={categories[1]} onBlur={(event) => setCategory(1, event.target.value)} />
          <Input placeholder="Category 3" defaultValue={categories[2]} onBlur={(event) => setCategory(2, event.target.value)} />
          <Input placeholder="Category 4" defaultValue={categories[3]} onBlur={(event) => setCategory(3, event.target.value)} />
          <Input placeholder="Category 5" defaultValue={categories[4]} onBlur={(event) => setCategory(4, event.target.value)} />
        </div>
        <div className="flex flex-col space-y-2 mt-5">
          <h1 className="text-2xl mb-2 font-semibold">Teams</h1>
          {teams.map((team, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                placeholder={team || "Team " + (index + 1)}
                defaultValue={team}
                onBlur={(event) => setTeam(index, event.target.value)}
              />
              <Button onClick={() => removeTeam(index)} variant="destructive">
                Remove
              </Button>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-3">
          <Button disabled={loadingQuestions} onClick={() => addTeam()}>
            Add Team
          </Button>
          <Button disabled={isButtonDisabled || loadingQuestions} onClick={() => getQuestions(categories)}>
            {loadingQuestions ? "Generating Questions..." : "Generate Questions"}
          </Button>
        </div>
      </Card>
    );
  }

  const grid = [];
  if (questions) {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        grid.push(
          <QuestionCard
            teams={teams}
            addPoints={addPoints}
            amount={i + 1}
            question={questions[j]?.options[i]?.question}
            answer={questions[j]?.options[i]?.answer}
          />
        );
      }
    }
  }

  return (
    <main className="h-screen w-screen p-24 bg-slate-100">
      {!!questions ? (
        <>
          <CategoryRow options={questions} />
          <div className="grid grid-cols-5 grid-rows-6 gap-4 w-full h-full">
            {grid}
            <div className="flex space-x-4 pt-5">
              {teams.map((team, index) => (
                <div key={index} className="flex space-x-1">
                  <p key={index} className="text-xl">
                    {team}:
                  </p>
                  <p key={index} className={`text-xl ${teamPoints[index] >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {teamPoints[index] < 0 && "-"}${Math.abs(teamPoints[index])}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-around h-full">
          <CategoryForm />
        </div>
      )}
    </main>
  );
}

interface QuestionCardProps {
  amount: number;
  question: string;
  answer: string;
  teams: string[];
  addPoints: (index: number, amount: number) => void;
}

function QuestionCard({ amount, question, answer, teams, addPoints }: QuestionCardProps) {
  const [answerOpen, setAnswerOpen] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-teal-800 border-teal-800 flex items-center justify-around cursor-pointer">
          {!answerRevealed && <CardTitle className="text-4xl text-white">${amount * 100}</CardTitle>}
        </Card>
      </DialogTrigger>
      <DialogContent className="bg-teal-800 border-teal-800">
        <div className="p-3 px-4">
          <p className="text-lg text-teal-200 font-semibold mb-6">For ${amount * 100}</p>
          <p className="text-2xl text-white font-semibold mb-6">{question}</p>
          <Collapsible open={answerOpen} onOpenChange={setAnswerOpen}>
            <CollapsibleContent className="w-full">
              <div>
                <p className="text-xl text-amber-400 font-semibold pb-3">{answer}</p>
                <div className="flex space-x-2 mb-2">
                  {teams.map((team, index) => (
                    <DialogClose key={index}>
                      <Button
                        onClick={() => {
                          addPoints(index, amount * 100);
                        }}
                      >
                        {team} + ${amount * 100}
                      </Button>
                    </DialogClose>
                  ))}
                </div>
                <div className="flex space-x-2 mb-4">
                  {teams.map((team, index) => (
                    <DialogClose key={index}>
                      <Button
                        onClick={() => {
                          addPoints(index, amount * -100);
                        }}
                      >
                        {team} - ${amount * 100}
                      </Button>
                    </DialogClose>
                  ))}
                </div>
              </div>
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

interface CategoryRowProps {
  options: any[];
}

function CategoryRow({ options }: CategoryRowProps) {
  return (
    <div className="grid grid-cols-5 gap-4 pb-4">
      {options?.map((option, index) => (
        <Card key={index} className="p-3 px-4 bg-teal-800 border-teal-800 flex items-center justify-around">
          <p className="text-white font-semibold text-lg text-center">{option?.category}</p>
        </Card>
      ))}
    </div>
  );
}
