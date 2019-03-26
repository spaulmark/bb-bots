import { PlayerProfile } from "./playerProfile";

export class Houseguest extends PlayerProfile {
  readonly isEvicted: boolean = false;
  readonly isJury: boolean = false;

  readonly nominations: number = 0;
  readonly hohWins: number = 0;
  readonly povWins: number = 0;

  // Popularity ranges from -1 to 1
  readonly popularity: number = 0;
  // relationships?

  constructor(init: Houseguest) {
    super(init);
    Object.assign(this, init);
  }
}
