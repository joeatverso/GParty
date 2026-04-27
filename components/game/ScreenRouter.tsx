"use client";

import { Board } from "./Board";
import { ClueScreen } from "./ClueScreen";
import { DailyDouble } from "./DailyDouble";
import { FinalJeopardy } from "./FinalJeopardy";
import { Generating } from "./Generating";
import { RoundIntro } from "./RoundIntro";
import { Scoreboard } from "./Scoreboard";
import { Setup } from "./Setup";
import { Winner } from "./Winner";
import { useGame } from "./GameProvider";

export function ScreenRouter() {
  const { state } = useGame();

  let screen: React.ReactNode;
  switch (state.screen) {
    case "setup":
      screen = <Setup />;
      break;
    case "generating":
      screen = <Generating />;
      break;
    case "intro":
      screen = <RoundIntro />;
      break;
    case "board":
      screen = <Board />;
      break;
    case "clue":
      screen = <ClueScreen />;
      break;
    case "dailyDouble":
      screen = <DailyDouble />;
      break;
    case "final":
      screen = <FinalJeopardy />;
      break;
    case "winner":
      screen = <Winner />;
      break;
    default:
      screen = null;
  }

  const showScoreboard =
    state.screen !== "setup" &&
    state.screen !== "generating" &&
    state.screen !== "winner" &&
    state.screen !== "clue" &&
    state.teams.length > 0;

  return (
    <div className="flex h-dvh w-screen flex-col bg-jeopardy-blue-darker">
      <div className="relative flex-1 min-h-0">{screen}</div>
      {showScoreboard ? <Scoreboard /> : null}
    </div>
  );
}
