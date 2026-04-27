import { GameProvider } from "@/components/game/GameProvider";
import { ScreenRouter } from "@/components/game/ScreenRouter";

export default function Home() {
  return (
    <GameProvider>
      <ScreenRouter />
    </GameProvider>
  );
}
