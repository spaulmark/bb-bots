import { MainPage } from "./mainPage";
import { PlayerProfile } from "../../model";
import { BehaviorSubject } from "rxjs";

const cast$ = new BehaviorSubject<PlayerProfile[]>([]);

export function updateCast(newCast: PlayerProfile[]) {
  cast$.next(newCast);
}

export function getCast(): PlayerProfile[] {
  return cast$.value;
}

export class MainPageController {
  private view: MainPage = new MainPage({ controller: this });

  public inject(page: MainPage) {
    this.view = page;
  }
}
