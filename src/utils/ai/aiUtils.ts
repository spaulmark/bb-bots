import { Houseguest } from "../../model";
import { pbincdf } from "../poissonbinomial";
import { pJurorVotesForHero } from "./aiApi";

export const relationship = (hero: Houseguest, villain: { id: number }) => hero.relationships[villain.id];

export function lowestScore<H, V>(hero: H, options: V[], callback: (hero: H, villain: V) => number) {
    let lowestIndex = 0;
    let lowestScore = Infinity;
    options.forEach((villain, i) => {
        const currentScore = callback(hero, villain);
        if (currentScore < lowestScore) {
            lowestIndex = i;
            lowestScore = currentScore;
        }
    });
    return lowestIndex;
}

// returns the probability that the hero wins the f2 between hero and villian
export function pHeroWinsTheFinale(
    hgs: { hero: Houseguest; villain: Houseguest },
    jury: Houseguest[]
): number {
    const hero = hgs.hero;
    const villain = hgs.villain;
    const p: number[] = [];
    jury.forEach((juror) => {
        if (juror.id === hero.id || juror.id === villain.id) return;
        p.push(pJurorVotesForHero(juror, hero, villain));
    });
    const cdf = pbincdf(p);
    return cdf[Math.ceil((jury.length - 2) / 2) - 1];
}
