import { Houseguest, GameState, nonEvictedHouseguests, inJury } from "../../model";
import { favouriteIndex, relationship, lowestScore, hitList } from "./aiUtils";
import { classifyRelationship, RelationshipType as Relationship } from "./classifyRelationship";

// Return the index of the eviction target.
export function castEvictionVote(hero: Houseguest, nominees: Houseguest[], gameState: GameState): number {
    const nom0 = nominees[0];
    const nom1 = nominees[1];
    const r0 = classifyRelationship(hero.popularity, nom0.popularity, hero.relationships[nom0.id]);
    const r1 = classifyRelationship(hero.popularity, nom1.popularity, hero.relationships[nom1.id]);
    // TODO: better jury logic
    if (inJury(gameState)) {
        const targets = hitList(hero, nominees, gameState);
        // TODO: better jury logic, take into account friends and everything. after power rankings view
        if (targets.size === 1) {
            return targets.values().next().value === nom0.id ? 0 : 1;
        }
        return lowestScore(hero, nominees, relationship);
    }
    if (r0 === Relationship.Enemy && r1 === Relationship.Enemy) {
        return nom0.popularity > nom1.popularity ? 0 : 1;
    } else if (
        (r0 === Relationship.Enemy && r1 !== Relationship.Enemy) ||
        (r0 !== Relationship.Friend && r1 === Relationship.Friend)
    ) {
        return 0;
    } else if (
        (r1 === Relationship.Enemy && r0 !== Relationship.Enemy) ||
        (r1 !== Relationship.Friend && r0 === Relationship.Friend)
    ) {
        return 1;
    }
    return lowestScore(hero, nominees, relationship);
}

export function nominatePlayer(hero: Houseguest, options: Houseguest[], gameState: GameState): number {
    // TODO: target and pawn based nominations, different pre and post jury. requires refactoring (nominate N players)
    const hitlist = hitList(hero, options, gameState);
    let trueOptions = options.filter(hg => hitlist.has(hg.id));
    if (trueOptions.length === 0) {
        // if there are no options, we must sadly deviate from the hit list
        trueOptions = options;
    }
    return trueOptions[lowestScore(hero, trueOptions, relationship)].id;
}
export function useGoldenVeto(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState
): Houseguest | null {
    let povTarget: Houseguest | null = null;
    if (hero.id == nominees[0].id || hero.id == nominees[1].id) {
        povTarget = hero;
    } else {
        if (inJury(gameState)) {
            // TODO: jury logic goes right here once we're ready
            povTarget = useGoldenVetoPreJury(hero, nominees);
        } else {
            povTarget = useGoldenVetoPreJury(hero, nominees);
        }
        if (nonEvictedHouseguests(gameState).length === 4) {
            povTarget = null;
        }
    }
    return povTarget || null;
}

function useGoldenVetoPreJury(hero: Houseguest, nominees: Houseguest[]) {
    let save = -1;
    const rel0 = classifyRelationship(
        hero.popularity,
        nominees[0].popularity,
        hero.relationshipWith(nominees[0])
    );
    const rel1 = classifyRelationship(
        hero.popularity,
        nominees[1].popularity,
        hero.relationshipWith(nominees[1])
    );
    // basic logic that only saves friends. Doesn't take into account jury stuff.
    if (rel0 === Relationship.Friend && rel1 !== Relationship.Friend) {
        save = 0;
    } else if (rel1 === Relationship.Friend && rel0 !== Relationship.Friend) {
        save = 1;
    } else if (rel0 === Relationship.Friend && rel1 === Relationship.Friend) {
        save = Math.max(nominees[0].popularity, nominees[1].popularity) === nominees[0].popularity ? 0 : 1;
    }

    return nominees[save];
}

export function castJuryVote(juror: Houseguest, finalists: Houseguest[]): number {
    return favouriteIndex(juror, finalists);
}
