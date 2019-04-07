import { MainPage } from "./mainPage";

export interface MainPageController {
  inject: (page: MainPage) => void;
}

export class BigBrotherController implements MainPageController {
  private view: MainPage = new MainPage({ controller: this });
  // private gameState: GameState;

  public inject(page: MainPage) {
    this.view = page;
  }

  // yeah
}
