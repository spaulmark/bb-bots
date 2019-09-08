import { extremeValues } from "../../utils";
import { PortraitProps, HouseguestPortrait, PortraitState } from "../memoryWall";
import { Subscription } from "rxjs";
import { selectedPlayer$ } from "../../subjects/subjects";
import { SelectedPlayerData } from "./selectedPortrait";
import { Rgb, interpolate as interpolateColor } from "../../model/color";

const maxPopularity = new Rgb(137, 252, 137);
const minPopularity = new Rgb(252, 137, 137);
const selectedColor = new Rgb(51, 255, 249);

export class HouseguestPortraitController {
    private subs: Subscription[] = [];
    private view: HouseguestPortrait;
    public readonly defaultState: PortraitState;
    constructor(view: HouseguestPortrait) {
        this.view = view;
        this.defaultState = { popularity: this.view.props.popularity };
    }

    public backgroundColor(props: PortraitProps, popularity: number | undefined) {
        if (popularity && (popularity > 1 || popularity < -1)) {
            return selectedColor.toHex();
        }
        const extremePopularity = extremeValues(popularity);
        const percent = (extremePopularity + 1) / 2;
        return props.isEvicted ? undefined : interpolateColor(minPopularity, maxPopularity, percent);
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
