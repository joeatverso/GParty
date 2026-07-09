"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Team } from "@/lib/game/types";

import { useGame } from "./GameProvider";

function makeTeam(name: string): Team {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    name,
    score: 0,
  };
}

export function Setup() {
  const { state, generate } = useGame();
  const [theme, setTheme] = useState("");
  const [teams, setTeams] = useState<Team[]>(() => [
    makeTeam("Team 1"),
    makeTeam("Team 2"),
  ]);

  const canStart =
    theme.trim().length > 1 &&
    teams.length >= 2 &&
    teams.every((t) => t.name.trim().length > 0);

  function updateTeamName(id: string, name: string) {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
  }

  function addTeam() {
    setTeams((prev) =>
      prev.length >= 6 ? prev : [...prev, makeTeam(`Team ${prev.length + 1}`)],
    );
  }

  function removeTeam(id: string) {
    setTeams((prev) => (prev.length <= 2 ? prev : prev.filter((t) => t.id !== id)));
  }

  function start() {
    if (!canStart) return;
    void generate(theme.trim(), teams.map((t) => ({ ...t, name: t.name.trim() })));
  }

  return (
    <div className="board-gradient flex h-full w-full items-center justify-center overflow-y-auto px-4 py-10">
      <div className="w-full max-w-2xl rounded-xl border border-jeopardy-gold/40 bg-jeopardy-blue-darker/80 p-8 shadow-2xl backdrop-blur">
        <h1 className="font-display text-5xl tracking-wider text-jeopardy-gold-bright text-letterpress sm:text-6xl">
          GParty
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.3em] text-jeopardy-cream/80">
          AI-powered Jeopardy
        </p>

        {state.loadingError ? (
          <div className="mt-4 rounded-md border border-red-500/50 bg-red-500/15 px-3 py-2 text-sm text-red-200">
            {state.loadingError}
          </div>
        ) : null}

        <div className="mt-8 space-y-2">
          <label className="font-display text-sm uppercase tracking-widest text-jeopardy-cream">
            Theme or Topic
          </label>
          <Input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder='e.g. "1990s pop culture", "World capitals", "Marvel movies"'
            autoFocus
          />
          <p className="text-xs text-white/50">
            We&apos;ll generate 12 categories (6 per round) plus a Final Jeopardy clue
            around this theme.
          </p>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <label className="font-display text-sm uppercase tracking-widest text-jeopardy-cream">
              Teams
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={addTeam}
              disabled={teams.length >= 6}
            >
              <Plus className="size-4" /> Add team
            </Button>
          </div>
          <ul className="mt-3 space-y-2">
            {teams.map((team, idx) => (
              <li key={team.id} className="flex items-center gap-2">
                <span className="font-display w-8 text-center text-jeopardy-gold-bright">
                  {idx + 1}
                </span>
                <Input
                  value={team.name}
                  onChange={(e) => updateTeamName(team.id, e.target.value)}
                  placeholder={`Team ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeTeam(team.id)}
                  disabled={teams.length <= 2}
                  className="rounded-md p-2 text-white/60 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Remove ${team.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex items-center justify-end gap-3">
          <Button onClick={start} disabled={!canStart} size="lg">
            Generate Game
          </Button>
        </div>
      </div>
    </div>
  );
}
