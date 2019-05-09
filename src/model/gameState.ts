import { Houseguest } from "./houseguest";
import { PlayerProfile } from "./playerProfile";
import _ from "lodash";
import { newRelationshipMap, rng } from "../utils";

export function getById(gameState: GameState, id: number): Houseguest {
  const result = gameState.houseguests.find(hg => hg.id === id);
  if (!result) {
    throw new Error(`Failed to find houseguest with id ${id}`);
  }
  return result;
}

export function randomPlayer(
  inclusions: Houseguest[],
  exclusions: Houseguest[] = []
): Houseguest {
  if (inclusions.length === 0) {
    throw new Error("Tried to get a random player from a list of 0 players.");
  }
  const excludedIds = exclusions.map(hg => hg.id);
  const options = inclusions.filter(
    hg => !excludedIds.includes(hg.id) && !hg.isEvicted
  );
  const choice = rng().randomInt(0, options.length - 1);

  return options[choice];
}

export function nonEvictedHouseguests(gameState: GameState) {
  return gameState.houseguests.filter(hg => !hg.isEvicted);
}
export function getJurors(gameState: GameState) {
  return gameState.houseguests.filter(hg => hg.isJury);
}

export function calculatePopularity(gameState: GameState, targetId: number) {
  let sum = 0;
  let count = 0;
  gameState.houseguests.forEach(houseguest => {
    if (houseguest.id !== targetId) {
      count++;
      sum += houseguest.relationships[targetId];
    }
  });
  return count === 0 ? 0 : sum / count;
}

export class GameState {
  // Current state of the game after a phase.

  readonly houseguests: Houseguest[] = [];
  readonly remainingPlayers: number = 0;
  readonly phase: number = 1;
  readonly previousHOH?: Houseguest;

  public constructor(init: PlayerProfile[] | GameState) {
    if (!(init instanceof Array)) {
      Object.assign(this, init);
    } else {
      const profiles = init as PlayerProfile[];
      this.remainingPlayers = profiles.length;
      const blankRelationshipMap = newRelationshipMap(profiles.length);
      let id = 0;
      profiles.forEach(profile => {
        // set up a houseguest
        this.houseguests.push(
          new Houseguest({
            ...profile,
            isEvicted: false,
            isJury: false,
            id: ++id,
            nominations: 0,
            hohWins: 0,
            povWins: 0,
            popularity: 0,
            relationships: _.cloneDeep(blankRelationshipMap)
          })
        );
      });
    }
  }
}

export class MutableGameState {
  public houseguests: Houseguest[] = [];
  public remainingPlayers: number = 0;
  public phase: number = 1;
  public previousHOH?: Houseguest;

  public constructor(init: GameState | MutableGameState) {
    const copy = _.cloneDeep(init);
    Object.assign(this, copy);
  }
}
