import { Houseguest, GameState, nonEvictedHouseguests, inJury } from "../../model";
import { favouriteIndex, relationship, lowestScore, hitList } from "./aiUtils";
import { classifyRelationship, RelationshipType as Relationship } from "./classifyRelationship";

export function castEvictionVote(hero: Houseguest, nominees: Houseguest[], gameState: GameState): number {
    // Return the index of the eviction target.
    const nom0 = nominees[0];
    const nom1 = nominees[1];
    const r0 = classifyRelationship(hero.popularity, nom0.popularity, hero.relationships[nom0.id]);
    const r1 = classifyRelationship(hero.popularity, nom1.popularity, hero.relationships[nom1.id]);
    // TODO: better jury logic
    if (inJury(gameState)) {
        const targets = hitList(hero, nominees, gameState);
        if (targets.size === 2) {
            // TODO: logic logic logic
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
        // incredibly basic veto logic - veto people that are not a threat to me.
        // probably results in the veto almost always getting used, but can result
        // in some fun situations where someone keeps saving an unpopular friend.
        let save = -1;
        const threat0 = -relationship(hero, nominees[0]);
        const threat1 = -relationship(hero, nominees[1]);
        if (threat0 < 0 || threat1 < 0) {
            save = Math.min(threat0, threat1) === threat0 ? 0 : 1;
        }
        if (nonEvictedHouseguests(gameState).length !== 4 && save > -1) {
            povTarget = nominees[save];
        }
    }
    return povTarget;
}

export function castJuryVote(juror: Houseguest, finalists: Houseguest[]): number {
    return favouriteIndex(juror, finalists);
}
