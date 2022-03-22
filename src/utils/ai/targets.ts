import _ from "lodash";
import { GameState, getById, Houseguest } from "../../model";
import { classifyRelationship, RelationshipType } from "./classifyRelationship";

interface RelationshipSummary {
    type: RelationshipType;
    relationship: number;
    winrate: number;
    id: number;
    pHeroWins: number;
    villainPopularity: number;
}

const deadValue: RelationshipSummary = {
    type: RelationshipType.Friend,
    id: -1,
    pHeroWins: -1,
    winrate: -1,
    relationship: 2,
    villainPopularity: 2,
};

export function getRelationshipSummary(hero: Houseguest, villain: Houseguest): RelationshipSummary {
    const doIWin = hero.superiors[villain.id];
    const type = classifyRelationship(hero.popularity, villain.popularity, hero.relationshipWith(villain));
    return {
        id: villain.id,
        relationship: villain.relationshipWith(hero),
        type,
        winrate: hero.powerRanking,
        pHeroWins: doIWin,
        villainPopularity: villain.popularity,
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

// TODO: target strategies that account for jury winrate?

// Statusquo goes with the status quo, underdog tries to disrupt & go after big targets, MoR goes after his personal targets
export enum TargetStrategy {
    StatusQuo,
    Underdog,
    MoR,
}

function determineStrategy(hero: Houseguest): TargetStrategy {
    if (hero.friends === hero.enemies) return TargetStrategy.MoR;
    return hero.friends > hero.enemies ? TargetStrategy.StatusQuo : TargetStrategy.Underdog;
}

export function isBetterTarget(
    old: RelationshipSummary,
    neww: RelationshipSummary,
    hero: Houseguest,
    gameState: GameState
): boolean {
    if (old.relationship === 2) return true;
    const strategy = determineStrategy(hero);
    if (strategy === TargetStrategy.StatusQuo) return isBetterTargetStatusQuo(old, neww);
    else if (strategy === TargetStrategy.MoR) {
        return isBetterTargetMoR(old, neww, gameState, hero);
    } else {
        return isBetterTargetUnderdog(old, neww, gameState, hero);
    }
}

function isBetterTargetMoR(
    old: RelationshipSummary,
    neww: RelationshipSummary,
    gameState: GameState,
    hero: Houseguest
): boolean {
    // Is the old target a non-enemy? Then neww is a better target if he is an enemy, or if he's a worse non-enemy.
    if (old.type !== RelationshipType.Enemy) {
        return neww.type === RelationshipType.Enemy ? true : neww.relationship < old.relationship;
    }
    // So, the old target is an enemy? Then neww must be an enemy to be a better target.
    // If they are both enemies, the more popular enemy is a better target.
    if (neww.type !== RelationshipType.Enemy) return false;

    let { oldPop, newPop }: { oldPop: number; newPop: number } = computeLocalPopularity(
        gameState,
        hero,
        old,
        neww,
        (x: RelationshipType) => x === RelationshipType.Enemy
    );
    return oldPop < newPop;
}

function isBetterTargetUnderdog(
    old: RelationshipSummary,
    neww: RelationshipSummary,
    gameState: GameState,
    hero: Houseguest
): boolean {
    // Is the old target a friend? Then neww is a better target if he is NOT a friend, or if he's a worse friend.
    if (old.type === RelationshipType.Friend) {
        return neww.type !== RelationshipType.Friend ? true : neww.relationship < old.relationship;
    }
    // So, the old target isn't a friend? Then neww will never be a better target if he is a friend.
    if (neww.type === RelationshipType.Friend) return false;
    // But if neww isn't a friend, then the best target is the more central of the two non-friends.
    let { oldPop, newPop }: { oldPop: number; newPop: number } = computeLocalPopularity(
        gameState,
        hero,
        old,
        neww,
        (x: RelationshipType) => x !== RelationshipType.Friend
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

function isBetterTargetStatusQuo(old: RelationshipSummary, neww: RelationshipSummary) {
    const newRank = rankRelationshipSummaryStatusQuo(neww);
    const oldRank = rankRelationshipSummaryStatusQuo(old);
    if (newRank > oldRank) return false;
    if (newRank < oldRank) return true;
    return neww.relationship < old.relationship;
}

function rankRelationshipSummaryStatusQuo(r: RelationshipSummary): number {
    if (r.type === RelationshipType.Enemy) return 1;
    if (r.type === RelationshipType.Friend) return 3;
    return 2;
}
