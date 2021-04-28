import { Houseguest, GameState, inJury, exclude } from "../../model";
import { rng } from "../BbRandomGenerator";
import { relationship, lowestScore, hitList, heroShouldTargetSuperiors } from "./aiUtils";
import { classifyRelationship, RelationshipType as Relationship } from "./classifyRelationship";

interface NumberWithLogic {
    decision: number;
    reason: string;
}

interface HouseguestWithLogic {
    decision: Houseguest | null;
    reason: string;
}

// Return the index of the eviction target.
// TODO: this function only works for 2 houseguests despite accepting an array.
export function castEvictionVote(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState
): NumberWithLogic {
    if (inJury(gameState)) {
        return cutthroatVoteJury(hero, nominees, gameState);
    } else {
        return cutthroatVote(hero, nominees);
    }
}

export const MAGIC_SUPERIOR_NUMBER = 0.5;

function cutthroatVoteJury(hero: Houseguest, nominees: Houseguest[], gameState: GameState): NumberWithLogic {
    const nom0 = nominees[0];
    const nom1 = nominees[1];
    // TODO: this is the part we change btw
    const zeroIsInferior = hero.superiors[nom0.id] > MAGIC_SUPERIOR_NUMBER;
    const oneIsInferior = hero.superiors[nom1.id] > MAGIC_SUPERIOR_NUMBER;

    // hard-coded logic for the F4 and F3 votes
    if (gameState.remainingPlayers <= 4) {
        const decision = hero.superiors[nom0.id] < hero.superiors[nom1.id] ? 0 : 1;
        return {
            decision,
            reason: `I have better odds of beating ${decision ? nom0.name : nom1.name} in the final 2.`,
        };
    }

    // if there is no sup/inf difference, no point in doing special logic for it
    if (zeroIsInferior === oneIsInferior) {
        const r0 = classifyRelationship(hero.popularity, nom0.popularity, hero.relationships[nom0.id]);
        const r1 = classifyRelationship(hero.popularity, nom1.popularity, hero.relationships[nom1.id]);
        const decision = hero.relationships[nom0.id] < hero.relationships[nom1.id] ? 0 : 1;
        return r0 === Relationship.Enemy && r1 === Relationship.Enemy
            ? {
                  decision,
                  reason: `Both noms are my enemies, but I ${nominees[decision].name} dislike more.`,
              }
            : cutthroatVote(hero, nominees);
    }

    // Don't evict the last person in the game you can beat
    if (gameState.remainingPlayers - hero.superiors.size - 1 === 1 && (zeroIsInferior || oneIsInferior)) {
        const nonVote = zeroIsInferior ? 0 : 1;
        return {
            decision: zeroIsInferior ? 1 : 0,
            reason: `I can't evict ${nominees[nonVote].name}, because they are the last person I can beat.`,
        };
    }
    // the ultimate in omegalul technology
    if (
        heroShouldTargetSuperiors(hero, gameState) &&
        ((zeroIsInferior && !oneIsInferior) || (!zeroIsInferior && oneIsInferior))
    ) {
        const decision = zeroIsInferior ? 1 : 0;
        return {
            decision,
            reason: `I can't beat ${nominees[decision].name} in the end.`,
        };
    }
    return cutthroatVote(hero, nominees);
}

// only works for 2 nominees
function cutthroatVote(hero: Houseguest, nominees: Houseguest[]): NumberWithLogic {
    const nom0 = nominees[0];
    const nom1 = nominees[1];
    const r0 = classifyRelationship(hero.popularity, nom0.popularity, hero.relationships[nom0.id]);
    const r1 = classifyRelationship(hero.popularity, nom1.popularity, hero.relationships[nom1.id]);

    const nom0isTarget = hero.targets[0] === nom0.id || hero.targets[1] === nom0.id;
    const nom1isTarget = hero.targets[0] === nom1.id || hero.targets[1] === nom1.id;
    // KILL TARGETS FIRST
    if ((nom0isTarget && !nom1isTarget) || (nom1isTarget && !nom0isTarget)) {
        const decision = nom0isTarget ? 0 : 1;
        return {
            decision,
            reason: `I am targeting ${nominees[decision].name}.`,
        };
    }

    if (r0 === Relationship.Enemy && r1 === Relationship.Enemy) {
        return {
            decision: nom0.popularity > nom1.popularity ? 0 : 1,
            reason: "Both noms are my enemies, so I voted for the more popular one.",
        };
    } else if (
        (r0 === Relationship.Enemy && r1 !== Relationship.Enemy) ||
        (r1 === Relationship.Enemy && r0 !== Relationship.Enemy)
    ) {
        const vote = r0 === Relationship.Enemy ? 0 : 1;
        return { decision: vote, reason: `${nominees[vote].name} is my enemy.` };
    } else if (
        (r0 !== Relationship.Friend && r1 === Relationship.Friend) ||
        (r1 !== Relationship.Friend && r0 === Relationship.Friend)
    ) {
        const vote = r0 !== Relationship.Friend ? 0 : 1;
        const nonVote = vote === 0 ? 1 : 0;
        return { decision: vote, reason: `${nominees[nonVote].name} is my friend.` };
    }
    const vote = lowestScore(hero, nominees, relationship);
    return {
        decision: vote,
        reason: `Both noms are my friends. but I like ${nominees[vote === 0 ? 1 : 0].name} more.`,
    };
}

