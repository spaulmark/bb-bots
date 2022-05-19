import React from "react";
import { SidebarController } from "./sidebarController";
import { PregameEpisode } from "../episode/pregameEpisode";
import { defaultJurySize, Episode, GameState, PlayerProfile } from "../../model";
import { Scene } from "../episode/scenes/scene";
import { cast$, newEpisode, pushToMainContentStream } from "../../subjects/subjects";
import { Box } from "../layout/box";
import { HasText } from "../layout/text";
import { shuffle } from "lodash";
import { activeScreen$, Screens } from "../topbar/topBar";
interface SidebarState {
    episodes: Episode[];
    selectedScene: number;
    selectionsActive: boolean;
}

let firstLoad = true;

export class Sidebar extends React.Component<{}, SidebarState> {
    private controller: SidebarController;
    public constructor(props: {}) {
        super(props);
        this.controller = new SidebarController(this);
        this.state = { episodes: [], selectedScene: 0, selectionsActive: true };
    }
    public async componentDidMount() {
        document.addEventListener("keydown", this.controller.handleKeyDown);
        if (!firstLoad) {
            firstLoad = false;
            return;
        }
        let data = await (
            await fetch(`https://raw.githubusercontent.com/spaulmark/img/master/bb.json`)
        ).json();
        const allBBs: PlayerProfile[] = [];
        data = shuffle(data).slice(0, 16);
        for (const player of data) {
            let name = player.substr(0, player.lastIndexOf(".")) || player;
            name = name.substr(name.indexOf("/") + 1) || name;
            allBBs.push({
                name,
                imageURL: `https://spaulmark.github.io/img/Big Brother ${player}`,
            });
        }

        const episode: Episode = new PregameEpisode(
            new GameState({ players: allBBs, jury: defaultJurySize(allBBs.length) })
        );
        newEpisode(episode);
        cast$.next(allBBs);
        if (activeScreen$.value === Screens.Other) {
            pushToMainContentStream(episode.render, Screens.Other);
        }
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
        if (key === this.state.selectedScene && this.state.selectionsActive) {
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
