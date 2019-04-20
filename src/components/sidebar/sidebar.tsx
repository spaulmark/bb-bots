import React from "react";
import { Episode, EpisodeFragment, GameState } from "../../model";
import { SidebarController, newEpisode } from "./sidebarController";
import { mainContentStream$ } from "../mainPage/mainContentArea";
import { PregameScreen } from "../pregameScreen/pregameScreen";

interface SidebarState {
  episodes: Episode[];
  selectedEpisode: number;
}

export class Sidebar extends React.Component<{}, SidebarState> {
  private controller: SidebarController;
  public constructor(props: {}) {
    super(props);
    this.controller = new SidebarController(this);
    this.state = { episodes: [], selectedEpisode: 0 };
    newEpisode({
      render: <PregameScreen cast={[]} />,
      title: "Pregame",
      episodeFragments: [],
      gameState: new GameState([])
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
    // Weird OBOE to make keys start at 0
    let episodeKey = -1;
    let breakKey = 0;
    this.state.episodes.forEach((episode: Episode) => {
      const id = ++episodeKey;
      result.push(
        <b
          key={id}
          onClick={() => {
            this.controller.switchToEpisode(id);
          }}
        >
          {episode.title}
        </b>
      );
      result.push(<br key={--breakKey} />);
      episode.episodeFragments.forEach((fragment: EpisodeFragment) => {
        const id = ++episodeKey;
        result.push(
          <a key={id} onClick={() => this.controller.switchToEpisode(id)} />
        );
        result.push(<br key={--breakKey} />);
      });
    });
    return result;
  }
}
