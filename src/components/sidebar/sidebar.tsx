import React from "react";
import { Episode, EpisodeFragment } from "../../model";
import { SidebarController, newEpisode } from "./sidebarController";
import { mainContentStream$ } from "../mainPage/mainContentArea";
import { PregameScreen } from "../pregameScreen/pregameScreen";

interface SidebarState {
  episodes: Episode[];
}

export class Sidebar extends React.Component<{}, SidebarState> {
  private controller: SidebarController;
  public constructor(props: {}) {
    super(props);
    this.controller = new SidebarController(this);
    this.state = { episodes: [] };
    newEpisode({
      render: <PregameScreen cast={[]} />,
      title: "Pregame",
      episodeFragments: []
    });
  }

  public componentWillUnmount() {
    this.controller.destroy();
  }

  public render() {
    return (
      <div className="box" style={{ minWidth: 140 }}>
        {this.getEpisodes()}
      </div>
    );
  }

  private getEpisodes() {
    const result: JSX.Element[] = [];
    let i = 0;
    this.state.episodes.forEach((episode: Episode) => {
      result.push(
        <b
          key={++i}
          onClick={() => {
            mainContentStream$.next(episode.render);
          }}
        >
          {episode.title}
        </b>
      );
      result.push(<br key={++i} />);
      episode.episodeFragments.forEach((fragment: EpisodeFragment) => {
        result.push(
          <a
            key={++i}
            onClick={() => mainContentStream$.next(fragment.render)}
          />
        );
        result.push(<br key={++i} />);
      });
    });
    return result;
  }
}
