import { Subject, Subscription, BehaviorSubject } from "rxjs";
import { Episode, Scene, nonEvictedHouseguests } from "../../model";
import { Sidebar } from "./sidebar";
import { Season } from "../../model/season";
import { mainContentStream$ } from "../mainPage/mainContentArea";
import { cast$ } from "../mainPage/mainPageController";

// Null resets the season
const episodes$ = new BehaviorSubject<Episode | null>(null);
const switchEpisode$ = new Subject<number>();

export function newEpisode(episode: Episode | null) {
  episodes$.next(episode);
}

export function switchEpisodeRelative(n: number) {
  switchEpisode$.next(n);
}

export class SidebarController {
  private view: Sidebar;
  private subscriptions: Subscription[] = [];
  private season: Season = new Season();
  private scenes: Scene[] = [];

  public constructor(view: Sidebar) {
    this.view = view;
    this.subscriptions.push(
      episodes$.subscribe({
        next: episode => this.onNewEpisode(episode)
      })
    );
    this.subscriptions.push(
      switchEpisode$.subscribe({
        next: (value: number) => this.switchSceneRelative(value)
      })
    );
    this.subscriptions.push(
      cast$.subscribe({
        next: newCast => (this.season = new Season())
      })
    );
  }

  public switchToScene(scene: number) {
    mainContentStream$.next(this.scenes[scene].render);
    this.view.setState({ selectedScene: scene });
  }

  private switchSceneRelative(delta: number) {
    const selectedScene = this.view.state.selectedScene;
    const renderedScenes = this.scenes.length;
    const targetScene = selectedScene + delta;

    if (targetScene < 0) {
      return;
    }
    if (targetScene < renderedScenes) {
      this.switchToScene(targetScene);
    } else if (targetScene === renderedScenes) {
      const lastEpisode = this.view.state.episodes[
        this.view.state.episodes.length - 1
      ];
      const nextPhase = this.view.state.episodes.length;
      const currentGameState = lastEpisode.gameState;
      const newPlayerCount = nonEvictedHouseguests(lastEpisode.gameState)
        .length;
      const nextEpisodeType = this.season.whichEpisodeType(newPlayerCount);
      if (this.season.canEpisodeExist(newPlayerCount)) {
        newEpisode(
          this.season.renderEpisode(currentGameState, nextEpisodeType)
        );
        this.switchSceneRelative(1);
      }
    }
  }

  private onNewEpisode(episode: Episode | null) {
    if (!episode) {
      this.view.setState({ episodes: [], selectedScene: 0 });
      this.scenes = [];
    } else {
      const newState = { ...this.view.state };
      this.scenes.push(episode);
      this.scenes = this.scenes.concat(episode.scenes);
      newState.episodes.push(episode);
      this.view.setState(newState);
    }
  }

  public destroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
