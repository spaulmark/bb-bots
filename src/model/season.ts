import { BigBrotherEpisode } from "./episode/bigBrotherEpisode";

export function getJurors() {
  return 7;
}

export function getFinalists() {
  return 2;
}

export class Season {
  // temp class. would in theory have a bunch of episode types in an array,
  // but for now we're just doing big brother.

  public whichEpisodeType(phase: number) {
    return BigBrotherEpisode;
  }
}
