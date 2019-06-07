import {
  Houseguest,
  nonEvictedHouseguests,
  GameState,
  getJurors,
  inJury,
  calculatePopularity,
  exclude
} from "../model";
import { finalJurySize } from "../model/season";

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

export function juryEquity(
  hero: Houseguest,
  villain: Houseguest,
  gameState: GameState
): number {
  const jurors = getJurors(gameState);
  const juryWeight = jurors.length / finalJurySize();
  const houseWeight = 1 - juryWeight;
  const juryScore = calculatePopularity(villain, jurors);
  const houseScore =
    hero.id !== villain.id
      ? calculatePopularity(
          villain,
          exclude(nonEvictedHouseguests(gameState), [hero])
        )
      : villain.popularity;
  return juryScore * juryWeight + houseScore * houseWeight;
}

// A higher number represents a higher threat score.
// A negative number represents someone who is not a threat.
function threatScore(
  hero: Houseguest,
  villain: Houseguest,
  gameState: GameState
): number {
  let juryThreatWeight = 0;
  if (inJury(gameState)) {
    // TODO: hit list logic will automatically take shield logic into account,
    // since the popular people won't have as big a jury hit list.
    const actualJurors = getJurors(gameState).length;
    const multiplier =
      gameState.remainingPlayers === 3 ? 1 : hero.relativeEquity;
    juryThreatWeight =
      1 - ((finalJurySize() - actualJurors - 1) / finalJurySize()) * multiplier;
  }
  const jEquity = juryEquity(hero, villain, gameState);
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
    // incredibly basic veto logic - veto people that are not a threat to me.
    // probably results in the veto almost always getting used, but can result
    // in some fun situations where someone keeps saving an unpopular friend.
    let save = -1;
    const threat0 = threatScore(hero, nominees[0], gameState);
    const threat1 = threatScore(hero, nominees[1], gameState);
    if (threat0 < 0 || threat1 < 0) {
      save = Math.min(threat0, threat1) === threat0 ? 0 : 1;
    }
    if (nonEvictedHouseguests(gameState).length !== 4 && save > -1) {
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
