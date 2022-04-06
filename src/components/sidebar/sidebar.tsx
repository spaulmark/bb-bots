import React from "react";
import { SidebarController } from "./sidebarController";
import { PregameEpisode } from "../episode/pregameEpisode";
import { Episode, GameState } from "../../model";
import { Scene } from "../episode/scene";
import { newEpisode } from "../../subjects/subjects";
import { Box } from "../layout/box";
import { HasText } from "../layout/text";
import { selectedColor } from "../playerPortrait/houseguestPortraitController";
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

    public componentDidMount() {
        document.addEventListener("keydown", this.controller.handleKeyDown);
    }

    public componentWillUnmount() {
        this.controller.destroy();
    }

    public render() {
        return (
            <Box style={{ minWidth: 180 }}>
                <HasText>{this.getEpisodes()}</HasText>
            </Box>
        );
    }

    private getHighlight(title: string, key: number) {
        if (key === this.state.selectedScene) {
            return <mark>{title}</mark>;
        }
        return title;
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
                    {this.getHighlight(episode.title, id)}
                </b>
            );
            result.push(<br key={--breakKey} />);
            episode.scenes.forEach((scene: Scene) => {
                const id = ++episodeKey;
                if (this.controller.getSelectedEpisode() === episode.gameState.phase) {
                    result.push(
                        <a key={id} onClick={() => this.controller.switchToScene(id)}>
                            {this.getHighlight(scene.title, id)}
                        </a>
                    );
                    result.push(<br key={--breakKey} />);
                }
            });
        });
        return result;
    }
}
