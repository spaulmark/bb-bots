export class PowerRanking {
    readonly beats: number;
    readonly outOf: number;
    get toFloat(): number {
        return this.beats / this.outOf;
    }

    constructor(beats: number, outOf: number) {
        if (outOf === 0) throw new Error("Power ranking attempted to divide by zero");
        this.beats = beats;
        this.outOf = outOf;
    }
}
