import { Subject, Subscription } from "rxjs";
import { Episode } from "../../model";
import { Sidebar } from "./sidebar";

// Null resets the season
const episodes$ = new Subject<Episode | null>();

export function newEpisode(episode: Episode | null) {
  episodes$.next(episode);
}

export class SidebarController {
  private view: Sidebar;
  private episodeSub: Subscription;

  public constructor(view: Sidebar) {
    this.view = view;
    this.episodeSub = episodes$.subscribe({
      next: episode => this.onNewEpisode(episode)
    });
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
  }
}
