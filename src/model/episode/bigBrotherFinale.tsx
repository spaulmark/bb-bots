import { EpisodeType } from "./episodes";

export const BigBrotherFinale: EpisodeType = {
  canPlayWith: (n: number) => n === 3,
  eliminates: 2
};

export class BigBrotherFinaleEpisode {}
