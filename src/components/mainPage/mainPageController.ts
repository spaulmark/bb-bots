import { MainPage } from "./mainPage";

export class MainPageController {
    private view: MainPage = new MainPage({ controller: this });

    public inject(page: MainPage) {
        this.view = page;
    }
}
