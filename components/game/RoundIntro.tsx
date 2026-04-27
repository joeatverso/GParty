"use client";

import { Button } from "@/components/ui/Button";

import { useGame } from "./GameProvider";

export function RoundIntro() {
  const { state, dispatch } = useGame();
  const isJeopardy = state.round === "jeopardy";

  return (
    <div className="board-gradient flex h-full w-full flex-col items-center justify-center gap-12 px-6 text-center">
      <div className="animate-clue-zoom">
        <div className="font-display text-2xl uppercase tracking-[0.4em] text-jeopardy-gold-bright">
          {isJeopardy ? "Welcome to" : "Now Entering"}
        </div>
        <h1
          className="font-display mt-3 uppercase text-jeopardy-cream text-clue-shadow"
          style={{ fontSize: "clamp(3rem, 12vw, 10rem)", lineHeight: 0.95 }}
        >
          {isJeopardy ? "Jeopardy!" : "Double Jeopardy!"}
        </h1>
        <p className="mt-4 font-display text-lg uppercase tracking-widest text-clue-text/80">
          {isJeopardy
            ? "6 categories, 5 clues each, 1 Daily Double hidden"
            : "Values doubled, 2 Daily Doubles in play"}
        </p>
      </div>

      <Button size="lg" onClick={() => dispatch({ type: "BEGIN_ROUND" })}>
        Start the round
      </Button>
    </div>
  );
}
