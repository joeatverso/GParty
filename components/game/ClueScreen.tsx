"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { useGame } from "./GameProvider";

const READING_SECONDS = 10;

type Phase = "reading" | "scoring";

export function ClueScreen() {
  const { state, dispatch } = useGame();
  const [phase, setPhase] = useState<Phase>("reading");
  const [timer, setTimer] = useState(READING_SECONDS);

  useEffect(() => {
    setPhase("reading");
    setTimer(READING_SECONDS);
  }, [state.selected?.categoryIdx, state.selected?.clueIdx, state.round]);

  useEffect(() => {
    if (phase !== "reading") return;
    if (timer <= 0) {
      setPhase("scoring");
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timer]);

  if (!state.data || !state.selected) return null;
  const cats =
    state.round === "jeopardy" ? state.data.jeopardy : state.data.double;
  const cat = cats[state.selected.categoryIdx];
  const clue = cat?.clues[state.selected.clueIdx];
  if (!cat || !clue) return null;

  const isDailyDouble = clue.isDailyDouble;
  const value = isDailyDouble ? state.ddWager : clue.value;
  const progress = Math.max(0, Math.min(1, timer / READING_SECONDS));

  return (
    <div className="board-gradient relative flex h-full w-full flex-col">
      <div
        className={
          "relative flex flex-1 flex-col items-center justify-center px-6 py-8 text-center" +
          (phase === "reading" ? " cursor-pointer" : "")
        }
        onClick={phase === "reading" ? () => setPhase("scoring") : undefined}
        role={phase === "reading" ? "button" : undefined}
        tabIndex={phase === "reading" ? 0 : -1}
        aria-label={phase === "reading" ? "Skip to scoring" : undefined}
        onKeyDown={
          phase === "reading"
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setPhase("scoring");
                }
              }
            : undefined
        }
      >
        <div className="animate-clue-zoom max-w-5xl">
          <p
            className="font-display uppercase text-clue-text text-clue-shadow"
            style={{
              fontSize:
                phase === "reading"
                  ? "clamp(1.75rem, 5.5vw, 5rem)"
                  : "clamp(1.25rem, 3.5vw, 3rem)",
              lineHeight: 1.05,
            }}
          >
            {clue.question}
          </p>

          {phase === "scoring" ? (
            <div className="animate-fade-in mt-8 sm:mt-10">
              <div className="font-display text-xs uppercase tracking-[0.4em] text-jeopardy-cream/70 sm:text-sm">
                Answer
              </div>
              <p
                className="font-display mt-2 uppercase text-jeopardy-gold-bright text-clue-shadow"
                style={{
                  fontSize: "clamp(2rem, 7vw, 6rem)",
                  lineHeight: 1.05,
                }}
              >
                {clue.answer}
              </p>
            </div>
          ) : null}
        </div>

        {phase === "reading" ? (
          <div className="pointer-events-none absolute bottom-0 left-0 h-2 w-full bg-black/30">
            <div
              className="h-full bg-jeopardy-gold-bright/50 transition-[width] duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        ) : null}
      </div>

      {phase === "scoring" ? (
        <div className="animate-fade-in border-y border-black/40 bg-jeopardy-blue-deep/95 px-3 py-2 sm:px-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="mr-2 font-display text-xs uppercase tracking-widest text-jeopardy-cream/70 sm:text-sm">
              Who got it?
            </span>
            {state.teams.map((team) => {
              const restricted = isDailyDouble && team.id !== state.ddTeamId;
              return (
                <Button
                  key={team.id}
                  variant="success"
                  size="sm"
                  disabled={restricted}
                  onClick={() => {
                    dispatch({
                      type: "MARK_TEAM",
                      teamId: team.id,
                      result: "correct",
                    });
                    dispatch({ type: "AUTO_ADVANCE" });
                  }}
                  aria-label={`Award ${team.name} $${value}`}
                >
                  {team.name}
                  <span className="ml-1 text-xs opacity-90">
                    +${value.toLocaleString()}
                  </span>
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch({ type: "AUTO_ADVANCE" })}
              className="ml-2"
            >
              No winner
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
