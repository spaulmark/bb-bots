import { EpisodeFragment } from "./episodeFragment";

export interface Episode {
  readonly episodeFragments: EpisodeFragment[];
  readonly title: string;
}

export interface EpisodeLibrary {
  readonly episodes: Episode[];
}
