import { GameState, Houseguest, inJury } from "../../model";
import { MAGIC_SUPERIOR_NUMBER } from "./aiApi";
import { heroShouldTargetSuperiors } from "./aiUtils";
import { classifyRelationship, RelationshipType } from "./classifyRelationship";

interface RelationshipSummary {
    type: RelationshipType;
    relationship: number;
    id: number;
    doIWin: boolean;
}

const deadValue: RelationshipSummary = {
    type: RelationshipType.Friend,
    id: -1,
    doIWin: true,
    relationship: 2,
};

export function getRelationshipSummary(hero: Houseguest, villain: Houseguest): RelationshipSummary {
    const doIWin = !(hero.superiors[villain.id] > MAGIC_SUPERIOR_NUMBER);
    const type = classifyRelationship(hero.popularity, villain.popularity, hero.relationshipWith(villain));
    return { id: villain.id, relationship: villain.relationshipWith(hero), type, doIWin };
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

export function isBetterTarget(
    old: RelationshipSummary,
    neww: RelationshipSummary,
    hg: Houseguest,
    gameState: GameState
): boolean {
    return isBetterTargetPostJury(old, neww, inJury(gameState) && heroShouldTargetSuperiors(hg, gameState));
}

function isBetterTargetPostJury(old: RelationshipSummary, neww: RelationshipSummary, jury: boolean) {
    if (old.relationship === 2) return true;
    const newRank = rankRelationshipSummary(neww, jury);
    const oldRank = rankRelationshipSummary(old, jury);
    if (newRank > oldRank) return false;
    if (newRank < oldRank) return true;
    return neww.relationship < old.relationship;
}

// when "jury" is FALSE, the r.doIWin condition is ignored, since !jury is always true.
// This enables people who are at the top of the game to target people below them and play based on relationships.
function rankRelationshipSummary(r: RelationshipSummary, jury: boolean): number {
    if (r.type === RelationshipType.Enemy) return r.doIWin || !jury ? 4 : 1;
    if (r.type === RelationshipType.Friend) return r.doIWin || !jury ? 6 : 3;
    return r.doIWin || !jury ? 5 : 2;
}
