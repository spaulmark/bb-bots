import { GameState } from "./gameState";
var MersenneTwister = require("mersenne-twister");
// spits out the next episode given a gamestate, in addition to the new gamestate.
// allows for re-use, because you can give it the initial gamestate, and then just keep asking for the next season.

function hashcode(string: string): number {
  var hash = 0,
    i,
    chr;
  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i++) {
    chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
}

export class EpisodeFactory {
  private rng: any;

  public constructor(init: GameState) {
    // generate seed
    let castNames = "";
    init.houseguests.forEach(houseguest => (castNames += houseguest.name));
    this.rng = new MersenneTwister(hashcode(castNames));
  }
}
