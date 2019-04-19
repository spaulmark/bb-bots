import { Episode, GameState } from "..";
import { MemoryWall } from "../../components/memoryWall";
import { NextEpisodeButton } from "../../components/buttons/nextEpisodeButton";

export class BigBrotherEpisode implements Episode {
  readonly title: string;
  readonly episodeFragments = [];
  readonly render: JSX.Element;
  readonly gameState: GameState;

  public constructor(gameState: GameState) {
    this.title = `Week ${gameState.phase}`;
    // TODO: a next button. also generate the episode fragments.
    // Generating the episode fragments would solve the gamestate problem.
    this.render = (
      <div>
        <MemoryWall houseguests={gameState.houseguests} /> <br />
        <NextEpisodeButton />
      </div>
    );
    this.gameState = new GameState(gameState.houseguests); // wrong
  }
}
