import { GameState } from "../gameState";
import { Episode } from "..";
import { EpisodeType } from "./episodes";
import {
  BigBrotherVanilla,
  BigBrotherVanillaEpisode
} from "./bigBrotherEpisode";
import { BigBrotherFinale, BigBrotherFinaleEpisode } from "./bigBrotherFinale";
export class EpisodeFactory {
  public nextEpisode(gameState: GameState, episodeType: EpisodeType): Episode {
    switch (episodeType) {
      case BigBrotherVanilla:
        return new BigBrotherVanillaEpisode(gameState);
      case BigBrotherFinale:
        return new BigBrotherFinaleEpisode(gameState);
      default:
        throw new Error("Unsupported Episode Type");
    }
  }
}
