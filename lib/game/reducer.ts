import type {
  GameState,
  RoundData,
  RoundId,
  Selection,
  Team,
} from "./types";

export type Action =
  | { type: "SET_TEAMS"; teams: Team[] }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "START_GENERATING" }
  | { type: "LOAD_GAME"; data: RoundData }
  | { type: "BEGIN_ROUND" }
  | { type: "SELECT_CLUE"; selection: Selection }
  | { type: "CLOSE_CLUE" }
  | { type: "AUTO_ADVANCE" }
  | { type: "MARK_TEAM"; teamId: string; result: "correct" | "incorrect" }
  | { type: "ADJUST_SCORE"; teamId: string; delta: number }
  | { type: "DD_PICK_TEAM"; teamId: string }
  | { type: "DD_SET_WAGER"; amount: number }
  | { type: "DD_REVEAL" }
  | { type: "ADVANCE_TO_DOUBLE" }
  | { type: "ADVANCE_TO_FINAL" }
  | { type: "FINAL_REVEAL_CATEGORY" }
  | { type: "FINAL_SET_WAGER"; teamId: string; amount: number }
  | { type: "FINAL_BEGIN_CLUE" }
  | { type: "FINAL_BEGIN_ANSWERS" }
  | { type: "FINAL_SET_ANSWER"; teamId: string; text: string }
  | {
      type: "FINAL_MARK_ANSWER";
      teamId: string;
      correct: boolean;
    }
  | { type: "FINAL_REVEAL" }
  | { type: "END_GAME" }
  | { type: "RESET" };

export const initialState: GameState = {
  screen: "setup",
  round: "jeopardy",
  teams: [],
  data: null,
  selected: null,
  pendingSelection: null,
  ddPhase: "splash",
  ddWager: 0,
  ddTeamId: null,
  finalPhase: "category",
  finalWagers: {},
  finalAnswers: {},
  loadingError: null,
};

function unplayedSelections(state: GameState): Selection[] {
  const cats = currentRoundCategories(state);
  const out: Selection[] = [];
  cats.forEach((cat, ci) => {
    cat.clues.forEach((clue, qi) => {
      if (!clue.played) out.push({ categoryIdx: ci, clueIdx: qi });
    });
  });
  return out;
}

function pickRandomUnplayed(state: GameState): Selection | null {
  const remaining = unplayedSelections(state);
  if (remaining.length === 0) return null;
  const idx = Math.floor(Math.random() * remaining.length);
  return remaining[idx]!;
}

function currentRoundCategories(state: GameState) {
  if (!state.data) return [];
  return state.round === "jeopardy" ? state.data.jeopardy : state.data.double;
}

function getSelectedClue(state: GameState) {
  if (!state.selected || !state.data) return null;
  const cats = currentRoundCategories(state);
  return cats[state.selected.categoryIdx]?.clues[state.selected.clueIdx] ?? null;
}

function markSelectedPlayed(state: GameState): GameState {
  if (!state.selected || !state.data) return state;
  const { categoryIdx, clueIdx } = state.selected;

  const updateCats = (cats: typeof state.data.jeopardy) =>
    cats.map((cat, ci) =>
      ci !== categoryIdx
        ? cat
        : {
            ...cat,
            clues: cat.clues.map((clue, qi) =>
              qi !== clueIdx ? clue : { ...clue, played: true },
            ),
          },
    );

  const data: RoundData = {
    ...state.data,
    jeopardy:
      state.round === "jeopardy"
        ? updateCats(state.data.jeopardy)
        : state.data.jeopardy,
    double:
      state.round === "double"
        ? updateCats(state.data.double)
        : state.data.double,
  };

  return { ...state, data };
}

function allCluesPlayed(state: GameState): boolean {
  return currentRoundCategories(state).every((cat) =>
    cat.clues.every((clue) => clue.played),
  );
}

