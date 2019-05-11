import { BigBrotherVanilla } from "./episode/bigBrotherEpisode";
import { EpisodeFactory } from "./episode/episodeFactory";
import { GameState } from "./gameState";
import { EpisodeType, Episode } from ".";
import { BigBrotherFinale } from "./episode/bigBrotherFinale";
import { cast$ } from "../components/mainPage/mainPageController";

export function getJuryCount() {
  return jurors;
}

let jurors = 7;
const maxJurors = 7;
const sub = cast$.subscribe({
  next: newCast => {
    let players = newCast.length;
    if (players % 2 === 0) {
      players--;
    }
    players -= 2;
    jurors = Math.min(players, maxJurors);
  }
});

export function getFinalists() {
  return 2;
}

export class Season {
  private factory: EpisodeFactory;

  public constructor() {
    this.factory = new EpisodeFactory();
  }

  // In the future, this would all be customizable,
  // and not just all big brother episodes by default.

  public renderEpisode(gameState: GameState, type: EpisodeType): Episode {
    return this.factory.nextEpisode(gameState, type);
  }

  public whichEpisodeType(players: number) {
    if (players === 3) {
      return BigBrotherFinale;
    }
    return BigBrotherVanilla;
  }
}
