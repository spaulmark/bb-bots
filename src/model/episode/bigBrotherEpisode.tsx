import React from "react";
import { Episode, GameState, randomPlayer } from "..";
import {
  MemoryWall,
  houseguestToPortrait,
  HouseguestPortrait
} from "../../components/memoryWall";
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
): [GameState, Scene, Houseguest] {
  const newGameState = new MutableGameState(initialGameState);

  const previousHoh = initialGameState.previousHOH
    ? [initialGameState.previousHOH]
    : [];
  const newHoH: Houseguest = randomPlayer(newGameState, rng, previousHoh);
  newGameState.previousHOH = newHoH;
  newGameState.phase++;
  newHoH.hohWins += 1;

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

  return [new GameState(newGameState), scene, newHoH];
}

function generateNomCeremonyScene(
  initialGameState: GameState,
  rng: BbRandomGenerator,
  HoH: Houseguest
): [GameState, Scene, Houseguest[]] {
  const newGameState = new MutableGameState(initialGameState);

  const nom1 = randomPlayer(newGameState, rng, [HoH]);
  const nom2 = randomPlayer(newGameState, rng, [HoH, nom1]);
  nom1.nominations++;
  nom2.nominations++;

  const scene = {
    title: "Nomination Ceremony",
    gameState: newGameState,
    render: (
      <div>
        {houseguestToPortrait(HoH)}
        <br />
        This is the nomination ceremony. It is my responsibility as the Head of
        Household to nominate two people for eviction.
        <br />
        <b>
          My first nominee is...
          <br />
          {houseguestToPortrait(nom1)}
          <br />
          My second nominee is...
          <br />
          {houseguestToPortrait(nom2)}
          {`I have nominated you, ${nom1.name} and you, ${
            nom2.name
          } for eviction.`}
          <br />
        </b>
        <NextEpisodeButton />
      </div>
    )
  };
  return [new GameState(newGameState), scene, [nom1, nom2]];
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

    let currentGameState;
    let hohCompScene;
    let hoh: Houseguest;

    [currentGameState, hohCompScene, hoh] = generateHohCompScene(
      initialGameState,
      rng
    );
    this.scenes.push(hohCompScene);

    let nomCeremonyScene;
    let nominees: Houseguest[];
    [currentGameState, nomCeremonyScene, nominees] = generateNomCeremonyScene(
      currentGameState,
      rng,
      hoh
    );
    this.scenes.push(nomCeremonyScene);

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
