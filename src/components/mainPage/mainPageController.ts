import { MainPage } from "./mainPage";
import { Subscription } from "rxjs";
import { isFullscreen$ } from "../../subjects/subjects";

export class MainPageController {
    private view: MainPage = new MainPage({ controller: this });
    private subscriptions: Subscription[] = [];
    public inject(page: MainPage) {
        this.view = page;
    }

    public subscribe(): void {
        this.unsubscribe();
        this.subscriptions.push(
            isFullscreen$.subscribe((fullscreen: boolean) => {
                this.view.setState({ fullscreen });
            })
        );
    }

    public unsubscribe(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
