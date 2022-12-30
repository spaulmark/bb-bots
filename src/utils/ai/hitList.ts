import { GameState, inJury, nonEvictedHouseguests } from "../../model/gameState";
import { Houseguest } from "../../model";
import { RelationshipType, classifyRelationshipHgs } from "./classifyRelationship";
import {
    TargetStrategy,
    WinrateStrategy,
    computeEnemyCentrality,
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
        if (targetStrategy === TargetStrategy.Underdog)
            return generateHitList_high_underdog(list, hero, gameState).sort(s);
        return generateHitList_high_statusquo(list, hero, gameState).sort(s);
    } else if (winrateStrategy === WinrateStrategy.Medium) {
        if (targetStrategy === TargetStrategy.Underdog)
            return generateHitList_med_underdog(list, hero, gameState).sort(s);
        return generateHitList_med_statusquo(list, hero, gameState).sort(s);
    } else {
        if (targetStrategy === TargetStrategy.Underdog)
            return generateHitList_low_underdog(list, hero, gameState).sort(s);
        return generateHitList_low_statusquo(list, hero, gameState).sort(s);
    }
}

function generateHitList_low_statusquo(
    hitList: [number, number, string][],
    hero: Houseguest,
    gameState: GameState
) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        pushWinrate(hitList, villian, hero);
    }
    return hitList;
}

function generateHitList_low_underdog(
    hitList: [number, number, string][],
    hero: Houseguest,
    gameState: GameState
) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        const heroWins: boolean = hero.superiors[villian.id] > hero.powerRanking;
        const isFriend: boolean = classifyRelationshipHgs(hero, villian) === RelationshipType.Friend;
        const friend_midpoint = (hero.popularity + 1) / 2;
        const enemy_midpoint = (hero.popularity - 1) / 2;
        if (heroWins) {
            const value = isFriend
                ? linear_transform(hero.relationshipWith(villian), hero.popularity, 1, friend_midpoint, 1)
                : linear_transform(
                      -computeEnemyCentrality(gameState, hero, villian),
                      -1,
                      1,
                      hero.popularity,
                      friend_midpoint
                  );
            hitList.push([villian.id, value, villian.name]);
        } else {
            const value = isFriend
                ? linear_transform(
                      hero.relationshipWith(villian),
                      -1,
                      hero.popularity,
                      enemy_midpoint,
                      hero.popularity
                  )
                : linear_transform(
                      -computeEnemyCentrality(gameState, hero, villian),
                      -1,
                      1,
                      -1,
                      enemy_midpoint
                  );
            hitList.push([villian.id, value, villian.name]);
        }
    }
    return hitList;
}

function generateHitList_med_underdog(
    hitList: [number, number, string][],
    hero: Houseguest,
    gameState: GameState
) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        const heroWins: boolean = hero.superiors[villian.id] > hero.powerRanking;
        const isFriend: boolean = classifyRelationshipHgs(hero, villian) === RelationshipType.Friend;
        if (isFriend) {
            const midpoint = (hero.popularity + 1) / 2;
            const output_start = heroWins ? midpoint : hero.popularity;
            const output_end = heroWins ? 1 : midpoint;
            hitList.push([
                villian.id,
                linear_transform(
                    hero.relationshipWith(villian),
                    hero.popularity,
                    1,
                    output_start,
                    output_end
                ),
                villian.name,
            ]);
        } else {
            const centrailty = -computeEnemyCentrality(gameState, hero, villian);
            const midpoint = (hero.popularity - 1) / 2;
            const output_start = heroWins ? midpoint : hero.popularity;
            const output_end = heroWins ? 1 : midpoint;
            const centrailtyTransformed = linear_transform(
                centrailty,
                -1,
                hero.popularity,
                output_start,
                output_end
            );
            hitList.push([villian.id, centrailtyTransformed, villian.name]);
        }
    }
    return hitList;
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
            pushEnemyCentrailty(hitList, villian, hero, gameState);
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
    gameState: GameState
) {
    // we flip it to make it negative, since its something we as hero dislike
    const centrailty = -computeEnemyCentrality(gameState, hero, villian);
    // do a linear transform on centrailty to have it be from -1 to enemyCap instead of from -1 to 1 /
    const centrailtyTransformed = linear_transform(centrailty, -1, 1, -1, hero.popularity);
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

function pushWinrate(hitList: [number, number, string][], villian: Houseguest, hero: Houseguest) {
    hitList.push([villian.id, linear_transform(hero.superiors[villian.id], 0, 1, -1, 1), villian.name]);
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

// TODO: here's what we're going to do. abandon targets.ts, instead make a generateExcuse() function, where given a decision and a list of hgs, and a hero,
// give an excuse for why hero made the decision. also it could be a positive or negative decision (veto/vote to save or voting someone out)  /

// TODO: also for veto, save people whom in your hit list are above your friendship threshold

// function generateReason(hero: Houseguest, , gameState: GameState) {