export function backdoorPlayer(
    hero: Houseguest,
    options: Houseguest[],
    gameState: GameState,
    n: number
): NumberWithLogic[] {
    const result: NumberWithLogic[] = [];
    const hitlist = hitList(hero, options, gameState);
    let trueOptions = options.filter((hg) => hitlist.has(hg.id));
    if (trueOptions.length === 0) {
        // if there are no options, we must sadly deviate from the hit list
        trueOptions = options;
    }
    while (result.length < n) {
        const decision = trueOptions[lowestScore(hero, trueOptions, relationship)];
        const reason = "I think you are ugly";
        result.push({ decision: decision.id, reason });
        trueOptions = exclude(trueOptions, [decision]);
        if (trueOptions.length === 0) {
            trueOptions = options.filter((hg) => !hitlist.has(hg.id));
        }
    }
    return result;
}

export function useGoldenVeto(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState
): HouseguestWithLogic {
    let result: HouseguestWithLogic;
    if (hero.id == nominees[0].id || hero.id == nominees[1].id) {
        result = { decision: hero, reason: "I am going to save myself." };
    } else {
        result = useGoldenVetoPreJury(hero, nominees, gameState);
        if (gameState.remainingPlayers === 4) {
            result = {
                decision: null,
                reason: "It doesn't make sense to use the veto here.",
            };
        }
    }
    return result || null;
}

function useGoldenVetoPreJury(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState
): HouseguestWithLogic {
    let reason = "Neither of these nominees are my friends.";
    let potentialSave: Houseguest | null = null;
    let alwaysSave: Houseguest | null = null;
    nominees.forEach((nominee) => {
        const nomineeIsSuperior: boolean = hero.superiors[nominee.id] > MAGIC_SUPERIOR_NUMBER;
        if (gameState.remainingPlayers - hero.superiors.size - 1 === 1 && !nomineeIsSuperior) {
            alwaysSave = nominee;
            reason = `I have to save ${nominee.name}, because they are the last person I can beat.`;
        }
        const relationship = classifyRelationship(
            hero.popularity,
            nominee.popularity,
            hero.relationshipWith(nominee)
        );
        if (relationship === Relationship.Friend) {
            if (potentialSave) {
                potentialSave =
                    hero.relationshipWith(nominee) > hero.relationshipWith(potentialSave)
                        ? nominee
                        : potentialSave;
                reason = `Of these noms, I like ${potentialSave.name} the most.`;
            } else {
                reason = `${nominee.name} is my friend.`;
                potentialSave = nominee;
            }
        }
    });
    if (alwaysSave) {
        return { decision: alwaysSave, reason };
    } else if (potentialSave) {
        return { decision: potentialSave, reason };
    } else {
        return { decision: null, reason };
    }
}

export function pJurorVotesForHero(juror: Houseguest, hero: Houseguest, villain: Houseguest): number {
    const r1 = juror.relationshipWith(hero);
    const r2 = juror.relationshipWith(villain);
    const delta = (r1 - r2) / 2;
    let result = 0.5 + delta;
    if (result > 1) result = 1;
    if (result < 0) result = 0;
    return result;
}

// Returns the index of the finalist with the highest relationship with juror
// only works with 2 finalists
export function castJuryVote(juror: Houseguest, finalists: Houseguest[]): number {
    const choice = Math.abs(rng().randomFloat());
    return choice > pJurorVotesForHero(juror, finalists[0], finalists[1]) ? 1 : 0;
}
