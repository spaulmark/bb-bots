import { GameState, nonEvictedHouseguests } from "../../model/gameState";
import { Houseguest } from "../../model";
import { RelationshipType, classifyRelationshipHgs } from "./classifyRelationship";
import { TargetStrategy, WinrateStrategy, computeEnemyCentrality } from "./targets";
import { linear_transform } from "../utilities";

export interface HitListEntry {
    id: number;
    value: number;
    name: string;
}

export function getFromHitlist(hitList: HitListEntry[], id: number): HitListEntry {
    for (const entry of hitList) {
        if (entry.id === id) return entry;
    }
    throw new Error(`getFromHitlist: ${id} not found in hitlist`);
}

export function determineWinrateStrategy(hero: Houseguest): WinrateStrategy {
    if (hero.powerRanking <= 0) return WinrateStrategy.High; // For pre-jury gameplay, or people who are drawing 100% dead
    if (hero.powerRanking >= 0.45) return WinrateStrategy.High;
    if (hero.powerRanking <= 1 / 3) return WinrateStrategy.Low;
    return WinrateStrategy.Medium;
}

export function determineTargetStrategy(hero: Houseguest): TargetStrategy {
    return hero.friends > hero.enemies ? TargetStrategy.StatusQuo : TargetStrategy.Underdog;
}

export function generateHitList(hero: Houseguest, gameState: GameState): HitListEntry[] {
    const list: HitListEntry[] = [];
    const s = (a: any, b: any) => a.value - b.value;
    const targetStrategy: TargetStrategy = determineTargetStrategy(hero);

    const winrateStrategy: WinrateStrategy = determineWinrateStrategy(hero);

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

// low statusquo: vote solely based on winrate
function generateHitList_low_statusquo(hitList: HitListEntry[], hero: Houseguest, gameState: GameState) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        pushWinrate(hitList, villian, hero);
    }
    return hitList;
}

// low underdog: {enemies i can't beat, sorted by centrality} {friends i can't beat, by rel.} {enemies i can beat, by centrality} {friends i can beat, by rel.}
function generateHitList_low_underdog(hitList: HitListEntry[], hero: Houseguest, gameState: GameState) {
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
            hitList.push({ id: villian.id, value, name: villian.name });
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
            hitList.push({ id: villian.id, value, name: villian.name });
        }
    }
    return hitList;
}

// med underdog: {enemies i can't beat; by cent.} {enemies i can beat; by cent.} {friends i can't beat; by rel} {friends i can beat; by rel}
function generateHitList_med_underdog(hitList: HitListEntry[], hero: Houseguest, gameState: GameState) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        const heroWins: boolean = hero.superiors[villian.id] > hero.powerRanking;
        const isFriend: boolean = classifyRelationshipHgs(hero, villian) === RelationshipType.Friend;
        if (isFriend) {
            const midpoint = (hero.popularity + 1) / 2;
            const output_start = heroWins ? midpoint : hero.popularity;
            const output_end = heroWins ? 1 : midpoint;
            hitList.push({
                id: villian.id,
                value: linear_transform(
                    hero.relationshipWith(villian),
                    hero.popularity,
                    1,
                    output_start,
                    output_end
                ),
                name: villian.name,
            });
        } else {
            const centrailty = -computeEnemyCentrality(gameState, hero, villian);
            const midpoint = (hero.popularity - 1) / 2;
            const output_start = heroWins ? midpoint : hero.popularity;
            const output_end = heroWins ? hero.popularity : midpoint;
            const centrailtyTransformed = linear_transform(
                centrailty,
                -1,
                hero.popularity,
                output_start,
                output_end
            );
            hitList.push({ id: villian.id, value: centrailtyTransformed, name: villian.name });
        }
    }
    return hitList;
}

// med statusquo: {enemies; by winrate.} {friends; by winrate.}
function generateHitList_med_statusquo(hitList: HitListEntry[], hero: Houseguest, gameState: GameState) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        pushWinrateWithinRelationshipTier(hitList, villian, hero);
    }
    return hitList;
}

// high underdog: {enemies by centrality} {friends by rel.}
function generateHitList_high_underdog(hitList: HitListEntry[], hero: Houseguest, gameState: GameState) {
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

// high statusquo: {all by relationship}
function generateHitList_high_statusquo(hitList: HitListEntry[], hero: Houseguest, gameState: GameState) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        pushRelationship(hitList, villian, hero);
    }
    return hitList;
}
function pushEnemyCentrailty(
    hitList: HitListEntry[],
    villian: Houseguest,
    hero: Houseguest,
    gameState: GameState
) {
    // we flip it to make it negative, since its something we as hero dislike
    const centrailty = -computeEnemyCentrality(gameState, hero, villian);
    const value = linear_transform(centrailty, -1, 1, -1, hero.popularity);
    hitList.push({ id: villian.id, value, name: villian.name });
}

function pushRelationship(hitList: HitListEntry[], villian: Houseguest, hero: Houseguest) {
    hitList.push({ id: villian.id, value: hero.relationshipWith(villian), name: villian.name });
}

function pushWinrate(hitList: HitListEntry[], villian: Houseguest, hero: Houseguest) {
    hitList.push({
        id: villian.id,
        value: linear_transform(hero.superiors[villian.id], 0, 1, -1, 1),
        name: villian.name,
    });
}

function pushWinrateWithinRelationshipTier(hitList: HitListEntry[], villian: Houseguest, hero: Houseguest) {
    const relationshipType: RelationshipType = classifyRelationshipHgs(hero, villian);
    if (relationshipType !== RelationshipType.Friend) {
        // map below the enemy space
        hitList.push({
            id: villian.id,
            value: linear_transform(hero.superiors[villian.id], 0, 1, -1, hero.popularity),
            name: villian.name,
        });
    } else {
        // map above the enemy space
        hitList.push({
            id: villian.id,
            value: linear_transform(hero.superiors[villian.id], 0, 1, hero.popularity, 1),
            name: villian.name,
        });
    }
}
