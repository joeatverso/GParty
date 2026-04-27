"use client";

import { cn } from "@/lib/utils";

import { useGame } from "./GameProvider";

export function Scoreboard() {
  const { state } = useGame();
  const controllingTeamId = state.screen === "dailyDouble" ? state.ddTeamId : null;

  return (
    <div className="border-t-2 border-jeopardy-gold/60 bg-gradient-to-b from-jeopardy-blue-deep to-jeopardy-blue-darker px-2 py-2 sm:px-4">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${state.teams.length}, minmax(0, 1fr))`,
        }}
      >
        {state.teams.map((team) => {
          const isControlling = team.id === controllingTeamId;
          return (
            <div
              key={team.id}
              className={cn(
                "flex flex-col items-center justify-center rounded-md border-2 px-2 py-2 text-center",
                "bg-gradient-to-b from-jeopardy-blue to-jeopardy-blue-deep",
                isControlling
                  ? "border-jeopardy-gold-bright animate-pulse-border"
                  : "border-jeopardy-gold/40",
              )}
            >
              <div className="font-display text-sm uppercase tracking-wider text-clue-text sm:text-base md:text-lg">
                {team.name}
              </div>
              <div
                className={cn(
                  "font-display text-letterpress",
                  team.score < 0 ? "text-red-400" : "text-jeopardy-gold-bright",
                )}
                style={{ fontSize: "clamp(1.25rem, 3vw, 2.25rem)" }}
              >
                ${team.score.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
