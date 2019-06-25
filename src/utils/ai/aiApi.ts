import {
  Houseguest,
  GameState,
  nonEvictedHouseguests,
  inJury
} from "../../model";
import { threatScore, highestScore, favouriteIndex } from "./aiUtils";
import {
  classifyRelationship,
  RelationshipType as Relationship
} from "./classifyRelationship";

export function castEvictionVote(
  hero: Houseguest,
  nominees: Houseguest[],
  gameState: GameState
): number {
  // Return the index of the eviction target.
  const nom0 = nominees[0];
  const nom1 = nominees[1];
  const r0 = classifyRelationship(
    hero.popularity,
    nom0.popularity,
    hero.relationships[nom0.id]
  );
  const r1 = classifyRelationship(
    hero.popularity,
    nom1.popularity,
    hero.relationships[nom1.id]
  );
  // TODO: better jury logic
  if (inJury(gameState)) {
    const callback = (hero: Houseguest, villain: Houseguest) =>
      threatScore(hero, villain, gameState);
    return highestScore(hero, nominees, callback);
  }

  if (r0 === Relationship.Enemy && r1 === Relationship.Enemy) {
    return nom0.popularity > nom1.popularity ? 0 : 1;
  } else if (
    (r0 === Relationship.Enemy && r1 !== Relationship.Enemy) ||
    (r0 !== Relationship.Friend && r1 === Relationship.Friend)
  ) {
    return 0;
  } else if (
    (r1 === Relationship.Enemy && r0 !== Relationship.Enemy) ||
    (r1 !== Relationship.Friend && r0 === Relationship.Friend)
  ) {
    return 1;
  }
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
