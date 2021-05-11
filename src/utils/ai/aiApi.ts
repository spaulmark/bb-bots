import { Houseguest, GameState, inJury, exclude } from "../../model";
import { rng } from "../BbRandomGenerator";
import { relationship, lowestScore, heroShouldTargetSuperiors } from "./aiUtils";
import { classifyRelationship, RelationshipType as Relationship } from "./classifyRelationship";
import { getRelationshipSummary, isBetterTarget } from "./targets";

interface NumberWithLogic {
    decision: number;
    reason: string;
}

interface HouseguestWithLogic {
    decision: Houseguest | null;
    reason: string;
}

// Return the index of the eviction target.
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

function winningOddsF3(hero: Houseguest, villain1: Houseguest, villain2: Houseguest): number {
    // chance that hero wins final HoH
    const heroVs1: number = hero.superiors[villain1.id];
    const heroVs2: number = hero.superiors[villain2.id];
    const v1Vs2: number = villain1.superiors[villain2.id];

    if (heroVs1 === undefined)
        throw new Error(
            `Tried to get a power comparison that does not exist between ${hero.name} and ${villain1.name} [1]`
        );
    if (heroVs2 === undefined)
        throw new Error(
            `Tried to get a power comparison that does not exist between ${hero.name} and ${villain2.name} [2]`
        );
    if (v1Vs2 === undefined)
        throw new Error(
            `Tried to get a power comparison that does not exist between ${villain1.name} and ${villain2.name} [3]`
        );
    const heroWins: number = Math.max(heroVs1, heroVs2); // evict the person who beats you more often
    const v1wins: number = castF3Vote(villain1, hero, villain2).decision === 0 ? 0 : heroVs1;
    const v2wins: number = castF3Vote(villain2, hero, villain1).decision === 0 ? 0 : heroVs2;
    return (1 / 3) * heroWins + (1 / 3) * v1wins + (1 / 3) * v2wins;
}

function castF3Vote(hero: Houseguest, nom0: Houseguest, nom1: Houseguest): NumberWithLogic {
    const decision = hero.superiors[nom0.id] < hero.superiors[nom1.id] ? 0 : 1;
    return {
        decision,
        reason: `I have better odds of beating ${decision ? nom0.name : nom1.name} in the final 2.`,
    };
}

function castF4vote(hero: Houseguest, nom0: Houseguest, nom1: Houseguest, HoH: Houseguest): NumberWithLogic {
    const evictNom0 = winningOddsF3(hero, nom1, HoH);
    const evictNom1 = winningOddsF3(hero, nom0, HoH);
    const decision = evictNom0 > evictNom1 ? 0 : 1;
    return {
        decision,
        reason: `Evicting ${
            [nom0, nom1][decision].name
        } gives me better odds of making it to the end and winning.`,
    };
}

function cutthroatVoteJury(hero: Houseguest, nominees: Houseguest[], gameState: GameState): NumberWithLogic {
    const nom0 = nominees[0];
    const nom1 = nominees[1];
    // TODO: this is the part we change btw
    const zeroIsInferior = hero.superiors[nom0.id] > MAGIC_SUPERIOR_NUMBER;
    const oneIsInferior = hero.superiors[nom1.id] > MAGIC_SUPERIOR_NUMBER;

    // hard-coded logic for the F4 and F3 votes

    // In the F3 vote, take the person who you have better odds against to F2
    if (gameState.remainingPlayers === 3) {
        return castF3Vote(hero, nom0, nom1);
    }
    // In the F4 vote, do some genius level mathematics to predict what gives you the best odds of winning given that the
    // person who wins the F3 HoH will evict the person they have the worst odds against
    if (gameState.remainingPlayers === 4) {
        return castF4vote(
            hero,
            nom0,
            nom1,
            // all this work just to get the HoH...
            exclude(
                Array.from(gameState.nonEvictedHouseguests.values()).map(
                    (id) => gameState.houseguestCache[id]
                ),
                [nom0, nom1, hero]
            )[0]
        );
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

export function backdoorNPlayers(
    hero: Houseguest,
    options: Houseguest[],
    gameState: GameState,
    n: number
): NumberWithLogic[] {
    const result: NumberWithLogic[] = [];
    const sortedOptions = [...options];
    // negative value if first is less than second
    sortedOptions.sort((hg1, hg2) => {
        return isBetterTarget(
            getRelationshipSummary(hero, hg1),
            getRelationshipSummary(hero, hg2),
            hero,
            gameState
        )
            ? 1
            : -1;
    });

    while (result.length < n) {
        const decision = sortedOptions[result.length];
        const reason = "I think you are ugly";
        result.push({ decision: decision.id, reason });
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
