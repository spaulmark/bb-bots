import React from "react";
import { Episode, GameState, randomPlayer } from "..";
import { MemoryWall } from "../../components/memoryWall";
import { NextEpisodeButton } from "../../components/buttons/nextEpisodeButton";
import { EpisodeType, Scene } from "./episodes";
import { BbRandomGenerator } from "../../utils";
import { Houseguest } from "../houseguest";
import _ from "lodash";
import { MutableGameState, nonEvictedHouseguests, getById } from "../gameState";
import { Portraits, Portrait } from "../../components/playerPortrait/portraits";

export const BigBrotherEpisodeType: EpisodeType = {
  canPlayWith: (n: number) => {
    return n > 1;
  },
  eliminates: 1,
  title: "Big Brother Episode"
};

// TODO: Refactoring ideas
/**
 * Might also be nice to have a global rng object that resets with the cast in a behaviorsubject
 *
 */

function generateHohCompScene(
  initialGameState: GameState,
  rng: BbRandomGenerator
): [GameState, Scene, Houseguest] {
  const newGameState = new MutableGameState(initialGameState);

  const previousHoh = initialGameState.previousHOH
    ? [initialGameState.previousHOH]
    : [];
  const newHoH: Houseguest = randomPlayer(
    newGameState.houseguests,
    rng,
    previousHoh
  );
  newGameState.previousHOH = newHoH;
  newGameState.phase++;
  newHoH.hohWins += 1;

  const scene = {
    title: "HoH Competition",
    gameState: initialGameState,
    render: (
      <div>
        {previousHoh.length > 0 &&
          `Houseguests, it's time to find a new Head of Household. As outgoing HoH, ${
            previousHoh[0].name
          } will not compete. `}
        <Portrait houseguest={newHoH} />
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

  const nom1 = randomPlayer(newGameState.houseguests, rng, [HoH]);
  const nom2 = randomPlayer(newGameState.houseguests, rng, [HoH, nom1]);
  nom1.nominations++;
  nom2.nominations++;

  const scene = {
    title: "Nomination Ceremony",
    gameState: newGameState,
    render: (
      <div>
        <Portrait houseguest={HoH} />
        <br />
        This is the nomination ceremony. It is my responsibility as the Head of
        Household to nominate two people for eviction.
        <br />
        <b>
          My first nominee is...
          <br />
          <Portrait houseguest={nom1} />
          <br />
          My second nominee is...
          <br />
          <Portrait houseguest={nom2} />
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

function generateVetoCompScene(
  initialGameState: GameState,
  rng: BbRandomGenerator,
  HoH: Houseguest,
  nom1: Houseguest,
  nom2: Houseguest
): [GameState, Scene, Houseguest] {
  const newGameState = new MutableGameState(initialGameState);

  // pick players
  const choices = nonEvictedHouseguests(newGameState);
  let povPlayers: Houseguest[] = [];
  const everyoneWillPlay = choices.length <= 6;

  if (everyoneWillPlay) {
    povPlayers.push({ ...HoH });
    povPlayers.push({ ...nom1 });
    povPlayers.push({ ...nom2 });
    while (povPlayers.length < choices.length) {
      povPlayers.push({ ...randomPlayer(choices, rng, povPlayers) });
    }
  } else {
    // TODO: houseguests choice picks
    povPlayers.push({ ...HoH });
    povPlayers.push({ ...nom1 });
    povPlayers.push({ ...nom2 });
    povPlayers.push({ ...randomPlayer(choices, rng, povPlayers) });
    povPlayers.push({ ...randomPlayer(choices, rng, povPlayers) });
    povPlayers.push({ ...randomPlayer(choices, rng, povPlayers) });
  }
  let povWinner = randomPlayer(povPlayers, rng);
  povWinner = getById(newGameState, povWinner.id);
  povWinner.povWins++;

  let introText: string;
  if (everyoneWillPlay) {
    introText = "Everyone left in the house will compete in this challenge.";
  } else {
    introText = `${HoH.name}, as Head of Household, and ${nom1.name} and ${
      nom2.name
    } as nominees, will compete, as well as 3 others chosen by random draw.`;
  }

  const extras = [povPlayers[3]];
  povPlayers[4] && extras.push(povPlayers[4]);
  povPlayers[5] && extras.push(povPlayers[5]);

  const scene = {
    title: "Veto Competition",
    gameState: initialGameState,
    render: (
      <div>
        It's time to pick players for the veto competition.
        <br />
        <Portraits houseguests={[HoH, nom1, nom2]} />
        <br />
        {introText}
        <br />
        <Portraits houseguests={extras} />
        ...
        <Portraits houseguests={[povWinner]} />
        {`${povWinner.name} has won the Golden Power of Veto!`}
        <br />
        <NextEpisodeButton />
      </div>
    )
  };

  return [new GameState(newGameState), scene, povWinner];
}

function generateVetoCeremonyScene(
  initialGameState: GameState,
  rng: BbRandomGenerator,
  HoH: Houseguest,
  initialNominees: Houseguest[],
  povWinner: Houseguest
): [Scene, Houseguest[]] {
  let povTarget: Houseguest | null = null;
  let descisionText = "I have decided... ";
  if (
    povWinner.id == initialNominees[0].id ||
    povWinner.id == initialNominees[1].id
  ) {
    povTarget = povWinner;
    descisionText += "...to use the power of veto on myself.";
  } else {
    const save = rng.randomInt(0, 7);
    if (save < 2 && nonEvictedHouseguests(initialGameState).length !== 4) {
      povTarget = initialNominees[save];
      descisionText += `...to use the power of veto on ${
        initialNominees[save].name
      }.`;
    } else {
      descisionText += "... not to use the power of veto.";
    }
  }

  let replacementSpeech = "";
  let nameAReplacement = "";
  let finalNominees = initialNominees;
  if (povTarget) {
    finalNominees = initialNominees.filter(hg => hg.id != povTarget!.id);
    nameAReplacement += ` ${
      HoH.name
    }, since I have just vetoed one of your nominations, you must name a replacement nominee.`;
    const replacementNom = {
      ...randomPlayer(initialGameState.houseguests, rng, [
        HoH,
        initialNominees[0],
        initialNominees[1],
        povWinner
      ])
    };
    replacementNom.nominations++;
    finalNominees.push(replacementNom);
    getById(initialGameState, replacementNom.id).nominations++;
    replacementSpeech = `My replacement nominee is ${replacementNom.name}.`;
  }

  const scene = {
    title: "Veto Ceremony",
    gameState: initialGameState,
    render: (
      <div>
        <Portrait houseguest={povWinner} />
        This is the Veto Ceremony.
        <br />
        {`${initialNominees[0].name} and ${
          initialNominees[1].name
        } have been nominated for eviction. But I have the power to veto one of these nominations.`}
        <br />
        <Portraits houseguests={initialNominees} />
        <br />
        <b>{descisionText} </b>
        <br />
        {nameAReplacement}
        <br />
        {replacementSpeech && <Portrait houseguest={HoH} />}
        <b>{replacementSpeech}</b>
        <Portraits houseguests={finalNominees} />
        <NextEpisodeButton />
      </div>
    )
  };
  return [scene, finalNominees];
}

function generateEvictionScene(
  initialGameState: GameState,
  rng: BbRandomGenerator,
  HoH: Houseguest,
  nominees: Houseguest[]
): [GameState, Scene] {
  // randomly evict someone lol
  const evictee = nominees[rng.randomInt(0, 1)];
  // evictee.isEvicted = true;
  getById(initialGameState, evictee.id).isEvicted = true;
  const scene = {
    title: "Live Eviction",
    gameState: initialGameState,
    render: (
      <div>
        By a random vote...
        <br />
        <Portraits
          houseguests={[
            getById(initialGameState, nominees[0].id),
            getById(initialGameState, nominees[1].id)
          ]}
        />
        <br />
        {`${evictee.name}... you have been evicted from the Big Brother House.`}
        <NextEpisodeButton />
      </div>
    )
  };
  return [initialGameState, scene];
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

    let vetoCompScene;
    let povWinner: Houseguest;
    [currentGameState, vetoCompScene, povWinner] = generateVetoCompScene(
      currentGameState,
      rng,
      hoh,
      nominees[0],
      nominees[1]
    );
    this.scenes.push(vetoCompScene);
    // and then the veto ceremony
    let vetoCeremonyScene;

    [vetoCeremonyScene, nominees] = generateVetoCeremonyScene(
      currentGameState,
      rng,
      hoh,
      nominees,
      povWinner
    );
    this.scenes.push(vetoCeremonyScene);

    // and then the live eviction.
    let evictionScene;
    [currentGameState, evictionScene] = generateEvictionScene(
      currentGameState,
      rng,
      hoh,
      nominees
    );
    this.scenes.push(evictionScene);
    // after all the logic has been processed, set the gamestate of the episode.
    // also gamestate.phase++
    this.gameState = new GameState(currentGameState);
  }
}
