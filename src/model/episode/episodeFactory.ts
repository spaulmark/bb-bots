import {
  GameState,
  MutableGameState,
  calculatePopularity,
  nonEvictedHouseguests,
  getById
} from "../gameState";
import { Episode, Houseguest } from "..";
import { EpisodeType } from "./episodes";
import {
  BigBrotherVanilla,
  BigBrotherVanillaEpisode
} from "./bigBrotherEpisode";
import { BigBrotherFinale, BigBrotherFinaleEpisode } from "./bigBrotherFinale";
import { rng, roundTwoDigits } from "../../utils";
import { PriorityQueue } from "../../utils/heap";
import { juryEquity } from "../../utils/aiUtils";

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
  const heap = new PriorityQueue((a, b) => a[1] > b[1]);
  houseguests.forEach(hg => {
    const result = calculatePopularity(hg, nonEvictedHouseguests(gameState));
    hg.deltaPopularity =
      (roundTwoDigits(result) - roundTwoDigits(hg.popularity)) / 100;
    hg.popularity = result;
    heap.push([hg, juryEquity(hg, hg, gameState)]);
  });
  const houseSize = heap.size();
  while (heap.size() > 0) {
    const currentHg: Houseguest = getById(gameState, heap.pop()[0].id);
    currentHg.relativeEquity = (heap.size() + 1) / houseSize;
  }
}

export class EpisodeFactory {
  public nextEpisode(gameState: GameState, episodeType: EpisodeType): Episode {
    let newState = new MutableGameState(gameState);
    if (gameState.phase === 0) {
      firstImpressions(newState.houseguests);
    }
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
