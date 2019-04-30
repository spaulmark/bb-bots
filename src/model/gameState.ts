import { Houseguest } from "./houseguest";
import { PlayerProfile } from "./playerProfile";
import _ from "lodash";
import { newRelationshipMap, BbRandomGenerator } from "../utils";

export function randomPlayer(
  gameState: GameState,
  rng: BbRandomGenerator,
  exclusions: Houseguest[] = []
): Houseguest {
  if (gameState.houseguests.length === 0) {
    throw new Error("Tried to get a random player from a list of 0 players.");
  }
  const excludedIds = exclusions.map(hg => hg.id);
  const options = gameState.houseguests.filter(
    hg => !excludedIds.includes(hg.id) && !hg.isEvicted
  );
  const choice = rng.randomInt(0, options.length - 1);

  return options[choice];
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

  readonly phase: number = 1;
  readonly previousHOH?: Houseguest;

  public constructor(init: PlayerProfile[] | GameState) {
    if (!(init instanceof Array)) {
      Object.assign(this, init);
    } else {
      const profiles = init as PlayerProfile[];
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

  public phase: number = 1;
  public previousHOH?: Houseguest;

  public constructor(init: GameState | MutableGameState) {
    const copy = _.cloneDeep(init);
    Object.assign(this, copy);
  }
}
