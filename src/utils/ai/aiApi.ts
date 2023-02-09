import { max } from "lodash";
import { Houseguest, GameState, exclude, inJury } from "../../model";
import { rng } from "../BbRandomGenerator";
import { shouldKillNew, selectTargetWithLogic } from "./targets";

export interface NumberWithLogic {
    decision: number;
    reason: string;
}

export interface HouseguestWithLogic {
    decision: Houseguest | null;
    reason: string;
}

function getIndexFromLogic(nominees: Houseguest[], logic: NumberWithLogic): NumberWithLogic {
    for (let i = 0; i < nominees.length; i++) {
        if (nominees[i].id === logic.decision) {
            return { decision: i, reason: logic.reason };
        }
    }
    throw new Error(`Attempted to vote for a nominee that was not an option.`);
}

// Return the index of the save target.
export function castVoteToSave(hero: Houseguest, nominees: Houseguest[]): NumberWithLogic {
    if (nominees.length === 0) throw new Error("Tried to cast a vote to save with no nominees.");
    const logic: NumberWithLogic = selectTargetWithLogic(
        nominees.map((hg) => hg.id),
        hero,
        "good"
    );
    return getIndexFromLogic(nominees, logic);
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
    if (gameState.remainingPlayers === 4 && inJury(gameState)) {
        // if self is in nominees, remove self from options here [causes a crash in bbAus F4]
        const filteredNoms = nominees.filter((hg) => hg.id !== hero.id);
        const HoH = exclude(
            Array.from(gameState.nonEvictedHouseguests.values()).map((id) => gameState.houseguestCache[id]),
            [filteredNoms[0], filteredNoms[1], hero]
        )[0];
        const filteredResult =
            hero.id === HoH.id
                ? castF4voteAsHoH(hero, nominees[0], nominees[1], nominees[2])
                : castF4vote(hero, filteredNoms[0], filteredNoms[1], HoH);
        const decision = nominees.findIndex((hg) => hg.id === filteredNoms[filteredResult.decision].id);
        filteredResult.decision = decision;
        return filteredResult;
    }
    const logic = selectTargetWithLogic(
        nominees.map((hg) => hg.id),
        hero,
        "bad"
    );
    return getIndexFromLogic(nominees, logic);
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

function castF4voteAsHoH(
    hero: Houseguest,
    nom0: Houseguest,
    nom1: Houseguest,
    nom2: Houseguest
): NumberWithLogic {
    const evictNom0 = winningOddsF3(hero, nom1, nom2);
    const evictNom1 = winningOddsF3(hero, nom0, nom2);
    const evictNom2 = winningOddsF3(hero, nom0, nom1);
    const winrates = [evictNom0, evictNom1, evictNom2];
    const maxWinrate = max(winrates);
    const decision = winrates.findIndex((i) => i === maxWinrate);
    return {
        decision,
        reason: `Evicting ${
            [nom0, nom1, nom2][decision].name
        } gives me better odds of making it to the end and winning.`,
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

export function getWorstTarget(hero: Houseguest, options: Houseguest[]): Houseguest {
    const sortedOptions = [...options];
    // worst target is in position 0
    sortedOptions.sort((hg1, hg2) => {
        return shouldKillNew(hg1.id, hg2.id, hero) ? -1 : 1;
    });
    if (sortedOptions.length === 0) throw "Tried to get a worst target from 0 options";
    return sortedOptions[0];
}

// returns the id of the houseguests you're backdooring
// SHOULD ONLY BE USED for nominations, because it excludes teammates
export function backdoorNPlayers(
    hero: Houseguest,
    options: Houseguest[],
    gameState: GameState,
    n: number
): NumberWithLogic[] {
    // if the number of people you are trying to backdoor is the same as your options,
    // no point in doing any logic for it (plus this fixes an edge case at F5/F4)
    if (options.length === n) {
        return options.map((hg) => ({ decision: hg.id, reason: `I am forced to nominate ${hg.name}` }));
    }
    // exclude teammates in options[], but if that gives an empty list never mind lol
    const forcedOptions = [];
    if (hero.tribe !== undefined) {
        const teammates = gameState.houseguests.filter((hg) => {
            if (hg.tribe === undefined) return false;
            return hg.tribe.tribeId === hero.tribe!.tribeId;
        });
        const nonTeammates = exclude(options, teammates);
        nonTeammates.length >= n && (options = nonTeammates);
        // you are forced to nominate non-teammates along side some teammates here
        if (nonTeammates.length < n && nonTeammates.length > 0) {
            forcedOptions.push(...nonTeammates);
            options = exclude(options, nonTeammates);
        }
    }
    if (options.length < n) throw new Error(`Tried to backdoor ${n} players with ${options.length} options.`);
    const result: NumberWithLogic[] = [];
    for (let option of forcedOptions) {
        result.push({
            decision: option.id,
            reason: `I am forced to nominate ${option.name}`,
        });
    }
    const sortedOptions = [...options];
    // negative value if first is less than second
    sortedOptions.sort((hg1, hg2) => {
        return shouldKillNew(hg1.id, hg2.id, hero) ? 1 : -1;
    });

    while (result.length < n) {
        const decision = sortedOptions[result.length];
        const reason = "";
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

// only works with 2 finalists, FIXME: make this work for 3+ finalists, by having the juror only vote between their top 2 choices.
export function castJuryVote(juror: Houseguest, finalists: Houseguest[]): number {
    const choice = Math.abs(rng().randomFloat());
    return choice > pJurorVotesForHero(juror, finalists[0], finalists[1]) ? 1 : 0;
}
