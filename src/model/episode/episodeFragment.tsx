import { GameState } from "../gameState";

export interface Episode {
  readonly episodeFragments: EpisodeFragment[];
  readonly title: string;
  readonly render: JSX.Element;
  readonly gameState: GameState;
}

export interface EpisodeType {
  readonly canPlayWith: (n: number) => boolean;
  readonly eliminates: number;
}

export class EpisodeFragment {
  readonly title: string = "";
  readonly gameState!: GameState; // TODO: for generating graphs on the side.
  readonly render: JSX.Element = (
    <div>{`Error while rendering ${this.title}`}</div>
  );
  public constructor(init: EpisodeFragment) {
    Object.assign(this, init);
  }
}
