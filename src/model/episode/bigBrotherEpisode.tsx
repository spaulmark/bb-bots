import React from "react";
import { Episode, GameState, randomPlayer } from "..";
import { MemoryWall } from "../../components/memoryWall";
import { NextEpisodeButton } from "../../components/buttons/nextEpisodeButton";
import { EpisodeType, Scene } from "./episodes";
import { rng } from "../../utils";
import { Houseguest } from "../houseguest";
import _ from "lodash";
import { MutableGameState, getById, nonEvictedHouseguests } from "../gameState";
import { Portraits, Portrait } from "../../components/playerPortrait/portraits";
import { getJuryCount, getFinalists } from "../season";
import { castEvictionVote } from "../../utils/aiUtils";

export const BigBrotherVanilla: EpisodeType = {
  canPlayWith: (n: number) => {
    return n > 1;
  },
  eliminates: 1
};

// TODO: Refactoring ideas
/**
 * Might be best to start passing ids instead of houseguests for HoH/nominees/veto winner
 */

function generateHohCompScene(
  initialGameState: GameState
): [GameState, Scene, Houseguest] {
  const newGameState = new MutableGameState(initialGameState);

  const previousHoh = initialGameState.previousHOH
    ? [initialGameState.previousHOH]
    : [];
  const newHoH: Houseguest = randomPlayer(
    newGameState.houseguests,
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
  HoH: Houseguest
): [GameState, Scene, Houseguest[]] {
  const newGameState = new MutableGameState(initialGameState);

  const nom1 = randomPlayer(newGameState.houseguests, [HoH]);
  const nom2 = randomPlayer(newGameState.houseguests, [HoH, nom1]);
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
        Household to nominate two houseguests for eviction.
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
      povPlayers.push({ ...randomPlayer(choices, povPlayers) });
    }
  } else {
    // TODO: houseguests choice picks
    povPlayers.push({ ...HoH });
    povPlayers.push({ ...nom1 });
    povPlayers.push({ ...nom2 });
    povPlayers.push({ ...randomPlayer(choices, povPlayers) });
    povPlayers.push({ ...randomPlayer(choices, povPlayers) });
    povPlayers.push({ ...randomPlayer(choices, povPlayers) });
  }
  let povWinner = randomPlayer(povPlayers);
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
  HoH: Houseguest,
  initialNominees: Houseguest[],
  povWinner: Houseguest
): [Scene, Houseguest[]] {
  let povTarget: Houseguest | null = null;
  let descisionText = "";
  initialNominees[0] = getById(initialGameState, initialNominees[0].id);
  initialNominees[1] = getById(initialGameState, initialNominees[1].id);
  HoH = getById(initialGameState, HoH.id);

  if (
    povWinner.id == initialNominees[0].id ||
    povWinner.id == initialNominees[1].id
  ) {
    povTarget = povWinner;
    descisionText += "...to use the power of veto on myself.";
  } else {
    const save = rng().randomInt(0, 7);
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
      ...randomPlayer(initialGameState.houseguests, [
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
        This is the Veto Ceremony.
        <br />
        {`${initialNominees[0].name} and ${
          initialNominees[1].name
        } have been nominated for eviction.`}
        <Portraits houseguests={initialNominees} />
        But I have the power to veto one of these nominations.
        <br />
        <b>
          I have decided...
          <Portrait houseguest={povWinner} />
          {descisionText}
        </b>
        {nameAReplacement}
        {replacementSpeech && <Portrait houseguest={HoH} />}
        <b>{replacementSpeech}</b>
        <Portraits houseguests={finalNominees} />
        <NextEpisodeButton />
      </div>
    )
  };
  return [scene, finalNominees];
}

export function evictHouseguest(gameState: MutableGameState, id: number) {
  const houseguest = getById(gameState, id);
  houseguest.isEvicted = true;
  if (gameState.remainingPlayers - getFinalists() <= getJuryCount()) {
    houseguest.isJury = true;
  }
  gameState.remainingPlayers--;
}

function generateEvictionScene(
  initialGameState: GameState,
  HoH: Houseguest,
  nominees: Houseguest[]
): [GameState, Scene] {
  const newGameState = new MutableGameState(initialGameState);

  const votes: Array<Houseguest[]> = [[], []];
  nonEvictedHouseguests(newGameState).forEach(hg => {
    if (
      hg.id !== nominees[0].id &&
      hg.id !== nominees[1].id &&
      hg.id !== HoH.id
    ) {
      votes[castEvictionVote(hg, nominees)].push(hg);
    }
  });
  const votesFor0 = votes[0].length;
  const votesFor1 = votes[1].length;

  let tieVote = votesFor0 === votesFor1;
  let tieBreaker: number = 0;
  if (tieVote) {
    tieBreaker = castEvictionVote(HoH, nominees);
  }
  let evictee: Houseguest;
  if (votesFor0 > votesFor1) {
    evictee = nominees[0];
  } else if (votesFor1 > votesFor0) {
    evictee = nominees[1];
  } else {
    evictee = nominees[tieBreaker];
  }
  evictHouseguest(newGameState, evictee.id);

  const moreVotes = votesFor0 > votesFor1 ? votesFor0 : votesFor1;
  const lessVotes = moreVotes === votesFor1 ? votesFor0 : votesFor1;

  const isUnanimous = votesFor0 === 0 || votesFor1 === 0;
  const voteCountText = isUnanimous
    ? "By a unanimous vote..."
    : `By a vote of ${moreVotes} to ${lessVotes}...`;

  const scene = {
    title: "Live Eviction",
    gameState: initialGameState,
    render: (
      <div>
        <p style={{ textAlign: "center" }}>
          <b>{voteCountText} </b>
        </p>
        <div className="columns is-centered">
          <div className="column box">
            <Portraits houseguests={votes[0]} centered={true} />
          </div>
          <div className="column box">
            <Portraits houseguests={votes[1]} centered={true} />
          </div>
        </div>
        {tieVote && (
          <div>
            <p style={{ textAlign: "center" }}>
              <b> We have a tie.</b> <br />
              {`${
                HoH.name
              }, as current Head of Household, you must cast the sole vote to evict.`}
            </p>
            <Portraits houseguests={[HoH]} centered={true} />
            <p style={{ textAlign: "center" }}>
              <b>I vote to evict {`${evictee.name}.`}</b>
            </p>
          </div>
        )}

        <Portraits
          houseguests={[
            getById(newGameState, nominees[0].id),
            getById(newGameState, nominees[1].id)
          ]}
          centered={true}
        />
        <p style={{ textAlign: "center" }}>
          <b>
            {`${
              evictee.name
            }... you have been evicted from the Big Brother House.`}
          </b>
        </p>
        <NextEpisodeButton />
      </div>
    )
  };
  return [newGameState, scene];
}

export class BigBrotherVanillaEpisode implements Episode {
  readonly title: string;
  readonly scenes: Scene[] = [];
  readonly render: JSX.Element;
  readonly gameState: GameState;
  readonly type = BigBrotherVanilla;

  public constructor(initialGameState: GameState) {
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
      initialGameState
    );
    this.scenes.push(hohCompScene);

    let nomCeremonyScene;
    let nominees: Houseguest[];
    [currentGameState, nomCeremonyScene, nominees] = generateNomCeremonyScene(
      currentGameState,
      hoh
    );
    this.scenes.push(nomCeremonyScene);

    let vetoCompScene;
    let povWinner: Houseguest;
    [currentGameState, vetoCompScene, povWinner] = generateVetoCompScene(
      currentGameState,
      hoh,
      nominees[0],
      nominees[1]
    );
    this.scenes.push(vetoCompScene);
    let vetoCeremonyScene;

    [vetoCeremonyScene, nominees] = generateVetoCeremonyScene(
      currentGameState,
      hoh,
      nominees,
      povWinner
    );
    this.scenes.push(vetoCeremonyScene);

    let evictionScene;
    [currentGameState, evictionScene] = generateEvictionScene(
      currentGameState,
      hoh,
      nominees
    );
    this.scenes.push(evictionScene);
    // after all the logic has been processed, set the gamestate of the episode.
    // also gamestate.phase++
    this.gameState = new GameState(currentGameState);
  }
}