function adjustScore(teams: Team[], teamId: string, delta: number): Team[] {
  return teams.map((t) =>
    t.id === teamId ? { ...t, score: t.score + delta } : t,
  );
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SET_TEAMS":
      return { ...state, teams: action.teams };

    case "SET_ERROR":
      return { ...state, loadingError: action.error };

    case "START_GENERATING":
      return { ...state, screen: "generating", loadingError: null };

    case "LOAD_GAME":
      return {
        ...state,
        data: action.data,
        screen: "intro",
        round: "jeopardy",
        loadingError: null,
      };

    case "BEGIN_ROUND":
      return { ...state, screen: "board" };

    case "SELECT_CLUE": {
      const cats = currentRoundCategories(state);
      const clue =
        cats[action.selection.categoryIdx]?.clues[action.selection.clueIdx];
      if (!clue || clue.played) return state;
      if (clue.isDailyDouble) {
        return {
          ...state,
          selected: action.selection,
          pendingSelection: null,
          screen: "dailyDouble",
          ddPhase: "splash",
          ddTeamId: null,
          ddWager: 0,
        };
      }
      return {
        ...state,
        selected: action.selection,
        pendingSelection: null,
        screen: "clue",
      };
    }

    case "DD_PICK_TEAM":
      return { ...state, ddTeamId: action.teamId, ddPhase: "wager" };

    case "DD_SET_WAGER": {
      const team = state.teams.find((t) => t.id === state.ddTeamId);
      if (!team) return state;
      const minWager = state.round === "jeopardy" ? 5 : 5;
      const maxBaseline = state.round === "jeopardy" ? 1000 : 2000;
      const cap = Math.max(team.score, maxBaseline);
      const amount = Math.max(minWager, Math.min(action.amount, cap));
      return { ...state, ddWager: amount, ddPhase: "ready" };
    }

    case "DD_REVEAL":
      return { ...state, screen: "clue" };

    case "MARK_TEAM": {
      const clue = getSelectedClue(state);
      if (!clue) return state;
      const isDD = clue.isDailyDouble;
      if (isDD && action.teamId !== state.ddTeamId) return state;
      const value = isDD ? state.ddWager : clue.value;
      const delta = action.result === "correct" ? value : -value;
      return { ...state, teams: adjustScore(state.teams, action.teamId, delta) };
    }

    case "ADJUST_SCORE":
      return {
        ...state,
        teams: adjustScore(state.teams, action.teamId, action.delta),
      };

    case "CLOSE_CLUE": {
      const next = markSelectedPlayed(state);
      const finished = allCluesPlayed(next);
      if (!finished) {
        return {
          ...next,
          screen: "board",
          selected: null,
          pendingSelection: null,
          ddTeamId: null,
          ddWager: 0,
          ddPhase: "splash",
        };
      }
      if (state.round === "jeopardy") {
        return {
          ...next,
          screen: "intro",
          round: "double",
          selected: null,
          pendingSelection: null,
          ddTeamId: null,
          ddWager: 0,
          ddPhase: "splash",
        };
      }
      return {
        ...next,
        screen: "final",
        finalPhase: "category",
        selected: null,
        pendingSelection: null,
        ddTeamId: null,
        ddWager: 0,
        ddPhase: "splash",
      };
    }

    case "AUTO_ADVANCE": {
      const next = markSelectedPlayed(state);
      const finished = allCluesPlayed(next);
      if (finished) {
        if (state.round === "jeopardy") {
          return {
            ...next,
            screen: "intro",
            round: "double",
            selected: null,
            pendingSelection: null,
            ddTeamId: null,
            ddWager: 0,
            ddPhase: "splash",
          };
        }
        return {
          ...next,
          screen: "final",
          finalPhase: "category",
          selected: null,
          pendingSelection: null,
          ddTeamId: null,
          ddWager: 0,
          ddPhase: "splash",
        };
      }
      const upcoming = pickRandomUnplayed(next);
      return {
        ...next,
        screen: "board",
        selected: null,
        pendingSelection: upcoming,
        ddTeamId: null,
        ddWager: 0,
        ddPhase: "splash",
      };
    }

    case "ADVANCE_TO_DOUBLE":
      return { ...state, round: "double", screen: "intro" };

    case "ADVANCE_TO_FINAL":
      return {
        ...state,
        screen: "final",
        finalPhase: "category",
        finalWagers: {},
        finalAnswers: {},
      };

    case "FINAL_REVEAL_CATEGORY":
      return { ...state, finalPhase: "wagers" };

    case "FINAL_SET_WAGER": {
      const team = state.teams.find((t) => t.id === action.teamId);
      if (!team) return state;
      const cap = Math.max(team.score, 0);
      const amount = Math.max(0, Math.min(action.amount, cap));
      return {
        ...state,
        finalWagers: { ...state.finalWagers, [action.teamId]: amount },
      };
    }

    case "FINAL_BEGIN_CLUE":
      return { ...state, finalPhase: "clue" };

    case "FINAL_BEGIN_ANSWERS":
      return { ...state, finalPhase: "answers" };

    case "FINAL_SET_ANSWER": {
      const prev = state.finalAnswers[action.teamId] ?? {
        text: "",
        correct: null,
      };
      return {
        ...state,
        finalAnswers: {
          ...state.finalAnswers,
          [action.teamId]: { ...prev, text: action.text },
        },
      };
    }

    case "FINAL_MARK_ANSWER": {
      const prev = state.finalAnswers[action.teamId] ?? {
        text: "",
        correct: null,
      };
      return {
        ...state,
        finalAnswers: {
          ...state.finalAnswers,
          [action.teamId]: { ...prev, correct: action.correct },
        },
      };
    }

    case "FINAL_REVEAL": {
      const teams = state.teams.map((t) => {
        const wager = state.finalWagers[t.id] ?? 0;
        const answer = state.finalAnswers[t.id];
        if (!answer || answer.correct === null) return t;
        const delta = answer.correct ? wager : -wager;
        return { ...t, score: t.score + delta };
      });
      return { ...state, teams, finalPhase: "reveal" };
    }

    case "END_GAME":
      return { ...state, screen: "winner" };

    case "RESET":
      return {
        ...initialState,
        teams: state.teams.map((t) => ({ ...t, score: 0 })),
        loadingError: state.loadingError,
      };

    default:
      return state;
  }
}

export function isRoundComplete(state: GameState, round: RoundId): boolean {
  if (!state.data) return false;
  const cats = round === "jeopardy" ? state.data.jeopardy : state.data.double;
  return cats.every((cat) => cat.clues.every((clue) => clue.played));
}
