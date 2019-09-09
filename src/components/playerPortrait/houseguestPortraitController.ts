import { PortraitProps, HouseguestPortrait, PortraitState } from "../memoryWall";
import { Subscription } from "rxjs";
import { selectedPlayer$, displayMode$, getSelectedPlayer } from "../../subjects/subjects";
import { SelectedPlayerData } from "./selectedPortrait";
import { Rgb } from "../../model/color";
import { PowerRanking } from "../../model/powerRanking";

const selectedColor = new Rgb(51, 255, 249);

export class HouseguestPortraitController {
    private subs: Subscription[] = [];
    private view: HouseguestPortrait;
    constructor(view: HouseguestPortrait) {
        this.view = view;
    }

    get defaultState() {
        return {
            popularity: this.view.props.popularity,
            displayMode: displayMode$.value,
            powerRanking: this.view.props.powerRanking
        };
    }

    public backgroundColor(props: PortraitProps): undefined | string {
        const selectedPlayer = getSelectedPlayer();
        if (selectedPlayer !== null && selectedPlayer.id === props.id) {
            return selectedColor.toHex();
        }
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

    private comparePowerRankings(data: SelectedPlayerData): PowerRanking {
        // 0 is blue. 1 is orange
        if (!data.superiors) return new PowerRanking(0, 1);
        const id = this.view.props.id === undefined ? -1 : this.view.props.id;
        return data.superiors.has(id) ? new PowerRanking(1, 1) : new PowerRanking(0, 1);
    }

    private refreshData = (data: SelectedPlayerData | null) => {
        if (!data) {
            this.view.setState(this.defaultState);
        } else {
            if (data.id !== this.view.props.id) {
                this.view.setState({
                    popularity: data.relationships[this.view.props.id!],
                    powerRanking: this.comparePowerRankings(data)
                });
            } else {
                this.view.setState({ popularity: 2, powerRanking: new PowerRanking(2, 1) });
            }
        }
    };
}
