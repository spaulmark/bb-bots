import { GameState, inJury, nonEvictedHouseguests } from "../../model/gameState";
import { Houseguest } from "../../model";
import { RelationshipType, classifyRelationshipHgs } from "./classifyRelationship";
import {
    TargetStrategy,
    WinrateStrategy,
    computeEnemyCentrality,
    computeNonfriendCentrality,
    determineTargetStrategy,
    determineWinrateStrategy,
} from "./targets";

export function generateHitList(hero: Houseguest, gameState: GameState): [number, number, string][] {
    const list: [number, number, string][] = [];
    const s = (a: any, b: any) => a[1] - b[1];
    const targetStrategy: TargetStrategy = determineTargetStrategy(hero);

    const winrateStrategy: WinrateStrategy = !inJury(gameState)
        ? WinrateStrategy.High
        : determineWinrateStrategy(hero);

    if (winrateStrategy === WinrateStrategy.High) {
        if (targetStrategy === TargetStrategy.MoR)
            return generateHitList_high_MoR(list, hero, gameState).sort(s);
        if (targetStrategy === TargetStrategy.Underdog)
            return generateHitList_high_underdog(list, hero, gameState).sort(s);
        return generateHitList_high_statusquo(list, hero, gameState).sort(s);
    } else if (winrateStrategy === WinrateStrategy.Medium) {
        return generateHitList_med_statusquo(list, hero, gameState).sort(s);
    } else {
        // low
    }
    return [];
}

function generateHitList_med_statusquo(
    hitList: [number, number, string][],
    hero: Houseguest,
    gameState: GameState
) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        pushWinrateWithinRelationshipTier(hitList, villian, hero);
    }
    console.log("!!!!!!!");
    return hitList;
}

function generateHitList_high_underdog(
    hitList: [number, number, string][],
    hero: Houseguest,
    gameState: GameState
) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        if (classifyRelationshipHgs(hero, villian) !== RelationshipType.Friend) {
            pushEnemyCentrailty(hitList, villian, hero, gameState, computeNonfriendCentrality);
        } else {
            pushRelationship(hitList, villian, hero);
        }
    }
    return hitList;
}
// enemies are sorted by centrailty, non-enemies are normal
function generateHitList_high_MoR(
    hitList: [number, number, string][],
    hero: Houseguest,
    gameState: GameState
) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        if (classifyRelationshipHgs(hero, villian) === RelationshipType.Enemy) {
            pushEnemyCentrailty(hitList, villian, hero, gameState, computeEnemyCentrality);
        } else {
            pushRelationship(hitList, villian, hero);
        }
    }
    return hitList;
}
function generateHitList_high_statusquo(
    hitList: [number, number, string][],
    hero: Houseguest,
    gameState: GameState
) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        pushRelationship(hitList, villian, hero);
    }
    return hitList;
}
function pushEnemyCentrailty(
    hitList: [number, number, string][],
    villian: Houseguest,
    hero: Houseguest,
    gameState: GameState,
    compareFcn: (gameState: GameState, hero: Houseguest, villian: Houseguest) => number
) {
    const enemyCap = hero.popularity;
    // we flip it to make it negative, since its something we as hero dislike
    const centrailty = -compareFcn(gameState, hero, villian);
    // do a linear transform on centrailty to have it be from -1 to enemyCap instead of from -1 to 1 /
    const centrailtyTransformed = linear_transform(centrailty, -1, 1, -1, enemyCap);
    hitList.push([villian.id, centrailtyTransformed, villian.name]);
}
function linear_transform(
    x: number,
    input_start: number,
    input_end: number,
    output_start: number,
    output_end: number
) {
    return ((x - input_start) / (input_end - input_start)) * (output_end - output_start) + output_start;
}
function pushRelationship(hitList: [number, number, string][], villian: Houseguest, hero: Houseguest) {
    hitList.push([villian.id, hero.relationshipWith(villian), villian.name]);
}

function pushWinrateWithinRelationshipTier(
    hitList: [number, number, string][],
    villian: Houseguest,
    hero: Houseguest
) {
    const relationshipType: RelationshipType = classifyRelationshipHgs(hero, villian);
    if (relationshipType !== RelationshipType.Friend) {
        // map below the enemy space
        hitList.push([
            villian.id,
            linear_transform(hero.superiors[villian.id], 0, 1, -1, hero.popularity),
            villian.name,
        ]);
    } else {
        // map above the enemy space
        hitList.push([
            villian.id,
            linear_transform(hero.superiors[villian.id], 0, 1, hero.popularity, 1),
            villian.name,
        ]);
    }
}
