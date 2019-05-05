import { GameState } from "../gameState";
import { Episode } from "..";
import { EpisodeType } from "./episodes";
import {
  BigBrotherVanilla,
  BigBrotherVanillaEpisode
} from "./bigBrotherEpisode";
export class EpisodeFactory {
  public nextEpisode(gameState: GameState, episodeType: EpisodeType): Episode {
    switch (episodeType) {
      case BigBrotherVanilla:
        return new BigBrotherVanillaEpisode(gameState);
      default:
        throw new Error("Unsupported Episode Type");
    }
  }

  public constructor() {}
}
