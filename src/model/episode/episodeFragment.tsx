import { GameState } from "../gameState";

export class EpisodeFragment {
  readonly title: string = "";
  readonly gameState!: GameState; // TODO: for generating graphs on the side.
  readonly content: JSX.Element = <div />;
  public constructor(init: EpisodeFragment) {
    Object.assign(this, init);
  }
}
