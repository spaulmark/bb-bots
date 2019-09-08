import { Houseguest, inJury, GameState } from "../../model";

export const relationship = (hero: Houseguest, villain: Houseguest) => hero.relationships[villain.id];

export function favouriteIndex(hero: Houseguest, options: Houseguest[]) {
    // Return the index of the houseguest that hero has the worst relationship with.
    return highestScore(hero, options, relationship);
}

export function highestScore(
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

export function doesHeroWinTheFinale(
    hgs: { hero: Houseguest; villain: Houseguest },
    jury: Houseguest[]
): boolean {
    const hero = hgs.hero;
    const villain = hgs.villain;
    let heroVotes = 0;
    let villainVotes = 0;
    jury.forEach(juror => {
        if (juror.id === hero.id || juror.id === villain.id) {
            return;
        }
        if (relationship(hero, juror) > relationship(villain, juror)) {
            heroVotes++;
        } else {
            villainVotes++;
        }
    });
    return heroVotes > villainVotes;
}

export function heroShouldTargetSuperiors(hero: Houseguest, gameState: GameState): boolean {
    const superiors = hero.superiors.size;
    const inferiors = gameState.remainingPlayers - 1 - hero.superiors.size;
    // Target the larger group. If they are equal, target superiors.
    return superiors >= inferiors;
}

// TODO: this function can just honestly die. it's only used in nomination logic (which sucks anyways)
// when I do the new logic, I think people who are dead center should target their superiors. works in F5.

export function hitList(hero: Houseguest, options: Houseguest[], gameState: GameState): Set<number> {
    let result = options;
    // jury logic is not affected by someone who is dead center in power rankings
    if (inJury(gameState) && heroShouldTargetSuperiors(hero, gameState)) {
        // TODO: logic to take into account that i never want to eliminate the last guy i can actually beat
        if (hero.superiors.size * 2 < gameState.remainingPlayers - 1) {
            result = options.filter(hg => !hero.superiors.has(hg.id));
        } else {
            result = options.filter(hg => hero.superiors.has(hg.id));
        }
    } else {
    }
    return new Set(result.map(hg => hg.id));
}
