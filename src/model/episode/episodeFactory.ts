import { GameState } from "../gameState";
import { hashcode } from "../../utils/hashcode";
import { Episode } from "./episodeLibrary";
var MersenneTwister = require("mersenne-twister");
export class EpisodeFactory {
  private rng: any;
  //ie. "Week 1", "Double Eviction"
  readonly title: string;

  public nextEpisode(gameState: GameState): [Episode, GameState] {
    throw new Error("todo");

    // run it through the "status/memory wall" page

    // run the gamestate through the HoH Competition function

    // then through the nomination ceremony function

    // then to the veto competition

    // and then the veto ceremony

    // and then the live eviction.

    // return [null, null];
  }

  public constructor(init: GameState, title: string) {
    // generate seed
    let castNames = "";
    init.houseguests.forEach(houseguest => (castNames += houseguest.name));
    this.rng = new MersenneTwister(hashcode(castNames));
    this.title = title;
  }
}
