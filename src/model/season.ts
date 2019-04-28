import { BigBrotherEpisodeType } from "./episode/bigBrotherEpisode";
import { EpisodeFactory } from "./episode/episodeFactory";
import { GameState } from "./gameState";
import { EpisodeType, Episode } from ".";

export function getJurors() {
  return 7;
}

export function getFinalists() {
  return 2;
}

export class Season {
  private factory: EpisodeFactory;

  public constructor(gameState: GameState) {
    this.factory = new EpisodeFactory(gameState);
  }

  // In the future, this would all be customizable,
  // and not just all big brother episodes by default.

  public canEpisodeExist(players: number) {
    return BigBrotherEpisodeType.canPlayWith(players);
  }

  public renderEpisode(gameState: GameState, type: EpisodeType): Episode {
    return this.factory.nextEpisode(gameState, type);
  }

  public whichEpisodeType(phase: number) {
    return BigBrotherEpisodeType;
  }
}
