import React from "react";
import { Episode, EpisodeFragment } from "../../model";
import { SidebarController } from "./sidebarController";
import { mainContentStream$ } from "../mainPage/mainContentArea";

interface SidebarState {
  episodes: Episode[];
}

export class Sidebar extends React.Component<{}, SidebarState> {
  private controller: SidebarController;
  public constructor(props: {}) {
    super(props);
    this.controller = new SidebarController(this);
    this.state = { episodes: [] };
  }

  public componentWillUnmount() {
    this.controller.destroy();
  }

  public render() {
    return <div className="box">{this.getEpisodes()}</div>;
  }

  private getEpisodes() {
    const result: JSX.Element[] = [];
    this.state.episodes.forEach((episode: Episode) => {
      result.push(
        <b
          onClick={() => {
            mainContentStream$.next(episode.render);
          }}
        >
          {episode.title}
        </b>
      );
      result.push(<br />);
      episode.episodeFragments.forEach((fragment: EpisodeFragment) => {
        result.push(
          <a onClick={() => mainContentStream$.next(fragment.render)} />
        );
        result.push(<br />);
      });
    });
    return result;
  }
}
