import React from "react";
import { Episode, Scene, GameState } from "../../model";
import { SidebarController, newEpisode } from "./sidebarController";
import { PregameEpisode } from "../../model/episode/pregameEpisode";

interface SidebarState {
  episodes: Episode[];
  selectedScene: number;
}

export class Sidebar extends React.Component<{}, SidebarState> {
  private controller: SidebarController;
  public constructor(props: {}) {
    super(props);
    this.controller = new SidebarController(this);
    this.state = { episodes: [], selectedScene: 0 };
    newEpisode(new PregameEpisode(new GameState([])));
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
            this.controller.switchToScene(id);
          }}
        >
          {episode.title}
        </b>
      );
      result.push(<br key={--breakKey} />);
      episode.scenes.forEach((scene: Scene) => {
        const id = ++episodeKey;
        result.push(
          <a key={id} onClick={() => this.controller.switchToScene(id)}>
            {scene.title}
          </a>
        );
        result.push(<br key={--breakKey} />);
      });
    });
    return result;
  }
}
