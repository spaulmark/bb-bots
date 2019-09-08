import { Rgb, interpolateColor } from "./color";
import { PortraitState } from "../components/memoryWall";
import { extremeValues } from "../utils";

const selectedColor = new Rgb(51, 255, 249);

export interface PortraitDisplayMode {
    minColor: Rgb;
    maxColor: Rgb;
    backgroundColor: (state: PortraitState) => string;
}

const popularityMinColor = new Rgb(252, 137, 137);
const popularityMaxColor = new Rgb(137, 252, 137);

export const popularityMode: PortraitDisplayMode = {
    minColor: popularityMinColor,
    maxColor: popularityMaxColor,
    backgroundColor: (state: PortraitState) => {
        const popularity = state.popularity;
        if (popularity && (popularity > 1 || popularity < -1)) {
            return selectedColor.toHex();
        }
        const extremePopularity = extremeValues(popularity);
        const percent = (extremePopularity + 1) / 2;
        return interpolateColor(popularityMinColor, popularityMaxColor, percent);
    }
};

const powerMaxColor = new Rgb(255, 170, 0);
const powerMinColor = new Rgb(255, 111, 255);
export const powerMode: PortraitDisplayMode = {
    minColor: powerMinColor,
    maxColor: powerMaxColor,
    backgroundColor: (state: PortraitState) => {
        console.log(state);
        return "#000000";
    }
};
