import { GameState } from "../gameState";
import { hashcode } from "../../utils/hashcode";
import { Episode } from "..";
import { EpisodeType } from "./episodes";
import { BigBrotherEpisodeType, BigBrotherEpisode } from "./bigBrotherEpisode";
import { BbRandomGenerator } from "../../utils";
export class EpisodeFactory {
  private rng: BbRandomGenerator;

  public nextEpisode(gameState: GameState, episodeType: EpisodeType): Episode {
    switch (episodeType) {
      case BigBrotherEpisodeType:
        return new BigBrotherEpisode(gameState, this.rng);
      default:
        throw new Error("Unsupported Episode Type");
    }
  }

  public constructor(init: GameState) {
    let castNames = "";
    init.houseguests.forEach(houseguest => (castNames += houseguest.name));
    this.rng = new BbRandomGenerator(hashcode(castNames));
  }
}
