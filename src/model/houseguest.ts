import { PlayerProfile } from "./playerProfile";
import { RelationshipMap } from "../utils/rMap";
import { Stats } from "./stats";

export class Houseguest extends PlayerProfile {
  readonly isEvicted: boolean = false;
  readonly isJury: boolean = false;

  readonly id: number = 0;

  readonly stats!: Stats;

  readonly nominations: number = 0;
  readonly hohWins: number = 0;
  readonly povWins: number = 0;

  // Popularity ranges from -1 to 1
  readonly popularity: number = 0;
  readonly relationships: RelationshipMap = {};

  constructor(init: Houseguest) {
    super(init);
    this.relationships = init.relationships || {};
    Object.assign(this, init);
  }
}
