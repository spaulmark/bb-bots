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
    const reason = generateExcuse(hero, decision, options, intent);
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

// function voteBasedOnCentrality(
//     gameState: GameState,
//     internalCallback: (x: RelationshipType) => boolean
// ): (hero: Houseguest, nominees: [RelationshipSummary, RelationshipSummary]) => NumberWithLogic {
//     return (hero: Houseguest, nominees: [RelationshipSummary, RelationshipSummary]): NumberWithLogic => {
//         const decision = isMoreCentral(hero, nominees[0], nominees[1], gameState, internalCallback) ? 1 : 0;
//         return {
//             decision,
//             reason: `${[nominees[0], nominees[1]][decision].villianName} is more popular among my enemies.`,
//         };
//     };
// }

// function targetNonfriends(
//     hero: Houseguest,
//     old: RelationshipSummary,
//     neww: RelationshipSummary,
//     callback: (
//         hero: Houseguest,
//         nominees: [RelationshipSummary, RelationshipSummary],
//         callback?: (hero: Houseguest, nominees: [RelationshipSummary, RelationshipSummary]) => NumberWithLogic
//     ) => NumberWithLogic
// ): NumberWithLogic {
//     if (old.type === RelationshipType.Friend) return _targetNonfriends();
//     if (neww.type === RelationshipType.Friend)
//         return { decision: 0, reason: `${old.villianName} is not my friend.` };
//     return callback(hero, [old, neww]);

//     function _targetNonfriends() {
//         // runs if old is not an enemy -> runs if old is not an enemy or neutral
//         const decision = (neww.type !== RelationshipType.Friend ? true : neww.relationship < old.relationship)
//             ? 1
//             : 0;
//         return {
//             decision,
//             reason: `I like ${[old, neww][decision].villianName} the least of these noms.`,
//         };
//     }
// }

const underdogStrategy = (x: RelationshipType) => x !== RelationshipType.Friend;
// function isBetterTargetUnderdog(
//     old: RelationshipSummary,
//     neww: RelationshipSummary,
//     gameState: GameState,
//     hero: Houseguest,
//     winrateStrategy: WinrateStrategy
// ): NumberWithLogic {
//     if (winrateStrategy === WinrateStrategy.High || !inJury(gameState)) {
//         // prioritize targeting enemies, break ties based on enemy centrality
//         return targetNonfriends(hero, old, neww, voteBasedOnCentrality(gameState, underdogStrategy));
//     } else if (winrateStrategy === WinrateStrategy.Medium) {
//         // prioritize targeting enemies, break ties based on if i can beat them, then break further ties based on centrality
//         return targetNonfriends(hero, old, neww, (hero, [old, neww]) =>
//             voteBasedonWinrate(hero, old, neww, voteBasedOnCentrality(gameState, underdogStrategy))
//         );
//     } else {
//         // prioritize targeting high winrate, break ties based on friend/enemy status, then centrality
//         return voteBasedonWinrate(hero, old, neww, (hero, [old, neww]) =>
//             targetNonfriends(hero, old, neww, voteBasedOnCentrality(gameState, underdogStrategy))
//         );
//     }
// }

// returns true if neww is more central than old
// function isMoreCentral(
//     hero: Houseguest,
//     old: RelationshipSummary,
//     neww: RelationshipSummary,
//     gameState: GameState,
//     condition: (x: RelationshipType) => boolean
// ): boolean {
//     const oldHg: Houseguest = getById(gameState, old.id);
//     const newHg: Houseguest = getById(gameState, neww.id);

//     const oldPop = computeLocalPopularity(gameState, condition, hero, oldHg);
//     const newPop = computeLocalPopularity(gameState, condition, hero, newHg);
//     return oldPop < newPop;
// }

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
    return computeLocalPopularity(gameState, underdogStrategy, hero, villian);
}

