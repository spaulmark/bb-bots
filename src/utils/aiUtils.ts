import {
  Houseguest,
  nonEvictedHouseguests,
  GameState,
  getJurors,
  inJury,
  calculatePopularity
} from "../model";
import { rng } from ".";
import {
  getFinalists,
  getJuryCount as finalJurySize,
  getJuryCount
} from "../model/season";
import { threadId } from "worker_threads";

const relationship = (hero: Houseguest, villain: Houseguest) =>
  hero.relationships[villain.id];

function leastFavouriteId(hero: Houseguest, options: Houseguest[]) {
  // Return the ID of the houseguest that hero has the worst relationship with.
  return options[lowestScore(hero, options, relationship)].id;
}

function favouriteIndex(hero: Houseguest, options: Houseguest[]) {
  // Return the index of the houseguest that hero has the worst relationship with.
  return highestScore(hero, options, relationship);
}

function highestScore(
  hero: Houseguest,
  options: Houseguest[],
  callback: (hero: Houseguest, villain: Houseguest) => number
) {
  let highestIndex = 0;
  let highestScore = -Infinity;
  options.forEach((villain, i) => {
    const currentScore = callback(hero, villain);
    if (currentScore > highestScore) {
      highestIndex = i;
      highestScore = currentScore;
    }
  });
  return highestIndex;
}
function lowestScore(
  hero: Houseguest,
  options: Houseguest[],
  callback: (hero: Houseguest, villain: Houseguest) => number
) {
  let lowestIndex = 0;
  let lowestScore = Infinity;
  options.forEach((villain, i) => {
    const currentScore = callback(hero, villain);
    if (currentScore < lowestScore) {
      lowestIndex = i;
      lowestScore = currentScore;
    }
  });
  return lowestIndex;
}

function juryEquity(hero: Houseguest, gameState: GameState): number {
  const jurors = getJurors(gameState);
  const juryWeight = jurors.length / getJuryCount();
  const houseWeight = (getJuryCount() - jurors.length) / getJuryCount();
  // TODO: linear weighting please - strength of relationship doesn't really matter on jury anymore, now does it?
  const juryScore = calculatePopularity(hero, jurors);
  const houseScore = hero.popularity;
  return juryScore * juryWeight + houseScore * houseWeight;
}

function threatScore(
  hero: Houseguest,
  villain: Houseguest,
  gameState: GameState
): number {
  // return the index of the biggest threat to my game out of the options.
  const remaining = gameState.remainingPlayers - getFinalists();
  const juryThreatWeight = inJury(gameState)
    ? getJurors(gameState).length + 1 / finalJurySize()
    : 0;
  const jEquity = juryEquity(villain, gameState);
  // TODO: make it so popular people don't appreciate jury threat level as much until the end
  return (
    juryThreatWeight * jEquity +
    (1 - juryThreatWeight) * -relationship(hero, villain)
  );
}

export function castEvictionVote(
  hero: Houseguest,
  nominees: Houseguest[],
  gameState: GameState
): number {
  // Return the index of the eviction target.
  const callback = (hero: Houseguest, villain: Houseguest) =>
    threatScore(hero, villain, gameState);

  return highestScore(hero, nominees, callback);
}

export function nominatePlayer(
  hero: Houseguest,
  options: Houseguest[],
  gameState: GameState
): number {
  // returns the id of a nominee
  const callback = (hero: Houseguest, villain: Houseguest) =>
    threatScore(hero, villain, gameState);
  return options[highestScore(hero, options, callback)].id;
}

export function useGoldenVeto(
  hero: Houseguest,
  nominees: Houseguest[],
  gameState: GameState
): Houseguest | null {
  let povTarget: Houseguest | null = null;
  if (hero.id == nominees[0].id || hero.id == nominees[1].id) {
    povTarget = hero;
  } else {
    const save = rng().randomInt(0, 7);
    if (save < 2 && nonEvictedHouseguests(gameState).length !== 4) {
      povTarget = nominees[save];
    }
  }
  return povTarget;
}

export function castJuryVote(
  juror: Houseguest,
  finalists: Houseguest[]
): number {
  return favouriteIndex(juror, finalists);
}
