"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Team } from "@/lib/game/types";

import { useGame } from "./GameProvider";
import { GraphPaperBackground } from "./GraphPaperBackground";

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
  const { state, generate, realtimeAvailable, sessionError, joinSession } =
    useGame();
  const [jeopardyTopic, setJeopardyTopic] = useState("");
  const [doubleTopic, setDoubleTopic] = useState("");
  const [teams, setTeams] = useState<Team[]>(() => [
    makeTeam("Team 1"),
    makeTeam("Team 2"),
  ]);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const canStart =
    jeopardyTopic.trim().length > 1 &&
    doubleTopic.trim().length > 1 &&
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

  async function suggestTopics() {
    if (suggesting) return;
    setSuggesting(true);
    setSuggestError(null);
    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part: "suggest",
          avoid: [jeopardyTopic.trim(), doubleTopic.trim()].filter(Boolean),
        }),
      });
      const data = (await res.json()) as {
        jeopardy?: string;
        double?: string;
        error?: string;
      };
      if (!res.ok || !data.jeopardy || !data.double) {
        setSuggestError(data.error ?? "Could not suggest topics. Try again.");
        return;
      }
      setJeopardyTopic(data.jeopardy);
      setDoubleTopic(data.double);
    } catch {
      setSuggestError("Could not suggest topics. Try again.");
    } finally {
      setSuggesting(false);
    }
  }

  function start() {
    if (!canStart) return;
    void generate(
      { jeopardy: jeopardyTopic.trim(), double: doubleTopic.trim() },
      teams.map((t) => ({ ...t, name: t.name.trim() })),
    );
  }

  async function join(e: React.FormEvent) {
    e.preventDefault();
    if (joinCode.length !== 4 || joining) return;
    setJoining(true);
    await joinSession(joinCode);
    setJoining(false);
  }

  return (
    <div className="graph-paper relative h-full w-full">
      <GraphPaperBackground />
      <div className="absolute inset-0 flex items-center justify-center overflow-y-auto px-4 py-10">
      <div className="w-full max-w-2xl rounded-none border border-jeopardy-gold/40 bg-jeopardy-blue-darker/80 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-5xl tracking-wider text-jeopardy-gold-bright sm:text-6xl">
            GParty
          </h1>
          <p className="text-right text-sm uppercase tracking-[0.3em] text-jeopardy-cream/80">
            AI-powered Jeopardy
          </p>
        </div>

        {state.loadingError ? (
          <div className="mt-4 rounded-md border border-red-500/50 bg-red-500/15 px-3 py-2 text-sm text-red-200">
            {state.loadingError}
          </div>
        ) : null}

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <label className="font-display text-sm uppercase tracking-widest text-jeopardy-cream">
              Topics
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void suggestTopics()}
              disabled={suggesting}
            >
              <Sparkles className="size-4" />
              {suggesting ? "Suggesting..." : "Suggest topics"}
            </Button>
          </div>
        <div className="mt-3 space-y-4">
          <div className="space-y-2">
            <label className="font-display text-xs uppercase tracking-widest text-jeopardy-cream/70">
              Round 1 (Jeopardy!)
            </label>
            <Input
              value={jeopardyTopic}
              onChange={(e) => setJeopardyTopic(e.target.value)}
              placeholder='e.g. "1990s pop culture"'
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="font-display text-xs uppercase tracking-widest text-jeopardy-cream/70">
              Round 2 (Double Jeopardy!)
            </label>
            <Input
              value={doubleTopic}
              onChange={(e) => setDoubleTopic(e.target.value)}
              placeholder='e.g. "World capitals"'
            />
          </div>
          <p className="text-xs text-white/50">
            6 categories per round from each topic, plus a Final Jeopardy clue
            blending both.
          </p>
          {suggestError ? (
            <p className="text-sm text-red-300">{suggestError}</p>
          ) : null}
        </div>
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

        {realtimeAvailable ? (
          <div className="mt-10 border-t border-white/10 pt-6">
            <label className="font-display text-sm uppercase tracking-widest text-jeopardy-cream">
              Join a game
            </label>
            <p className="mt-1 text-xs text-white/50">
              Enter the 4-digit code from the host to watch their game on this
              device.
            </p>
            <form className="mt-3 flex items-center gap-2" onSubmit={join}>
              <Input
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                inputMode="numeric"
                placeholder="0000"
                className="w-28 text-center font-display text-xl tracking-[0.4em]"
                aria-label="Session code"
              />
              <Button type="submit" disabled={joinCode.length !== 4 || joining}>
                {joining ? "Joining..." : "Join"}
              </Button>
            </form>
            {sessionError ? (
              <p className="mt-2 text-sm text-red-300">{sessionError}</p>
            ) : null}
          </div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
