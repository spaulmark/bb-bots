import { GameState } from "./gameState";
import { hashcode } from "../utils/hashcode";
var MersenneTwister = require("mersenne-twister");
export class EpisodeFactory {
  private rng: any;
  //ie. "Week 1", "Double Eviction"
  readonly title: string;

  public constructor(init: GameState, title: string) {
    // generate seed
    let castNames = "";
    init.houseguests.forEach(houseguest => (castNames += houseguest.name));
    this.rng = new MersenneTwister(hashcode(castNames));
    this.title = title;
  }
}
