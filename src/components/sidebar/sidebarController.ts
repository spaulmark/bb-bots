import { Subject, Subscription, BehaviorSubject } from "rxjs";
import { Episode } from "../../model";
import { Sidebar } from "./sidebar";
import { Season } from "../../model/season";

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
  private episodeSub: Subscription;
  private switchEpisodeSub: Subscription;
  private season: Season = new Season();

  public constructor(view: Sidebar) {
    this.view = view;
    this.episodeSub = episodes$.subscribe({
      next: episode => this.onNewEpisode(episode)
    });
    this.switchEpisodeSub = switchEpisode$.subscribe({
      next: (value: number) => this.switchEpisodeRelative(value)
    });
  }

  private switchEpisodeRelative(n: number) {
    // yeah
  }

  private onNewEpisode(episode: Episode | null) {
    if (!episode) {
      this.view.setState({ episodes: [] });
    } else {
      const newState = { ...this.view.state };
      newState.episodes.push(episode);
      this.view.setState(newState);
    }
  }

  public destroy() {
    this.episodeSub.unsubscribe();
    this.switchEpisodeSub.unsubscribe();
  }
}
