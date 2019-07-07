import some from "lodash/some";
import values from "lodash/values";
import sum from "lodash/sum";

export class Stats {
    public str: number = 0;
    public int: number = 0;
    public dex: number = 0;
    public will: number = 0;
    public memory: number = 0;
    public luck: number = 0;

    constructor(init: Stats) {
        if (!init) {
            return;
        }
        Object.assign(this, init);
    }
}

const statCap = 650;

export function isValidStats(input: Stats) {
    const statsAreNegative = some(input, property => {
        return property < 0;
    });

    const statsAreBelowMax = sum(values(input)) <= statCap;

    return !statsAreNegative && statsAreBelowMax;
}
