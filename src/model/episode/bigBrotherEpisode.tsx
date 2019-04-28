import React from "react";
import { Episode, GameState } from "..";
import { MemoryWall } from "../../components/memoryWall";
import { NextEpisodeButton } from "../../components/buttons/nextEpisodeButton";
import { EpisodeType, Scene } from "./episodes";

export const BigBrotherEpisodeType: EpisodeType = {
  canPlayWith: (n: number) => {
    return n > 1;
  },
  eliminates: 1,
  title: "Big Brother Episode"
};

export class BigBrotherEpisode implements Episode {
  readonly title: string;
  readonly scenes: Scene[] = [];
  readonly render: JSX.Element;
  readonly gameState: GameState;
  readonly type = BigBrotherEpisodeType;

  public constructor(gameState: GameState, rng: any) {
    this.title = `Week ${gameState.phase}`;
    this.render = (
      <div>
        {/* TODO: custom title here*/}
        {`Week ${gameState.phase}`}
        <MemoryWall houseguests={gameState.houseguests} /> <br />
        <NextEpisodeButton />
      </div>
    );
    // run the gamestate through the HoH Competition function
    this.scenes.push({
      title: "HoH Competition",
      gameState: gameState,
      render: (
        <div>
          This is the HoH Competition <NextEpisodeButton />
        </div>
      )
    });

    // then through the nomination ceremony function
    this.scenes.push({
      title: "Nomination Ceremony",
      gameState: gameState,
      render: (
        <div>
          This is the Nomination Ceremony <NextEpisodeButton />
        </div>
      )
    });
    // then to the veto competition
    this.scenes.push({
      title: "Veto Competition",
      gameState: gameState,
      render: (
        <div>
          This is the Veto Competition <NextEpisodeButton />
        </div>
      )
    });
    // and then the veto ceremony
    this.scenes.push({
      title: "Veto Ceremony",
      gameState: gameState,
      render: (
        <div>
          This is the Veto Ceremony <NextEpisodeButton />
        </div>
      )
    });
    // and then the live eviction.
    this.scenes.push({
      title: "Live Eviction",
      gameState: gameState,
      render: (
        <div>
          This is the Live Eviction <NextEpisodeButton />
        </div>
      )
    });
    // TODO: after all the logic has been processed, set the gamestate of the episode.
    this.gameState = new GameState(gameState.houseguests);
  }
}
