"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { useGame } from "./GameProvider";

export function DailyDouble() {
  const { state, dispatch } = useGame();
  const [wagerInput, setWagerInput] = useState<string>("");

  useEffect(() => {
    setWagerInput("");
  }, [state.ddTeamId]);

  const team = state.teams.find((t) => t.id === state.ddTeamId) ?? null;
  const minWager = 5;
  const baselineCap = state.round === "jeopardy" ? 1000 : 2000;
  const cap = team ? Math.max(team.score, baselineCap) : baselineCap;

  return (
    <div className="board-gradient relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
      {state.ddPhase === "splash" ? (
        <div className="animate-clue-zoom">
          <div className="font-display text-2xl uppercase tracking-[0.4em] text-jeopardy-cream">
            It&apos;s a
          </div>
          <h1
            className="font-display mt-2 uppercase text-jeopardy-gold-bright text-clue-shadow"
            style={{ fontSize: "clamp(3rem, 13vw, 11rem)", lineHeight: 0.9 }}
          >
            Daily Double!
          </h1>
          <p className="mt-6 font-display text-base uppercase tracking-widest text-clue-text/80">
            Pick the team that found it
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {state.teams.map((t) => (
              <Button
                key={t.id}
                size="lg"
                onClick={() => dispatch({ type: "DD_PICK_TEAM", teamId: t.id })}
              >
                {t.name}
                <span className="ml-2 text-sm font-normal opacity-80">
                  ${t.score.toLocaleString()}
                </span>
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {state.ddPhase === "wager" && team ? (
        <div className="w-full max-w-xl animate-fade-in">
          <div className="font-display text-xl uppercase tracking-[0.3em] text-jeopardy-cream">
            {team.name}&apos;s wager
          </div>
          <div className="mt-3 font-display text-jeopardy-gold-bright text-clue-shadow"
               style={{ fontSize: "clamp(2.5rem, 9vw, 6rem)", lineHeight: 1 }}>
            ${team.score.toLocaleString()}
          </div>
          <p className="mt-2 text-sm uppercase tracking-widest text-clue-text/70">
            Min ${minWager} · Max ${cap.toLocaleString()}
          </p>
          <form
            className="mt-6 flex items-center justify-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const num = Number.parseInt(wagerInput, 10);
              if (Number.isNaN(num)) return;
              dispatch({ type: "DD_SET_WAGER", amount: num });
            }}
          >
            <span className="font-display text-3xl text-jeopardy-gold-bright">
              $
            </span>
            <Input
              autoFocus
              type="number"
              inputMode="numeric"
              min={minWager}
              max={cap}
              value={wagerInput}
              onChange={(e) => setWagerInput(e.target.value)}
              className="w-40 text-center font-display text-2xl"
              placeholder="0"
            />
            <Button type="submit" disabled={!wagerInput}>
              Lock it in
            </Button>
          </form>
        </div>
      ) : null}

      {state.ddPhase === "ready" && team ? (
        <div className="animate-fade-in text-center">
          <div className="font-display text-xl uppercase tracking-[0.3em] text-jeopardy-cream">
            {team.name} wagers
          </div>
          <div
            className="font-display mt-2 text-jeopardy-gold-bright text-clue-shadow"
            style={{ fontSize: "clamp(3rem, 12vw, 9rem)", lineHeight: 0.95 }}
          >
            ${state.ddWager.toLocaleString()}
          </div>
          <div className="mt-8">
            <Button size="lg" onClick={() => dispatch({ type: "DD_REVEAL" })}>
              Reveal the clue
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
