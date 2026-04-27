"use client";

import { Crown } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { useGame } from "./GameProvider";

export function Winner() {
  const { state, dispatch } = useGame();
  const sorted = [...state.teams].sort((a, b) => b.score - a.score);
  const champion = sorted[0];
  const tied =
    sorted.length > 1 && sorted[1] && sorted[1].score === champion?.score;

  return (
    <div className="board-gradient flex h-full w-full flex-col items-center justify-center px-6 py-10 text-center">
      <div className="animate-clue-zoom max-w-3xl">
        <Crown className="mx-auto size-16 text-jeopardy-gold-bright" />
        <h1
          className="font-display mt-3 uppercase text-jeopardy-gold-bright text-clue-shadow"
          style={{ fontSize: "clamp(2.5rem, 9vw, 7rem)", lineHeight: 0.95 }}
        >
          {tied ? "It's a tie!" : `${champion?.name} wins!`}
        </h1>
        <p className="mt-2 font-display text-lg uppercase tracking-widest text-clue-text/80">
          Final score{" "}
          <span className="text-jeopardy-gold-bright">
            ${champion?.score.toLocaleString()}
          </span>
        </p>

        <ol className="mt-10 space-y-2 text-left">
          {sorted.map((t, idx) => (
            <li
              key={t.id}
              className={cn(
                "flex items-center justify-between rounded-md border px-4 py-3",
                idx === 0
                  ? "border-jeopardy-gold-bright bg-jeopardy-gold/15"
                  : "border-white/15 bg-jeopardy-blue-darker/70",
              )}
            >
              <span className="font-display text-xl uppercase tracking-wider text-clue-text">
                {idx + 1}. {t.name}
              </span>
              <span
                className={cn(
                  "font-display text-2xl",
                  t.score < 0 ? "text-red-400" : "text-jeopardy-gold-bright",
                )}
              >
                ${t.score.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex items-center justify-center gap-3">
          <Button size="lg" onClick={() => dispatch({ type: "RESET" })}>
            New game
          </Button>
        </div>
      </div>
    </div>
  );
}
