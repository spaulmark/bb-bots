import _ from "lodash";
import { GameState, getById, Houseguest, inJury } from "../../model";
import { NumberWithLogic } from "./aiApi";
import { lowestScore, relationship } from "./aiUtils";
import { classifyRelationship, classifyTwoWayRelationship, RelationshipType } from "./classifyRelationship";

interface RelationshipSummary {
    type: RelationshipType;
    relationship: number;
    winrate: number;
    id: number;
    pHeroWins: number;
    villainPopularity: number;
    villianName: string;
}

const deadValue: RelationshipSummary = {
    type: RelationshipType.Friend,
    id: -123456789, // to make debugging easier :)
    pHeroWins: -1,
    winrate: -1,
    relationship: 2,
    villainPopularity: 2,
    villianName: "This is an error",
};

export function getRelationshipSummary(hero: Houseguest, villain: Houseguest): RelationshipSummary {
    const doIWin = hero.superiors[villain.id];
    const type = classifyRelationship(hero.popularity, villain.popularity, hero.relationships[villain.id]);
    return {
        id: villain.id,
        relationship: villain.relationships[hero.id],
        type,
        winrate: hero.powerRanking,
        pHeroWins: doIWin,
        villainPopularity: villain.popularity,
        villianName: villain.name,
    };
}

export class Targets {
    private firstTarget: RelationshipSummary = deadValue;
    private secondTarget: RelationshipSummary = deadValue;
    private hg: Houseguest;

    constructor(hg: Houseguest) {
        this.hg = hg;
    }

    public getTargets(): [number, number] {
        return [this.firstTarget.id, this.secondTarget.id];
    }
    public addTarget(newTarget: RelationshipSummary, gameState: GameState) {
        if (
            !(
                isBetterTarget(this.firstTarget, newTarget, this.hg, gameState) ||
                isBetterTarget(this.secondTarget, newTarget, this.hg, gameState)
            )
        )
            return;
        isBetterTarget(this.firstTarget, this.secondTarget, this.hg, gameState)
            ? (this.firstTarget = newTarget)
            : (this.secondTarget = newTarget);
    }
}

enum WinrateStrategy {
    Low,
    Medium,
    High,
}

// Statusquo goes with the status quo, underdog tries to disrupt & go after big targets, MoR goes after his personal targets
export enum TargetStrategy {
    StatusQuo,
    Underdog,
    MoR,
}

function determineWinrateStrategy(hero: Houseguest): WinrateStrategy {
    if (hero.powerRanking >= 0.45) return WinrateStrategy.High;
    if (hero.powerRanking <= 1 / 3) return WinrateStrategy.Low;
    return WinrateStrategy.Medium;
}

function determineStrategy(hero: Houseguest): TargetStrategy {
    if (hero.friends === hero.enemies) return TargetStrategy.MoR;
    return hero.friends > hero.enemies ? TargetStrategy.StatusQuo : TargetStrategy.Underdog;
}

export function isBetterTargetWithLogic(
    old: RelationshipSummary,
    neww: RelationshipSummary,
    hero: Houseguest,
    gameState: GameState
): NumberWithLogic {
    if (old.relationship === 2) return { decision: 1, reason: "remove debug value" };
    if (neww.relationship === 2) return { decision: 0, reason: "remove debug value" };
    const strategy = determineStrategy(hero);
    const winrateStrategy = determineWinrateStrategy(hero);
    if (strategy === TargetStrategy.StatusQuo)
        return isBetterTargetStatusQuo(hero, old, neww, winrateStrategy, gameState);
    else if (strategy === TargetStrategy.MoR) {
        return isBetterTargetMoR(old, neww, gameState, hero, winrateStrategy);
    } else {
        return isBetterTargetUnderdog(old, neww, gameState, hero);
    }
}

export function isBetterTarget(
    old: RelationshipSummary,
    neww: RelationshipSummary,
    hero: Houseguest,
    gameState: GameState
): boolean {
    return isBetterTargetWithLogic(old, neww, hero, gameState).decision === 1;
}