// function isBetterTargetStatusQuo(
//     hero: Houseguest,
//     old: RelationshipSummary,
//     neww: RelationshipSummary,
//     winrateStrategy: WinrateStrategy,
//     gameState: GameState
// ): NumberWithLogic {
//     if (winrateStrategy === WinrateStrategy.High || !inJury(gameState)) {
//         return voteBasedOnRelationship(hero, [old, neww]);
//     } else if (winrateStrategy === WinrateStrategy.Medium) {
//         // with a sort of low winrate, break ties with winrate
//         const r0 = classifyTwoWayRelationship(
//             hero.popularity,
//             old.villainPopularity,
//             hero.relationships[old.id]
//         );
//         const r1 = classifyTwoWayRelationship(
//             hero.popularity,
//             neww.villainPopularity,
//             hero.relationships[neww.id]
//         );
//         return r0 === r1
//             ? voteBasedonWinrate(hero, old, neww, voteBasedOnRelationship)
//             : voteBasedOnRelationship(hero, [old, neww]);
//     } else {
//         return voteBasedonWinrate(hero, old, neww, voteBasedOnRelationship);
//     }
// }

// function voteBasedonWinrate(
//     hero: Houseguest,
//     nom0: RelationshipSummary,
//     nom1: RelationshipSummary,
//     callback: (hero: Houseguest, nominees: [RelationshipSummary, RelationshipSummary]) => NumberWithLogic
// ): NumberWithLogic {
//     const heroBeatsnom0 = hero.powerRanking < hero.superiors[nom0.id];
//     const heroBeatsnom1 = hero.powerRanking < hero.superiors[nom1.id];
//     // if i am voting between 2 people who i can't beat, vote based on callback
//     if (!heroBeatsnom0 && !heroBeatsnom1) {
//         return callback(hero, [nom0, nom1]);
//     }
//     // otherwise, vote based on winrate
//     const decision = hero.superiors[nom0.id] < hero.superiors[nom1.id] ? 0 : 1;
//     return {
//         decision,
//         reason: `I can't beat ${[nom0, nom1][decision].villianName} in the end.`,
//     };
// }

// // returns the index (0 or 1) of the vote
// // formerly known as cutthroatVote
// function voteBasedOnRelationship(
//     hero: Houseguest,
//     nominees: [RelationshipSummary, RelationshipSummary]
// ): NumberWithLogic {
//     const nom0 = nominees[0];
//     const nom1 = nominees[1];
//     const r0 = classifyRelationship(hero.popularity, nom0.villainPopularity, hero.relationships[nom0.id]);
//     const r1 = classifyRelationship(hero.popularity, nom1.villainPopularity, hero.relationships[nom1.id]);

//     if (r0 === RelationshipType.Enemy && r1 === RelationshipType.Enemy) {
//         const decision = hero.relationships[nom0.id] < hero.relationships[nom1.id] ? 0 : 1;
//         return {
//             decision,
//             reason: `I dislike ${nominees[decision].villianName} the most of these enemies.`,
//         };
//     } else if (
//         (r0 === RelationshipType.Enemy && r1 !== RelationshipType.Enemy) ||
//         (r1 === RelationshipType.Enemy && r0 !== RelationshipType.Enemy)
//     ) {
//         const vote = r0 === RelationshipType.Enemy ? 0 : 1;
//         return { decision: vote, reason: `${nominees[vote].villianName} is my enemy.` };
//     } else if (
//         (r0 !== RelationshipType.Friend && r1 === RelationshipType.Friend) ||
//         (r1 !== RelationshipType.Friend && r0 === RelationshipType.Friend)
//     ) {
//         const vote = r0 !== RelationshipType.Friend ? 0 : 1;
//         const nonVote = vote === 0 ? 1 : 0;
//         return { decision: vote, reason: `${nominees[nonVote].villianName} is my friend.` };
//     }
//     const vote = lowestScore(hero, nominees, relationship);
//     return {
//         decision: vote,
//         reason: `I like ${nominees[vote === 0 ? 1 : 0].villianName} the most of these noms.`,
//     };
// }
