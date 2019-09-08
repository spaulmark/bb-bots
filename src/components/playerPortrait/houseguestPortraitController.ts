import { PortraitProps, HouseguestPortrait, PortraitState } from "../memoryWall";
import { Subscription } from "rxjs";
import { selectedPlayer$, displayMode$ } from "../../subjects/subjects";
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
        subs.push(
            displayMode$.subscribe({
                next: displayMode => this.view.setState({ displayMode })
            })
        );
        this.subs = subs;
    }

    public unsubscribe() {
        this.subs.forEach(sub => sub.unsubscribe());
    }

    private refreshData = (data: SelectedPlayerData | null) => {
        // TODO: this will need to be updated for power rankings
        if (!data) {
            this.view.setState(this.defaultState);
        } else {
            if (data.id !== this.view.props.id) {
                this.view.setState({
                    popularity: data.relationships[this.view.props.id!]
                });
            } else {
                // TODO: instead to "selected = true and selected = false?"
                this.view.setState({ popularity: 2 });
            }
        }
    };
}
