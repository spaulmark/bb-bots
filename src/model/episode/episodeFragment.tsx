export class EpisodeFragment {
  readonly title: string = "";
  readonly content: JSX.Element = <div />;
  public constructor(init: EpisodeFragment) {
    Object.assign(this, init);
  }
}
