import { Houseguest } from "../../model";
import { pbincdf } from "../poissonbinomial";
import { pJurorVotesForHero } from "./aiApi";
import { classifyRelationship } from "./classifyRelationship";

export const relationship = (hero: Houseguest, villain: { id: number }) => hero.relationships[villain.id];

export const RelationshipTypeToNumber = { FRIEND: 10, ENEMY: -10, PAWN: 0, QUEEN: +5 };

export const friendship = (hero: Houseguest, villain: Houseguest) =>
    hero.relationshipWith(villain) +
    RelationshipTypeToNumber[
        classifyRelationship(hero.popularity, villain.popularity, hero.relationshipWith(villain))
    ];

export function getBestFriend(hero: Houseguest, options: Houseguest[]) {
    // take in the players and return the favourite, taking friend/enemy/nonmutual into account.
    return highestScore(hero, options, friendship);
}

export function favouriteIndex(hero: Houseguest, options: Houseguest[]) {
    // Return the index of the houseguest that hero has the highest relationship % with.
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
