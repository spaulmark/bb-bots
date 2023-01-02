import { GameState, getById, Houseguest } from "../../model";
import { NumberWithLogic } from "./aiApi";
import { classifyRelationship, RelationshipType } from "./classifyRelationship";
import { generateExcuse, Intent } from "./generateExcuse";
import { HitListEntry } from "./hitList";

export enum WinrateStrategy {
    Low,
    Medium,
    High,
}

// Statusquo goes with the status quo, underdog tries to disrupt & go after big targets
export enum TargetStrategy {
    StatusQuo,
    Underdog,
}

// returns the id of the best target
export function selectTargetWithLogic(options: number[], hero: Houseguest, intent: Intent): NumberWithLogic {
    const badIntent = intent === "bad";
    const decide = badIntent ? mostDesiredTarget : leastDesiredTarget;
    const decision = decide(hero.hitList, new Set(options)).id;
    const reason = generateExcuse(hero, decision, intent);
    return { decision, reason };
}

function mostDesiredTarget(hitList: HitListEntry[], options: Set<number>): HitListEntry {
    return hitList.filter((x) => options.has(x.id))[0];
}

function leastDesiredTarget(hitList: HitListEntry[], options: Set<number>): HitListEntry {
    const result = hitList.filter((x) => options.has(x.id));
    return result[result.length - 1];
}
// returns true if neww is less valued on the hit list than old
export function shouldKillNew(old: number, neww: number, hero: Houseguest): boolean {
    for (const hit of hero.hitList) {
        if (hit.id === old) return false;
        if (hit.id === neww) return true;
    }
    console.error(hero.hitList);
    throw new Error(`isBetterTarget: hitlist of ${hero} tried to find ${old} or ${neww} but couldn't`);
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
    return computeLocalPopularity(
        gameState,
        (x: RelationshipType) => x !== RelationshipType.Friend,
        hero,
        villian
    );
}
