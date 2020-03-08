import { Subscription } from "rxjs";
import { Sidebar } from "./sidebar";
import { Season } from "../../model/season";
import { Episode, nonEvictedHouseguests, getById } from "../../model";
import { Scene } from "../episode/scene";
import {
    mainContentStream$,
    episodes$,
    switchEpisode$,
    newEpisode,
    switchSceneRelative,
    cast$,
    getSelectedPlayer,
    selectedPlayer$
} from "../../subjects/subjects";

interface IndexedScene {
    scene: Scene;
    index: number;
}

const LEFT = 37;
const RIGHT = 39;

export class SidebarController {
    private view: Sidebar;
    private subscriptions: Subscription[] = [];
    private season: Season = new Season();
    private scenes: IndexedScene[] = [];
    private selectedEpisode: number = 0;

    public constructor(view: Sidebar) {
        this.view = view;
        this.subscriptions.push(
            episodes$.subscribe({
                next: episode => this.onNewEpisode(episode)
            })
        );
        this.subscriptions.push(
            switchEpisode$.subscribe({
                next: (value: number) => {
                    this.switchSceneRelative(value);
                }
            })
        );
        this.subscriptions.push(
            cast$.subscribe({
                next: () => (this.season = new Season())
            })
        );
    }

    public getSelectedEpisode() {
        return this.selectedEpisode;
    }

    public async switchToScene(id: number) {
        mainContentStream$.next(this.scenes[id].scene.render);
        this.selectedEpisode = this.scenes[id].index;
        await this.view.setState({ selectedScene: id });
        if (getSelectedPlayer() !== null) {
            selectedPlayer$.next(
                getById(this.scenes[this.view.state.selectedScene].scene.gameState, getSelectedPlayer()!.id)
            );
        }
    }

    private switchSceneRelative = (delta: number) => {
        const selectedScene = this.view.state.selectedScene;
        const renderedScenes = this.scenes.length;
        const targetScene = selectedScene + delta;
        if (targetScene < 0) {
            return;
        }
        const lastEpisode = this.view.state.episodes[this.view.state.episodes.length - 1];
        if (targetScene < renderedScenes) {
            // Go back to an earlier scene
            this.switchToScene(targetScene);
        } else if (targetScene === renderedScenes) {
            // Generate a new scene, then jump to it
            const currentGameState = lastEpisode.gameState;
            const newPlayerCount = nonEvictedHouseguests(lastEpisode.gameState).length;
            const nextEpisodeType = this.season.whichEpisodeType(newPlayerCount);
            if (newPlayerCount > 0) {
                newEpisode(this.season.renderEpisode(currentGameState, nextEpisodeType));
                this.switchSceneRelative(1);
            }
        }
    };

    get handleKeyDown(): (e: any) => void {
        return this._handleKeyDown.bind(this);
    }

    private _handleKeyDown(event: any) {
        const state = this.view.state;
        if (!state.episodes[this.selectedEpisode].type.arrowsEnabled) {
            return;
        }
        if (event.keyCode === LEFT) {
            switchSceneRelative(-1);
        } else if (event.keyCode === RIGHT) {
            switchSceneRelative(1);
        }
    }

    private onNewEpisode(episode: Episode | null) {
        if (!episode) {
            this.view.setState({ episodes: [], selectedScene: 0 });
            this.scenes = [];
        } else {
            const newState = { ...this.view.state };
            // starts at -1: prevent OBOE
            const latestIndex = this.scenes.length === 0 ? -1 : this.scenes[this.scenes.length - 1].index;
            const index = latestIndex + 1;
            this.scenes.push({ scene: episode, index });
            episode.scenes.forEach(scene => this.scenes.push({ scene, index }));
            newState.episodes.push(episode);
            this.view.setState(newState);
        }
    }

    public destroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
