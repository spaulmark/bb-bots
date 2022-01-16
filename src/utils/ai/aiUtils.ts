import { Houseguest, inJury, GameState } from "../../model";
import { pbincdf } from "../poissonbinomial";
import { pJurorVotesForHero } from "./aiApi";

export const relationship = (hero: Houseguest, villain: Houseguest) => hero.relationships[villain.id];

export function favouriteIndex(hero: Houseguest, options: Houseguest[]) {
    // Return the index of the houseguest that hero has the best relationship with.
    return highestScore(hero, options, relationship);
}

function highestScore(
    hero: Houseguest,
    options: Houseguest[],
    callback: (hero: Houseguest, villain: Houseguest) => number
) {
    let highestIndex = 0;
    let highestScore = -Infinity;
    options.forEach((villain, i) => {
        const currentScore = callback(hero, villain);
        if (currentScore > highestScore) {
            highestIndex = i;
            highestScore = currentScore;
        }
    });
    return highestIndex;
}
export function lowestScore(
    hero: Houseguest,
    options: Houseguest[],
    callback: (hero: Houseguest, villain: Houseguest) => number
) {
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

export function heroShouldTargetSuperiors(hero: Houseguest, gameState: GameState): boolean {
    const opponents = gameState.remainingPlayers - 1;
    const superiors = hero.superiors.size;
    const inferiors = opponents - superiors;

    if (opponents <= 5) return true;
    return inferiors / opponents < 2 / 3;
}
