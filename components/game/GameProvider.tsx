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
import {
  useConvexGameSync,
  useStubGameSync,
  type GameSync,
  type SessionRole,
} from "@/lib/realtime/useGameSync";

type GameContextValue = {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  generate: (
    topics: { jeopardy: string; double: string },
    teams: Team[],
  ) => Promise<void>;
  role: SessionRole | null;
  sessionCode: string | null;
  viewerCount: number;
  sessionError: string | null;
  hasRemoteState: boolean;
  realtimeAvailable: boolean;
  joinSession: (code: string) => Promise<boolean>;
};

const GameContext = createContext<GameContextValue | null>(null);

async function fetchPart<T>(
  part: "jeopardy" | "double" | "final",
  theme: string,
  teams: Team[],
): Promise<T> {
  const res = await fetch("/api/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme, teams: teams.map((t) => t.name), part }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  const json = (await res.json()) as { message: string };
  return JSON.parse(json.message) as T;
}

function GameProviderInner({
  children,
  useSync,
}: {
  children: React.ReactNode;
  useSync: (state: GameState, dispatch: React.Dispatch<Action>) => GameSync;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const sync = useSync(state, dispatch);
  const { role, startHosting } = sync;

  // Viewers are read-only: everything except remote hydration is ignored
  const guardedDispatch = useCallback(
    (action: Action) => {
      if (role === "viewer" && action.type !== "HYDRATE_STATE") return;
      dispatch(action);
    },
    [role],
  );

  const generate = useCallback(
    async (topics: { jeopardy: string; double: string }, teams: Team[]) => {
      // Best-effort session start; solo play continues if realtime is unavailable
      void startHosting();
      dispatch({ type: "SET_TEAMS", teams });
      dispatch({ type: "START_GENERATING" });
      try {
        const [jeopardy, double, final] = await Promise.all([
          fetchPart<Pick<RawRoundData, "jeopardy">>(
            "jeopardy",
            topics.jeopardy,
            teams,
          ),
          fetchPart<Pick<RawRoundData, "double">>("double", topics.double, teams),
          fetchPart<Pick<RawRoundData, "final">>(
            "final",
            `${topics.jeopardy} + ${topics.double}`,
            teams,
          ),
        ]);
        const raw: RawRoundData = {
          jeopardy: jeopardy.jeopardy,
          double: double.double,
          final: final.final,
        };
        const data = buildRoundData(raw);
        dispatch({ type: "LOAD_GAME", data });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate game.";
        dispatch({ type: "SET_ERROR", error: message });
        dispatch({ type: "RESET" });
      }
    },
    [startHosting],
  );

  const {
    sessionCode,
    viewerCount,
    sessionError,
    hasRemoteState,
    realtimeAvailable,
    joinSession,
  } = sync;

  const value = useMemo(
    () => ({
      state,
      dispatch: guardedDispatch,
      generate,
      role,
      sessionCode,
      viewerCount,
      sessionError,
      hasRemoteState,
      realtimeAvailable,
      joinSession,
    }),
    [
      state,
      guardedDispatch,
      generate,
      role,
      sessionCode,
      viewerCount,
      sessionError,
      hasRemoteState,
      realtimeAvailable,
      joinSession,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  return <GameProviderInner useSync={useStubGameSync}>{children}</GameProviderInner>;
}

export function ConnectedGameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GameProviderInner useSync={useConvexGameSync}>{children}</GameProviderInner>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
