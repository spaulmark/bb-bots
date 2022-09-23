import prand from "pure-rand";
import { BehaviorSubject } from "rxjs";
import { hashcode } from "./utilities";
import { cast$ } from "../subjects/subjects";

export class BbRandomGenerator {
    private rng: prand.RandomGenerator;

    // returns a random number between 0 and 1.
    public randomFloat(): number {
        let result: number;
        [result, this.rng] = this.rng.next();
        return result / 2147483647.0;
    }

    public randomInt(a: number, b: number): number {
        let result: number;
        [result, this.rng] = prand.uniformIntDistribution(a, b, this.rng);
        return result;
    }

    public flipCoin(): boolean {
        let result: number;
        [result, this.rng] = this.rng.next();
        return result % 2 === 0;
    }

    public seed(seed: number) {
        this.rng = prand.xorshift128plus(seed);
    }

    public constructor(seed: number) {
        this.rng = prand.xorshift128plus(seed);
    }
}

export function rng() {
    return rng$.value;
}

const rng$ = new BehaviorSubject(new BbRandomGenerator(0));

const castSub = cast$.subscribe({
    next: (cast) => {
        let castNames = "";
        cast.cast.forEach((houseguest) => (castNames += houseguest.name));
        rng$.next(new BbRandomGenerator(hashcode(castNames)));
    },
});
