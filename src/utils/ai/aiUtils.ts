import {
  Houseguest,
  nonEvictedHouseguests,
  GameState,
  getJurors,
  inJury,
  calculatePopularity,
  exclude
} from "../../model";
import { finalJurySize } from "../../model/season";

const relationship = (hero: Houseguest, villain: Houseguest) =>
  hero.relationships[villain.id];

export function leastFavouriteId(hero: Houseguest, options: Houseguest[]) {
  // Return the ID of the houseguest that hero has the worst relationship with.
  return options[lowestScore(hero, options, relationship)].id;
}

export function favouriteIndex(hero: Houseguest, options: Houseguest[]) {
  // Return the index of the houseguest that hero has the worst relationship with.
  return highestScore(hero, options, relationship);
}

export function highestScore(
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
export function lowestScore(
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
export function threatScore(
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
