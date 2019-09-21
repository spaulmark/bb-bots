import { Rgb, interpolateColor } from "./color";
import { PortraitState, PortraitProps } from "../components/memoryWall";
import { extremeValues } from "../utils";
import { generatePopularitySubtitle, generatePowerSubtitle } from "../components/playerPortrait/subtitle";

export interface PortraitDisplayMode {
    minColor: Rgb;
    maxColor: Rgb;
    backgroundColor: (state: PortraitState) => string;
    generateSubtitle: (props: PortraitProps, state: PortraitState, detailed?: boolean) => any[];
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
    },
    generateSubtitle: generatePopularitySubtitle
};

const powerMaxColor = new Rgb(255, 204, 94);
const powerMinColor = new Rgb(192, 181, 255);
export const powerMode: PortraitDisplayMode = {
    minColor: powerMinColor,
    maxColor: powerMaxColor,
    backgroundColor: (state: PortraitState) => {
        const powerRanking = state.powerRanking;
        if (powerRanking === undefined) return "";
        if (powerRanking.beats === 0 && powerRanking.outOf === 1) {
            return popularityMode.backgroundColor(state);
        }

        return interpolateColor(powerMinColor, powerMaxColor, powerRanking.toFloat);
    },
    generateSubtitle: generatePowerSubtitle
};
