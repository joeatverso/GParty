"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { useGame } from "./GameProvider";

const ANSWER_SECONDS = 5;

export function ClueScreen() {
  const { state, dispatch, role } = useGame();
  const isViewer = role === "viewer";
  const phase = state.cluePhase;
  const canSkip = phase === "reading" && !isViewer;
  const clueSeconds = state.clueSeconds;
  // Countdown stays device-local; it resets with the clue so host and viewers stay in sync
  const [timer, setTimer] = useState(clueSeconds);
  const [answerTimer, setAnswerTimer] = useState(ANSWER_SECONDS);

  useEffect(() => {
    setTimer(clueSeconds);
    setAnswerTimer(ANSWER_SECONDS);
  }, [state.selected?.categoryIdx, state.selected?.clueIdx, state.round, clueSeconds]);

  useEffect(() => {
    if (phase !== "reading") return;
    if (timer <= 0) {
      dispatch({ type: "CLUE_SHOW_ANSWER" });
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timer, dispatch]);

  useEffect(() => {
    if (phase !== "scoring") return;
    if (answerTimer <= 0) {
      dispatch({ type: "AUTO_ADVANCE" });
      return;
    }
    const id = setTimeout(() => setAnswerTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, answerTimer, dispatch]);

  if (!state.data || !state.selected) return null;
  const cats =
    state.round === "jeopardy" ? state.data.jeopardy : state.data.double;
  const cat = cats[state.selected.categoryIdx];
  const clue = cat?.clues[state.selected.clueIdx];
  if (!cat || !clue) return null;

  const isDailyDouble = clue.isDailyDouble;
  const value = isDailyDouble ? state.ddWager : clue.value;
  const duration = phase === "reading" ? clueSeconds : ANSWER_SECONDS;
  const remaining = phase === "reading" ? timer : answerTimer;
  const progress = Math.max(0, Math.min(1, remaining / duration));

  return (
    <div className="relative flex h-full w-full flex-col bg-black">
      <div
        className={
          "relative flex flex-1 flex-col items-center justify-center px-6 py-8 text-center" +
          (canSkip ? " cursor-pointer" : "")
        }
        onClick={canSkip ? () => dispatch({ type: "CLUE_SHOW_ANSWER" }) : undefined}
        role={canSkip ? "button" : undefined}
        tabIndex={canSkip ? 0 : -1}
        aria-label={canSkip ? "Skip to scoring" : undefined}
        onKeyDown={
          canSkip
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  dispatch({ type: "CLUE_SHOW_ANSWER" });
                }
              }
            : undefined
        }
      >
        <div className="animate-clue-zoom max-w-5xl">
          <p
            className="font-display uppercase text-clue-text"
            style={{
              fontSize:
                phase === "reading"
                  ? "clamp(1.75rem, 5.5vw, 5rem)"
                  : "clamp(1.25rem, 3.5vw, 3rem)",
              lineHeight: 1.3,
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
                className="font-display mt-2 uppercase text-jeopardy-gold-bright"
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

        <div className="pointer-events-none absolute bottom-0 left-0 h-2 w-full bg-black/30">
          <div
            className="h-full bg-jeopardy-gold-bright/50 transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {phase === "scoring" && !isViewer ? (
        <div className="animate-fade-in border-y border-black/40 bg-neutral-800/95 px-3 py-2 sm:px-4">
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
