"use client";

import { useEffect, useMemo, useState } from "react";

import { useGame } from "./GameProvider";

const STATUS_LINES = [
  "Briefing the host…",
  "Polishing the buzzers…",
  "Hiding the Daily Doubles…",
  "Penciling in categories…",
  "Confiscating contestants' phones…",
  "Setting up the podiums…",
  "Tuning the think music…",
  "Chalking the leaderboard…",
  "Auditioning trivia…",
  "Calibrating the lockout…",
  "Lighting the studio…",
  "Counting to thirty…",
  "Stacking $200 tiles…",
  "Drafting Final Jeopardy…",
  "Quizzing the writers…",
  "Locking in the wagers…",
];

const TILE_VALUES_J = [200, 400, 600, 800, 1000];
const TILE_VALUES_DJ = [400, 800, 1200, 1600, 2000];
const COLS = 6;
const ROWS = 5;
const TOTAL_TILES = COLS * ROWS;

export function Generating() {
  const { state } = useGame();
  const [statusIdx, setStatusIdx] = useState(0);
  const [tilesFilled, setTilesFilled] = useState(0);
  const [round, setRound] = useState<"J" | "DJ">("J");

  const messages = useMemo(() => {
    const shuffled = [...STATUS_LINES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStatusIdx((i) => (i + 1) % messages.length);
    }, 2000);
    return () => window.clearInterval(id);
  }, [messages.length]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTilesFilled((n) => {
        if (n + 1 >= TOTAL_TILES) {
          setRound((r) => (r === "J" ? "DJ" : "J"));
          return 0;
        }
        return n + 1;
      });
    }, 220);
    return () => window.clearInterval(id);
  }, []);

  const values = round === "J" ? TILE_VALUES_J : TILE_VALUES_DJ;
  const teamCount = state.teams.length;

  return (
    <div className="board-gradient relative flex h-full w-full flex-col items-center justify-center gap-6 overflow-hidden px-6 py-8 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-[120vmin] rounded-full bg-jeopardy-gold-bright/10 blur-3xl animate-spotlight"
      />

      <div className="relative animate-fade-in">
        <div className="font-display text-[10px] uppercase tracking-[0.5em] text-jeopardy-cream/70 sm:text-xs">
          Now generating
        </div>
        <h1
          className="font-display mt-1 uppercase text-jeopardy-gold-bright text-clue-shadow"
          style={{ fontSize: "clamp(2.25rem, 7vw, 5.5rem)", lineHeight: 0.95 }}
        >
          Your Game
        </h1>
      </div>

      <div className="relative grid w-full max-w-2xl gap-1.5 sm:gap-2"
           style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
        {Array.from({ length: TOTAL_TILES }).map((_, i) => {
          const filled = i < tilesFilled;
          const row = Math.floor(i / COLS);
          const value = values[row] ?? values[values.length - 1]!;
          return (
            <div
              key={i}
              className={
                filled
                  ? "cell-gradient animate-tile-fill aspect-[4/3] rounded-sm border border-black/60 flex items-center justify-center"
                  : "aspect-[4/3] rounded-sm border border-black/60 bg-jeopardy-blue-darker/70"
              }
            >
              {filled ? (
                <span
                  className="font-display text-jeopardy-gold-bright text-clue-shadow"
                  style={{ fontSize: "clamp(0.7rem, 1.6vw, 1.4rem)" }}
                >
                  ${value}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="relative flex h-7 w-full max-w-md items-center justify-center">
        <span className="font-display text-xs uppercase tracking-[0.35em] text-jeopardy-cream/60">
          Round
        </span>
        <span className="ml-3 font-display text-base uppercase tracking-[0.3em] text-jeopardy-gold-bright">
          {round === "J" ? "Jeopardy!" : "Double Jeopardy!"}
        </span>
      </div>

      <div className="relative h-12 w-full max-w-xl">
        {messages.map((msg, i) => (
          <p
            key={msg}
            aria-hidden={i !== statusIdx}
            className={
              "absolute inset-0 flex items-center justify-center font-display uppercase tracking-[0.25em] text-jeopardy-cream transition-opacity duration-500 " +
              (i === statusIdx ? "opacity-100" : "opacity-0")
            }
            style={{ fontSize: "clamp(0.85rem, 1.8vw, 1.25rem)" }}
          >
            {msg}
          </p>
        ))}
      </div>

      <div className="relative flex h-14 items-end gap-1.5 sm:gap-2" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <span
            key={i}
            className="animate-eq-bar block h-full w-2 rounded-sm bg-jeopardy-gold-bright sm:w-2.5"
            style={{
              animationDelay: `${(i % 4) * 0.12 + (i > 3 ? 0.06 : 0)}s`,
              animationDuration: `${0.7 + (i % 3) * 0.15}s`,
            }}
          />
        ))}
      </div>

      {teamCount > 0 ? (
        <div className="relative flex flex-wrap items-center justify-center gap-2">
          {state.teams.map((t, i) => (
            <span
              key={t.id}
              className="animate-float-up rounded-sm border border-jeopardy-gold/50 bg-jeopardy-blue-deep/60 px-3 py-1 font-display text-xs uppercase tracking-widest text-jeopardy-cream sm:text-sm"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {t.name}
            </span>
          ))}
        </div>
      ) : null}

      <p className="relative max-w-md text-[11px] uppercase tracking-[0.3em] text-jeopardy-cream/50 sm:text-xs">
        Writing 60 clues + Final Jeopardy · 30–90 seconds
      </p>
    </div>
  );
}
