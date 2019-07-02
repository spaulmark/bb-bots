import { PlayerProfile } from "./playerProfile";
import { RelationshipMap } from "../utils";

export class Houseguest extends PlayerProfile {
  public isEvicted: boolean = false;
  public isJury: boolean = false;

  readonly id: number = 0;

  public nominations: number = 0;
  public hohWins: number = 0;
  public povWins: number = 0;

  // Popularity ranges from -1 to 1
  public popularity: number = 0;
  public deltaPopularity: number = 0;
  readonly relationships: RelationshipMap = {};
  readonly superiors: Set<number> = new Set<number>();

  constructor(init: Houseguest) {
    super(init);
    Object.assign(this, init);
  }
}
