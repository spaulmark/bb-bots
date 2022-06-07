import { Houseguest, GameState, exclude } from "../../model";
import { rng } from "../BbRandomGenerator";
import { getRelationshipSummary, isBetterTarget, isBetterTargetWithLogic } from "./targets";

export interface NumberWithLogic {
    decision: number;
    reason: string;
}

export interface HouseguestWithLogic {
    decision: Houseguest | null;
    reason: string;
}

// Return the index of the eviction target.

// vote to save, in the future, generalize this to n nominees instead of going 2 by 2
export function castVoteToSave(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState
): NumberWithLogic {
    if (nominees.length === 0) throw new Error("Tried to cast a vote to save with no nominees.");
    let currentSave: NumberWithLogic = { decision: 0, reason: "" };
    nominees.forEach((nominee, i) => {
        if (i === 0) return;
        const evictionTarget = castEvictionVote(hero, [nominee, nominees[currentSave.decision]], gameState);
        if (!currentSave.reason) {
            currentSave.reason = evictionTarget.reason;
        }
        if (evictionTarget.decision === 1) {
            currentSave = { decision: i, reason: evictionTarget.reason };
        }
    });
    return currentSave;
}

// returns the index in the array of the person you're voting to evict
export function castEvictionVote(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState
): NumberWithLogic {
    // In the F3 vote, take the person who you have better odds against to F2
    if (gameState.remainingPlayers === 3) {
        return castF3Vote(hero, nominees[0], nominees[1]);
    }
    // In the F4 vote, do some genius level mathematics to predict what gives you the best odds of winning given that the
    // person who wins the F3 HoH will evict the person they have the worst odds against
    if (gameState.remainingPlayers === 4) {
        return castF4vote(
            hero,
            nominees[0],
            nominees[1],
            // all this work just to get the HoH...
            exclude(
                Array.from(gameState.nonEvictedHouseguests.values()).map(
                    (id) => gameState.houseguestCache[id]
                ),
                [nominees[0], nominees[1], hero]
            )[0]
        );
    }
    return isBetterTargetWithLogic(
        getRelationshipSummary(hero, nominees[0]),
        getRelationshipSummary(hero, nominees[1]),
        hero,
        gameState
    );
}

function winningOddsF3(hero: Houseguest, villain1: Houseguest, villain2: Houseguest): number {
    // chance that hero wins final HoH
    const heroVs1: number = hero.superiors[villain1.id];
    const heroVs2: number = hero.superiors[villain2.id];
    const v1Vs2: number = villain1.superiors[villain2.id];

    if (heroVs1 === undefined)
        throw new Error(
            `Tried to get a power comparison that does not exist between ${hero.name} and ${villain1.name} [1]`
        );
    if (heroVs2 === undefined)
        throw new Error(
            `Tried to get a power comparison that does not exist between ${hero.name} and ${villain2.name} [2]`
        );
    if (v1Vs2 === undefined)
        throw new Error(
            `Tried to get a power comparison that does not exist between ${villain1.name} and ${villain2.name} [3]`
        );
    const heroWins: number = Math.max(heroVs1, heroVs2); // evict the person who beats you more often
    const v1wins: number = castF3Vote(villain1, hero, villain2).decision === 0 ? 0 : heroVs1;
    const v2wins: number = castF3Vote(villain2, hero, villain1).decision === 0 ? 0 : heroVs2;
    return (1 / 3) * heroWins + (1 / 3) * v1wins + (1 / 3) * v2wins;
}

function castF3Vote(hero: Houseguest, nom0: Houseguest, nom1: Houseguest): NumberWithLogic {
    const decision = hero.superiors[nom0.id] < hero.superiors[nom1.id] ? 0 : 1;
    return {
        decision,
        reason: `I have better odds of beating ${decision ? nom0.name : nom1.name} in the final 2.`,
    };
}

function castF4vote(hero: Houseguest, nom0: Houseguest, nom1: Houseguest, HoH: Houseguest): NumberWithLogic {
    const evictNom0 = winningOddsF3(hero, nom1, HoH);
    const evictNom1 = winningOddsF3(hero, nom0, HoH);
    const decision = evictNom0 > evictNom1 ? 0 : 1;
    return {
        decision,
        reason: `Evicting ${
            [nom0, nom1][decision].name
        } gives me better odds of making it to the end and winning.`,
    };
}

// only works for 2 nominees

// returns the id of the houseguests you're backdooring
export function backdoorNPlayers(
    hero: Houseguest,
    options: Houseguest[],
    gameState: GameState,
    n: number
): NumberWithLogic[] {
    const result: NumberWithLogic[] = [];
    const sortedOptions = [...options];
    // negative value if first is less than second
    sortedOptions.sort((hg1, hg2) => {
        return isBetterTarget(
            getRelationshipSummary(hero, hg1),
            getRelationshipSummary(hero, hg2),
            hero,
            gameState
        )
            ? 1
            : -1;
    });

    while (result.length < n) {
        const decision = sortedOptions[result.length];
        const reason = "I think you are ugly";
        result.push({ decision: decision.id, reason });
    }
    return result;
}

export function pJurorVotesForHero(juror: Houseguest, hero: Houseguest, villain: Houseguest): number {
    const r1 = juror.relationshipWith(hero);
    const r2 = juror.relationshipWith(villain);
    const delta = (r1 - r2) / 2;
    let result = 0.5 + delta;
    if (result > 1) result = 1;
    if (result < 0) result = 0;
    return result;
}

// Returns the index of the finalist with the highest relationship with juror
// only works with 2 finalists
export function castJuryVote(juror: Houseguest, finalists: Houseguest[]): number {
    const choice = Math.abs(rng().randomFloat());
    return choice > pJurorVotesForHero(juror, finalists[0], finalists[1]) ? 1 : 0;
}
