import { exclude, GameState, getById, Houseguest, inJury } from "../../model";
import { backdoorNPlayers, NumberWithLogic } from "./aiApi";
import { lowestScore, relationship } from "./aiUtils";
import { classifyRelationship, classifyTwoWayRelationship, RelationshipType } from "./classifyRelationship";

// abandon all hope ye who enter here

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
    public refreshTargets(gameState: GameState, houseguests: Houseguest[]) {
        const exclusion = exclude(houseguests, [this.hg]);
        if (exclusion.length < 2) return;
        const choices = backdoorNPlayers(this.hg, exclusion, gameState, 2);
        this.firstTarget = getRelationshipSummary(this.hg, getById(gameState, choices[0].decision));
        this.secondTarget = getRelationshipSummary(this.hg, getById(gameState, choices[1].decision));
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

export function determineWinrateStrategy(hero: Houseguest): WinrateStrategy {
    if (hero.powerRanking >= 0.45) return WinrateStrategy.High;
    if (hero.powerRanking <= 1 / 3) return WinrateStrategy.Low;
    return WinrateStrategy.Medium;
}

export function determineStrategy(hero: Houseguest): TargetStrategy {
    if (hero.friends === hero.enemies) return TargetStrategy.MoR;
    return hero.friends > hero.enemies ? TargetStrategy.StatusQuo : TargetStrategy.Underdog;
}

// return the index of the better target
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
        return isBetterTargetUnderdog(old, neww, gameState, hero, winrateStrategy);
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

function voteBasedOnCentrality(
    gameState: GameState,
    internalCallback: (x: RelationshipType) => boolean
): (hero: Houseguest, nominees: [RelationshipSummary, RelationshipSummary]) => NumberWithLogic {
    return (hero: Houseguest, nominees: [RelationshipSummary, RelationshipSummary]): NumberWithLogic => {
        const decision = isMoreCentral(hero, nominees[0], nominees[1], gameState, internalCallback) ? 1 : 0;
        return {
            decision,
            reason: `${[nominees[0], nominees[1]][decision].villianName} is more popular among my enemies.`,
        };
    };
}

function targetEnemies(
    hero: Houseguest,
    old: RelationshipSummary,
    neww: RelationshipSummary,
    callback: (
        hero: Houseguest,
        nominees: [RelationshipSummary, RelationshipSummary],
        callback?: (hero: Houseguest, nominees: [RelationshipSummary, RelationshipSummary]) => NumberWithLogic
    ) => NumberWithLogic
): NumberWithLogic {
    if (old.type !== RelationshipType.Enemy) return _targetEnemies();
    if (neww.type !== RelationshipType.Enemy)
        return { decision: 0, reason: `${old.villianName} is my enemy.` };
    return callback(hero, [old, neww]);

    function _targetEnemies() {
        const decision = (neww.type === RelationshipType.Enemy ? true : neww.relationship < old.relationship)
            ? 1
            : 0;
        return {
            decision,
            reason: `I like ${[old, neww][decision].villianName} the least of these noms.`,
        };
    }
}

const morStrategy = (x: RelationshipType) => x === RelationshipType.Enemy;
function isBetterTargetMoR(
    old: RelationshipSummary,
    neww: RelationshipSummary,
    gameState: GameState,
    hero: Houseguest,
    winrateStrategy: WinrateStrategy
): NumberWithLogic {
    if (winrateStrategy === WinrateStrategy.High || !inJury(gameState)) {
        // prioritize targeting enemies, break ties based on enemy centrality
        return targetEnemies(hero, old, neww, voteBasedOnCentrality(gameState, morStrategy));
    } else if (winrateStrategy === WinrateStrategy.Medium) {
        // prioritize targeting enemies, break ties based on if i can beat them, then break further ties based on centrality
        return targetEnemies(hero, old, neww, (hero, [old, neww]) =>
            voteBasedonWinrate(hero, old, neww, voteBasedOnCentrality(gameState, morStrategy))
        );
    } else {
        // prioritize targeting high winrate, break ties based on friend/enemy status, then centrality
        return voteBasedonWinrate(hero, old, neww, (hero, [old, neww]) =>
            targetEnemies(hero, old, neww, voteBasedOnCentrality(gameState, morStrategy))
        );
    }
}

const underdogStrategy = (x: RelationshipType) => x !== RelationshipType.Friend;
function isBetterTargetUnderdog(
    old: RelationshipSummary,
    neww: RelationshipSummary,
    gameState: GameState,
    hero: Houseguest,
    winrateStrategy: WinrateStrategy
): NumberWithLogic {
    if (winrateStrategy === WinrateStrategy.High || !inJury(gameState)) {
        // prioritize targeting enemies, break ties based on enemy centrality
        return targetEnemies(hero, old, neww, voteBasedOnCentrality(gameState, underdogStrategy));
    } else if (winrateStrategy === WinrateStrategy.Medium) {
        // prioritize targeting enemies, break ties based on if i can beat them, then break further ties based on centrality
        return targetEnemies(hero, old, neww, (hero, [old, neww]) =>
            voteBasedonWinrate(hero, old, neww, voteBasedOnCentrality(gameState, underdogStrategy))
        );
    } else {
        // prioritize targeting high winrate, break ties based on friend/enemy status, then centrality
        return voteBasedonWinrate(hero, old, neww, (hero, [old, neww]) =>
            targetEnemies(hero, old, neww, voteBasedOnCentrality(gameState, underdogStrategy))
        );
    }
}

// returns true if neww is more central than old
function isMoreCentral(
    hero: Houseguest,
    old: RelationshipSummary,
    neww: RelationshipSummary,
    gameState: GameState,
    condition: (x: RelationshipType) => boolean
): boolean {
    const oldHg: Houseguest = getById(gameState, old.id);
    const newHg: Houseguest = getById(gameState, neww.id);

    const oldPop = computeLocalPopularity(gameState, condition, hero, oldHg);
    const newPop = computeLocalPopularity(gameState, condition, hero, newHg);
    return oldPop < newPop;
}

function computeLocalPopularity(
    gameState: GameState,
    condition: (x: RelationshipType) => boolean,
    hero: Houseguest,
    villian: Houseguest
) {
    const matches: Houseguest[] = Array.from(gameState.nonEvictedHouseguests)
        .map((hg) => getById(gameState, hg))
        .filter(
            (villain) =>
                condition(
                    classifyRelationship(hero.popularity, villain.popularity, hero.relationshipWith(villain))
                ) && hero.id !== villain.id
        );
    let pop: number = 0;
    let matchCount: number = 0;
    matches.forEach((hg) => {
        if (hg.id !== villian.id) {
            matchCount++;
            pop += villian.relationshipWith(hg);
        }
    });
    return pop / matchCount;
}

export function computeEnemyCentrality(gameState: GameState, hero: Houseguest, villian: Houseguest): number {
    return computeLocalPopularity(gameState, morStrategy, hero, villian);
}
export function computeNonfriendCentrality(
    gameState: GameState,
    hero: Houseguest,
    villian: Houseguest
): number {
    return computeLocalPopularity(gameState, underdogStrategy, hero, villian);
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
        return r0 === r1
            ? voteBasedonWinrate(hero, old, neww, voteBasedOnRelationship)
            : voteBasedOnRelationship(hero, [old, neww]);
    } else {
        return voteBasedonWinrate(hero, old, neww, voteBasedOnRelationship);
    }
}

function voteBasedonWinrate(
    hero: Houseguest,
    nom0: RelationshipSummary,
    nom1: RelationshipSummary,
    callback: (hero: Houseguest, nominees: [RelationshipSummary, RelationshipSummary]) => NumberWithLogic
): NumberWithLogic {
    const heroBeatsnom0 = hero.powerRanking < hero.superiors[nom0.id];
    const heroBeatsnom1 = hero.powerRanking < hero.superiors[nom1.id];
    // if i am voting between 2 people who i can't beat, vote based on callback
    if (!heroBeatsnom0 && !heroBeatsnom1) {
        return callback(hero, [nom0, nom1]);
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
