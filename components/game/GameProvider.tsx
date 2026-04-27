"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";

import { buildRoundData } from "@/lib/game/daily-double";
import { initialState, reducer, type Action } from "@/lib/game/reducer";
import type { GameState, RawRoundData, Team } from "@/lib/game/types";

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  generate: (theme: string, teams: Team[]) => Promise<void>;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const generate = useCallback(
    async (theme: string, teams: Team[]) => {
      dispatch({ type: "SET_TEAMS", teams });
      dispatch({ type: "START_GENERATING" });
      try {
        const res = await fetch("/api/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, teams: teams.map((t) => t.name) }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Request failed (${res.status})`);
        }
        const json = (await res.json()) as { message: string };
        const raw: RawRoundData = JSON.parse(json.message);
        const data = buildRoundData(raw);
        dispatch({ type: "LOAD_GAME", data });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate game.";
        dispatch({ type: "SET_ERROR", error: message });
        dispatch({ type: "RESET" });
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ state, dispatch, generate }),
    [state, generate],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
