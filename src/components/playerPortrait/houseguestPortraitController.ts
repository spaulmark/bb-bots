import { extremeValues } from "../../utils";
import { PortraitProps, HouseguestPortrait, PortraitState } from "../memoryWall";
import { Subscription } from "rxjs";
import { selectedPlayer$, SelectedPlayerData } from "./selectedPortrait";

const maxPopularity = { r: 137, g: 252, b: 137 };
const minPopularity = { r: 252, g: 137, b: 137 };
const selectedColor = { r: 51, g: 255, b: 249 };

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
            return this.rgbToHex(selectedColor.r, selectedColor.g, selectedColor.b);
        }
        const extremePopularity = extremeValues(popularity);
        const percent = (extremePopularity + 1) / 2;
        return props.isEvicted
            ? undefined
            : this.rgbToHex(
                  minPopularity.r + percent * (maxPopularity.r - minPopularity.r),
                  minPopularity.g + percent * (maxPopularity.g - minPopularity.g),
                  minPopularity.b + percent * (maxPopularity.b - minPopularity.b)
              );
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
        // TODO: somehow refresh this heart thing every time selected player data updates
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

    private componentToHex(c: any) {
        var hex = Math.round(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    private rgbToHex(r: any, g: any, b: any) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }
}
