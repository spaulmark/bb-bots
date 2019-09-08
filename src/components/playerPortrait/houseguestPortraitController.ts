import { PortraitProps, HouseguestPortrait, PortraitState } from "../memoryWall";
import { Subscription } from "rxjs";
import { selectedPlayer$ } from "../../subjects/subjects";
import { SelectedPlayerData } from "./selectedPortrait";
import { popularityMode } from "../../model/portraitDisplayMode";

export class HouseguestPortraitController {
    private subs: Subscription[] = [];
    private view: HouseguestPortrait;
    public readonly defaultState: PortraitState;
    constructor(view: HouseguestPortrait) {
        this.view = view;
        this.defaultState = { popularity: this.view.props.popularity, displayMode: popularityMode };
    }

    public backgroundColor(props: PortraitProps): undefined | string {
        return props.isEvicted ? undefined : this.view.state.displayMode.backgroundColor(this.view.state);
    }

    public subscribe() {
        const subs: Subscription[] = [];
        subs.push(
            selectedPlayer$.subscribe({
                next: this.refreshData
            })
        );
        this.subs = subs;
    }

    public unsubscribe() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    private refreshData = (data: SelectedPlayerData | null) => {
        if (!data) {
            this.view.setState(this.defaultState);
        } else {
            data = data as SelectedPlayerData;
            if (data.id !== this.view.props.id) {
                this.view.setState({
                    popularity: data.relationships[this.view.props.id!]
                });
            } else {
                this.view.setState({ popularity: 2 });
            }
        }
    };
}
