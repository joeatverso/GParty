"use client";

import { cn } from "@/lib/utils";

import { useGame } from "./GameProvider";

export function Scoreboard() {
  const { state } = useGame();
  const controllingTeamId = state.screen === "dailyDouble" ? state.ddTeamId : null;
  const topScore = Math.max(...state.teams.map((t) => t.score));
  // Only crown a leader when someone is actually ahead
  const hasLeader =
    state.teams.length > 1 &&
    state.teams.filter((t) => t.score === topScore).length === 1;

  return (
    <div className="border-t border-white/10 bg-neutral-900 px-2 py-2 sm:px-4">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${state.teams.length}, minmax(0, 1fr))`,
        }}
      >
        {state.teams.map((team) => {
          const isControlling = team.id === controllingTeamId;
          const isLeader = hasLeader && team.score === topScore;
          return (
            <div
              key={team.id}
              className={cn(
                "relative flex flex-col items-center justify-center overflow-hidden rounded-lg border px-2 py-2 text-center transition-colors",
                "bg-gradient-to-b from-neutral-900 to-neutral-950",
                isControlling
                  ? "border-emerald-500 animate-pulse-border"
                  : isLeader
                    ? "border-emerald-500/60"
                    : "border-white/10",
              )}
            >
              {isLeader ? (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
              ) : null}
              <div className="font-display text-sm uppercase tracking-wider text-white/70 sm:text-base md:text-lg">
                {team.name}
              </div>
              <div
                className={cn(
                  "font-display tabular-nums",
                  team.score < 0
                    ? "text-red-400"
                    : isLeader
                      ? "text-emerald-400"
                      : "text-white",
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
