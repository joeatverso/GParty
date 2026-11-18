export type RoundId = "jeopardy" | "double";

export type Screen =
  | "setup"
  | "generating"
  | "intro"
  | "board"
  | "clue"
  | "dailyDouble"
  | "final"
  | "winner";

export type FinalPhase =
  | "category"
  | "wagers"
  | "clue"
  | "answers"
  | "reveal";

export type DailyDoublePhase = "splash" | "wager" | "ready";

export type CluePhase = "reading" | "scoring";

export type Clue = {
  question: string;
  answer: string;
  value: number;
  played: boolean;
  isDailyDouble: boolean;
};

export type Category = {
  name: string;
  clues: Clue[];
};

export type FinalRound = {
  category: string;
  question: string;
  answer: string;
};

export type RoundData = {
  jeopardy: Category[];
  double: Category[];
  final: FinalRound;
};

export type Team = {
  id: string;
  name: string;
  score: number;
};

export type Selection = {
  categoryIdx: number;
  clueIdx: number;
};

export type FinalAnswer = {
  text: string;
  correct: boolean | null;
};

export type GameState = {
  screen: Screen;
  round: RoundId;
  teams: Team[];
  data: RoundData | null;
  selected: Selection | null;
  pendingSelection: Selection | null;
  cluePhase: CluePhase;
  ddPhase: DailyDoublePhase;
  ddWager: number;
  ddTeamId: string | null;
  finalPhase: FinalPhase;
  finalWagers: Record<string, number>;
  finalAnswers: Record<string, FinalAnswer>;
  finalTimer: number;
  finalTimerRunning: boolean;
  clueSeconds: number;
  autoSelectClue: boolean;
  loadingError: string | null;
};

export type RawCategory = {
  name: string;
  clues: { question: string; answer: string; value: number }[];
};

export type RawRoundData = {
  jeopardy: RawCategory[];
  double: RawCategory[];
  final: FinalRound;
};
