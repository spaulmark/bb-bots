import { Rgb, interpolateColor } from "./color";
import { PortraitState } from "../components/memoryWall";
import { extremeValues } from "../utils";

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

        const extremePopularity = extremeValues(popularity);
        const percent = (extremePopularity + 1) / 2;
        return interpolateColor(popularityMinColor, popularityMaxColor, percent);
    }
};

const powerMaxColor = new Rgb(255, 204, 94);
const powerMinColor = new Rgb(192, 181, 255);
export const powerMode: PortraitDisplayMode = {
    minColor: powerMinColor,
    maxColor: powerMaxColor,
    backgroundColor: (state: PortraitState) => {
        const powerRanking = state.powerRanking;
        if (powerRanking === undefined) return "";

        return interpolateColor(powerMinColor, powerMaxColor, powerRanking);
    }
};
