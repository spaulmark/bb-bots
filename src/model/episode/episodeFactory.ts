import {
  GameState,
  MutableGameState,
  calculatePopularity,
  nonEvictedHouseguests
} from "../gameState";
import { Episode, Houseguest } from "..";
import { EpisodeType } from "./episodes";
import {
  BigBrotherVanilla,
  BigBrotherVanillaEpisode
} from "./bigBrotherEpisode";
import { BigBrotherFinale, BigBrotherFinaleEpisode } from "./bigBrotherFinale";
import { rng } from "../../utils";

function firstImpressions(houseguests: Houseguest[]) {
  for (let i = 0; i < houseguests.length; i++) {
    const iMap = houseguests[i].relationships;
    for (let j = i + 1; j < houseguests.length; j++) {
      // creates a bunch of 100% random mutual relationships
      const jMap = houseguests[j].relationships;
      const impression = rng().randomFloat();
      jMap[i] = impression;
      iMap[j] = impression;
    }
  }
}

function updatePopularity(gameState: GameState) {
  const houseguests = nonEvictedHouseguests(gameState);
  houseguests.forEach(hg => {
    hg.popularity = calculatePopularity(gameState, hg.id);
  });
}

export class EpisodeFactory {
  public nextEpisode(gameState: GameState, episodeType: EpisodeType): Episode {
    let newState = new MutableGameState(gameState);
    if (gameState.phase === 0) {
      firstImpressions(newState.houseguests);
    }
    // calculate popularity
    updatePopularity(newState);
    const finalState = new GameState(newState);
    switch (episodeType) {
      case BigBrotherVanilla:
        return new BigBrotherVanillaEpisode(finalState);
      case BigBrotherFinale:
        return new BigBrotherFinaleEpisode(finalState);
      default:
        throw new Error("Unsupported Episode Type");
    }
  }
}