function isBetterTargetMoR(
    old: RelationshipSummary,
    neww: RelationshipSummary,
    gameState: GameState,
    hero: Houseguest,
    winrateStrategy: WinrateStrategy
): NumberWithLogic {
    // TODO: somehow we need to take winrates into account here :V

    if (winrateStrategy === WinrateStrategy.High || !inJury(gameState)) {
        // prioritize targeting central enemies, break ties based on enemy centrality
    } else if (winrateStrategy === WinrateStrategy.Medium) {
        // prioritize targeting central enemies, break ties based on winrate
    } else {
        // prioritize targeting high winrate players, break ties based on enemy centrality
    }

    // Is the old target a non-enemy? Then neww is a better target if he is an enemy, or if he's a worse non-enemy.
    if (old.type !== RelationshipType.Enemy) {
        const decision = (neww.type === RelationshipType.Enemy ? true : neww.relationship < old.relationship)
            ? 1
            : 0;
        return {
            decision,
            reason: `I like ${[old, neww][decision].villianName} the least of these noms.`,
        };
    }
    // So, the old target is an enemy? Then neww must be an enemy to be a better target.
    // If they are both enemies, the more popular enemy is a better target.
    if (neww.type !== RelationshipType.Enemy)
        return { decision: 0, reason: `${old.villianName} is my enemy.` };
    const decision = isMoreCentral(
        hero,
        old,
        neww,
        gameState,
        (x: RelationshipType) => x === RelationshipType.Enemy
    )
        ? 1
        : 0;
    return { decision, reason: `${[old, neww][decision].villianName} is a bigger threat to me.` };
}

function isBetterTargetUnderdog(
    old: RelationshipSummary,
    neww: RelationshipSummary,
    gameState: GameState,
    hero: Houseguest
): NumberWithLogic {
    // TODO: make this compliant with the winrate logic. very similar to MoR but it cares about targeting nonfriends, rather than just enemies.

    // Is the old target a friend? Then neww is a better target if he is NOT a friend, or if he's a worse friend.
    if (old.type === RelationshipType.Friend) {
        const decision = (neww.type !== RelationshipType.Friend ? true : neww.relationship < old.relationship)
            ? 1
            : 0;
        return {
            decision,
            reason: `I like ${[old, neww][decision].villianName} the least of these noms.`,
        };
    }
    // So, the old target isn't a friend? Then neww will never be a better target if he is a friend.
    if (neww.type === RelationshipType.Friend)
        return { decision: 0, reason: `${neww.villianName} is my friend.` };
    // But if neww isn't a friend, then the best target is the more central of the two non-friends.
    const decision = isMoreCentral(
        hero,
        old,
        neww,
        gameState,
        (x: RelationshipType) => x !== RelationshipType.Friend
    )
        ? 1
        : 0;
    return { decision, reason: `${[old, neww][decision].villianName} is a bigger threat to me.` };
}

// returns true if neww is more central than old
function isMoreCentral(
    hero: Houseguest,
    old: RelationshipSummary,
    neww: RelationshipSummary,
    gameState: GameState,
    condition: (x: RelationshipType) => boolean
): boolean {
    let { oldPop, newPop }: { oldPop: number; newPop: number } = computeLocalPopularity(
        gameState,
        hero,
        old,
        neww,
        condition
    );
    return oldPop < newPop;
}

// computes the popularity of houseguests old and neww,
// only taking into account houseguests that have relationship type x with hero
// satisfying the boolean condition you pass in
function computeLocalPopularity(
    gameState: GameState,
    hero: Houseguest,
    old: RelationshipSummary,
    neww: RelationshipSummary,
    condition: (x: RelationshipType) => boolean
) {
    const nonFriends: Houseguest[] = Array.from(gameState.nonEvictedHouseguests)
        .map((hg) => getById(gameState, hg))
        .filter(
            (villain) =>
                condition(
                    classifyRelationship(hero.popularity, villain.popularity, hero.relationshipWith(villain))
                ) && hero.id !== villain.id
        );
    let oldPop: number = 0;
    const oldHg: Houseguest = getById(gameState, old.id);
    let newPop: number = 0;
    const newHg: Houseguest = getById(gameState, neww.id);
    nonFriends.forEach((hg) => {
        if (hg.id !== oldHg.id) {
            oldPop += oldHg.relationshipWith(hg);
        }
        if (hg.id !== newHg.id) {
            newPop += newHg.relationshipWith(hg);
        }
    });
    return { oldPop, newPop };
}

