import React from "react";
import { Episode, GameState, randomPlayer } from "..";
import { MemoryWall, houseguestToPortrait } from "../../components/memoryWall";
import { NextEpisodeButton } from "../../components/buttons/nextEpisodeButton";
import { EpisodeType, Scene } from "./episodes";
import { BbRandomGenerator } from "../../utils";
import { Houseguest } from "../houseguest";
import _ from "lodash";
import { MutableGameState } from "../gameState";

export const BigBrotherEpisodeType: EpisodeType = {
  canPlayWith: (n: number) => {
    return n > 1;
  },
  eliminates: 1,
  title: "Big Brother Episode"
};

function generateHohCompScene(
  initialGameState: GameState,
  rng: BbRandomGenerator
): [GameState, Scene] {
  const newGameState = new MutableGameState(initialGameState);

  const previousHoh = initialGameState.previousHOH
    ? [initialGameState.previousHOH]
    : [];
  const newHoH: Houseguest = randomPlayer(newGameState, rng, previousHoh);
  newGameState.previousHOH = newHoH;
  newGameState.phase++;
  newHoH.hohWins += 1; // TODO: this isn't okay. We need to clone the players too.

  const scene = {
    title: "HoH Competition",
    gameState: initialGameState,
    render: (
      <div>
        {houseguestToPortrait(newHoH)}
        {newHoH.name} has won Head of Household!
        <br />
        <NextEpisodeButton />
      </div>
    )
  };

  return [new GameState(newGameState), scene];
}

export class BigBrotherEpisode implements Episode {
  readonly title: string;
  readonly scenes: Scene[] = [];
  readonly render: JSX.Element;
  readonly gameState: GameState;
  readonly type = BigBrotherEpisodeType;

  public constructor(initialGameState: GameState, rng: BbRandomGenerator) {
    this.title = `Week ${initialGameState.phase}`;
    this.render = (
      <div>
        {/* TODO: custom title here*/}
        {`Week ${initialGameState.phase}`}
        <MemoryWall houseguests={initialGameState.houseguests} /> <br />
        <NextEpisodeButton />
      </div>
    );

    // TODO: if it's phase 1, run a first impressions algorithm.

    // run the gamestate through the HoH Competition function
    let currentGameState;
    let hohCompScene;

    [currentGameState, hohCompScene] = generateHohCompScene(
      initialGameState,
      rng
    );

    this.scenes.push(hohCompScene);

    // then through the nomination ceremony function
    this.scenes.push({
      title: "Nomination Ceremony",
      gameState: initialGameState,
      render: (
        <div>
          This is the Nomination Ceremony <NextEpisodeButton />
        </div>
      )
    });
    // then to the veto competition
    this.scenes.push({
      title: "Veto Competition",
      gameState: initialGameState,
      render: (
        <div>
          This is the Veto Competition <NextEpisodeButton />
        </div>
      )
    });
    // and then the veto ceremony
    this.scenes.push({
      title: "Veto Ceremony",
      gameState: initialGameState,
      render: (
        <div>
          This is the Veto Ceremony <NextEpisodeButton />
        </div>
      )
    });
    // and then the live eviction.
    this.scenes.push({
      title: "Live Eviction",
      gameState: initialGameState,
      render: (
        <div>
          This is the Live Eviction <NextEpisodeButton />
        </div>
      )
    });
    // after all the logic has been processed, set the gamestate of the episode.
    // also gamestate.phase++
    this.gameState = new GameState(currentGameState);
  }
}
