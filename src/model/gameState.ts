import { Houseguest } from "./houseguest";
import { PlayerProfile } from "./playerProfile";
import _ from "lodash";
import { newRelationshipMap } from "../utils/rMap";

export class GameState {
  // Current state of the game after a phase.

  readonly houseguests!: Houseguest[];

  // History of the game so far.

  readonly phase: number = 1;
  readonly previousHOH?: Houseguest;

  private calculatePopularity(targetId: number) {
    let sum = 0;
    let count = 0;
    this.houseguests.forEach(houseguest => {
      if (houseguest.id !== targetId) {
        count++;
        sum += houseguest.relationships[targetId];
      }
    });
    return count === 0 ? 0 : sum / count;
  }

  /**
    double eviction, season seed/hash, twists, and other stuff go in the episode factory that generates the next episode.
    
    all the statistics of who voted for who, who won HoH each week, etc. <--- probably goes in episode library

    The main idea being you can just pass a GameState object into a getNextEpisode function,
    and it gives you the next episode, or an "END OF SEASON" episode along with a winner.
    */

  public constructor(init: PlayerProfile[] | GameState) {
    if (init instanceof GameState) {
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
            stats: {
              str: 1, // TODO: make these stats random based on the game + the rng seed.
              dex: 1,
              int: 1,
              will: 1,
              luck: 1,
              memory: 1
            },
            popularity: 0,
            relationships: _.cloneDeep(blankRelationshipMap)
          })
        );
      });
    }
  }
}