function isBetterTargetStatusQuo(
    hero: Houseguest,
    old: RelationshipSummary,
    neww: RelationshipSummary,
    winrateStrategy: WinrateStrategy,
    gameState: GameState
): NumberWithLogic {
    if (winrateStrategy === WinrateStrategy.High || !inJury(gameState)) {
        return voteBasedOnRelationship(hero, [old, neww]);
    } else if (winrateStrategy === WinrateStrategy.Medium) {
        // with a sort of low winrate, break ties with winrate
        const r0 = classifyTwoWayRelationship(
            hero.popularity,
            old.villainPopularity,
            hero.relationships[old.id]
        );
        const r1 = classifyTwoWayRelationship(
            hero.popularity,
            neww.villainPopularity,
            hero.relationships[neww.id]
        );
        return r0 === r1 ? voteBasedonWinrate(hero, old, neww) : voteBasedOnRelationship(hero, [old, neww]);
    } else {
        return voteBasedonWinrate(hero, old, neww);
    }
}

function voteBasedonWinrate(
    hero: Houseguest,
    nom0: RelationshipSummary,
    nom1: RelationshipSummary
): NumberWithLogic {
    const heroBeatsnom0 = hero.powerRanking < hero.superiors[nom0.id];
    const heroBeatsnom1 = hero.powerRanking < hero.superiors[nom1.id];
    // if i am voting between 2 people who i can't beat, vote based on relationship
    // TODO: this should be a customizable callback that is either votebasedonrelationship or votebasedonenemycentrality
    if (!heroBeatsnom0 && !heroBeatsnom1) {
        return voteBasedOnRelationship(hero, [nom0, nom1]);
    }
    // otherwise, vote based on winrate
    const decision = hero.superiors[nom0.id] < hero.superiors[nom1.id] ? 0 : 1;
    return {
        decision,
        reason: `I can't beat ${[nom0, nom1][decision].villianName} in the end.`,
    };
}

// returns the index (0 or 1) of the vote
// formerly known as cutthroatVote
function voteBasedOnRelationship(
    hero: Houseguest,
    nominees: [RelationshipSummary, RelationshipSummary]
): NumberWithLogic {
    const nom0 = nominees[0];
    const nom1 = nominees[1];
    const r0 = classifyRelationship(hero.popularity, nom0.villainPopularity, hero.relationships[nom0.id]);
    const r1 = classifyRelationship(hero.popularity, nom1.villainPopularity, hero.relationships[nom1.id]);

    const nom0isTarget = hero.targets[0] === nom0.id || hero.targets[1] === nom0.id;
    const nom1isTarget = hero.targets[0] === nom1.id || hero.targets[1] === nom1.id;
    // kill targets first
    if ((nom0isTarget && !nom1isTarget) || (nom1isTarget && !nom0isTarget)) {
        const decision = nom0isTarget ? 0 : 1;
        return {
            decision,
            reason: `I am targeting ${nominees[decision].villianName}.`,
        };
    }

    if (r0 === RelationshipType.Enemy && r1 === RelationshipType.Enemy) {
        const decision = hero.relationships[nom0.id] < hero.relationships[nom1.id] ? 0 : 1;
        return {
            decision,
            reason: `I dislike ${nominees[decision].villianName} the most of these enemies.`,
        };
    } else if (
        (r0 === RelationshipType.Enemy && r1 !== RelationshipType.Enemy) ||
        (r1 === RelationshipType.Enemy && r0 !== RelationshipType.Enemy)
    ) {
        const vote = r0 === RelationshipType.Enemy ? 0 : 1;
        return { decision: vote, reason: `${nominees[vote].villianName} is my enemy.` };
    } else if (
        (r0 !== RelationshipType.Friend && r1 === RelationshipType.Friend) ||
        (r1 !== RelationshipType.Friend && r0 === RelationshipType.Friend)
    ) {
        const vote = r0 !== RelationshipType.Friend ? 0 : 1;
        const nonVote = vote === 0 ? 1 : 0;
        return { decision: vote, reason: `${nominees[nonVote].villianName} is my friend.` };
    }
    const vote = lowestScore(hero, nominees, relationship);
    return {
        decision: vote,
        reason: `I like ${nominees[vote === 0 ? 1 : 0].villianName} the most of these noms.`,
    };
}
