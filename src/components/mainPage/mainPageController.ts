import { MainPage } from "./mainPage";
import { PlayerProfile } from "../../model";
import { cast$ } from "../../subjects/subjects";

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
