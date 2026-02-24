import Header from "../components/header/Header";
import AnimatedBackground from "../components/AnimatedBackground";
import { FlappyBird } from "../components/flappyBird/FlappyBird";
import { SnakeGame } from "../components/games/SnakeGame";
import { Game2048 } from "../components/games/Game2048";
import { CatchEgg } from "../components/games/CatchEgg";

const GameCard = ({ label, children }) => (
  <div>
    <div className="text-xs text-black/25 dark:text-white/20 mb-2 select-none">{label}</div>
    {children}
  </div>
);

export default function GamesPage() {
  return (
    <>
      <AnimatedBackground />
      <div className="relative container mx-auto max-w-xl px-4 sm:px-5 min-h-screen">
        <Header />
        <section className="mt-10 mb-16">
          <div className="text-xs text-black/30 dark:text-white/25 mb-8 select-none">
            {"// games.exe"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GameCard label="// flappy_bird.exe">
              <FlappyBird bare />
            </GameCard>
            <GameCard label="// snake.exe">
              <SnakeGame />
            </GameCard>
            <GameCard label="// 2048.exe">
              <Game2048 />
            </GameCard>
            <GameCard label="// catch_egg.exe">
              <CatchEgg />
            </GameCard>
          </div>
        </section>
      </div>
    </>
  );
}
