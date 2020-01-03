import { Houseguest, GameState, nonEvictedHouseguests, inJury, exclude } from "../../model";
import { favouriteIndex, relationship, lowestScore, hitList, heroShouldTargetSuperiors } from "./aiUtils";
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

function cutthroatVoteJury(hero: Houseguest, nominees: Houseguest[], gameState: GameState): NumberWithLogic {
    const nom0 = nominees[0];
    const nom1 = nominees[1];
    const zeroIsInferior = !hero.superiors.has(nom0.id);
    const oneIsInferior = !hero.superiors.has(nom1.id);
    // if there is no sup/inf difference, no point in doing special logic for it
    if (zeroIsInferior === oneIsInferior) {
        return cutthroatVote(hero, nominees);
    }
    // Don't evict the last person in the game you can beat
    if (gameState.remainingPlayers - hero.superiors.size - 1 === 1 && (zeroIsInferior || oneIsInferior)) {
        const nonVote = zeroIsInferior ? 0 : 1;
        return {
            decision: zeroIsInferior ? 1 : 0,
            reason: `I can't evict ${nominees[nonVote].name}, because they are the last person I can beat.`
        };
    }
    const target = heroShouldTargetSuperiors(hero, gameState) === oneIsInferior ? 0 : 1;
    const nonTarget = target ? 0 : 1;
    const excuse = heroShouldTargetSuperiors(hero, gameState)
        ? `I can't beat ${nominees[target].name} in the end.`
        : `I need to keep ${nominees[nonTarget].name} around as a shield.`;
    const targetIsFriend =
        classifyRelationship(
            hero.popularity,
            nominees[target].popularity,
            hero.relationships[nominees[target].id]
        ) === Relationship.Friend;
    const nonTargetIsNonFriend =
        classifyRelationship(
            hero.popularity,
            nominees[nonTarget].popularity,
            hero.relationships[nominees[nonTarget].id]
        ) !== Relationship.Friend;
    const nonTargetIsFriend = !nonTargetIsNonFriend;
    const targetIsNonFriend = !targetIsFriend;
    // the only reason to not evict your target is if he is your only friend on the block
    if (targetIsFriend && nonTargetIsNonFriend) {
        return { decision: nonTarget, reason: `${nominees[nonTarget].name} is my enemy.` };
    } else if (targetIsFriend && nonTargetIsFriend) {
        return { decision: target, reason: `Both noms are my friends, but ${excuse}` };
    } else if (targetIsNonFriend && nonTargetIsNonFriend) {
        return { decision: target, reason: `Neither of the noms are my friends, but ${excuse}` };
    } else {
        return { decision: target, reason: `${excuse}` };
    }
}

// TODO: only works for 2 nominees
function cutthroatVote(hero: Houseguest, nominees: Houseguest[]): NumberWithLogic {
    const nom0 = nominees[0];
    const nom1 = nominees[1];
    const r0 = classifyRelationship(hero.popularity, nom0.popularity, hero.relationships[nom0.id]);
    const r1 = classifyRelationship(hero.popularity, nom1.popularity, hero.relationships[nom1.id]);
    if (r0 === Relationship.Enemy && r1 === Relationship.Enemy) {
        return {
            decision: nom0.popularity > nom1.popularity ? 0 : 1,
            reason: "Both noms are my enemies, so I voted for the more popular one."
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
        reason: `Both noms are my friends. but I like ${nominees[vote === 0 ? 1 : 0].name} more.`
    };
}

// TODO: target and pawn based nominations, different pre and post jury.
export function nominateNPlayers(
    hero: Houseguest,
    options: Houseguest[],
    gameState: GameState,
    n: number
): NumberWithLogic[] {
    const result: NumberWithLogic[] = [];
    const hitlist = hitList(hero, options, gameState);
    let trueOptions = options.filter(hg => hitlist.has(hg.id));
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
            trueOptions = options.filter(hg => !hitlist.has(hg.id));
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
        if (inJury(gameState)) {
            result = useGoldenVetoPostJury(hero, nominees, gameState);
        } else {
            result = useGoldenVetoPreJury(hero, nominees);
        }
        if (nonEvictedHouseguests(gameState).length === 4) {
            result = {
                decision: null,
                reason: "It doesn't make sense to use the veto here."
            };
        }
    }
    return result || null;
}

// works with any number of nominees
function useGoldenVetoPostJury(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState
): HouseguestWithLogic {
    let save = -1;
    let reason = "No reason specified.";
    let potentialSave: Houseguest | null = null;
    let alwaysSave: Houseguest | null = null;
    // identify potential save targets
    nominees.forEach((nominee: Houseguest) => {
        const relationship = classifyRelationship(
            hero.popularity,
            nominee.popularity,
            hero.relationships[nominee.id]
        );
        const shouldTargetSuperiors = heroShouldTargetSuperiors(hero, gameState);
        const nomineeIsSuperior: boolean = hero.superiors.has(nominee.id);
        // always save the last person you can beat
        if (gameState.remainingPlayers - hero.superiors.size - 1 === 1 && !nomineeIsSuperior) {
            alwaysSave = nominee;
            reason = `I have to save ${nominee.name}, because they are the last person I can beat.`;
        }
        // must be a friend and a non-target
        // TODO: some people have the entire game as targets. they shouldn't be affected. --------------------------
        if (relationship === Relationship.Friend && nomineeIsSuperior !== shouldTargetSuperiors) {
            const excuse = heroShouldTargetSuperiors(hero, gameState)
                ? `I can beat them in the end.`
                : `I need to keep them around as a shield.`;
            if (potentialSave) {
                potentialSave =
                    hero.relationshipWith(nominee) > hero.relationshipWith(potentialSave)
                        ? nominee
                        : potentialSave;
            } else {
                reason = `${nominee.name} is my friend, and ${excuse} `;
                potentialSave = nominee;
            }
        }
    });
    if (alwaysSave) {
        return { decision: alwaysSave, reason };
    } else if (potentialSave) {
        return { decision: potentialSave, reason };
    } else {
        return { decision: null, reason: "Not sure what to put here yet." };
    }
}

// TODO: only save your top 25% of friends. but if you have very few friends, save all your friends.
function useGoldenVetoPreJury(hero: Houseguest, nominees: Houseguest[]): HouseguestWithLogic {
    let save = -1;
    let reason = "Neither of these nominees are my friends.";
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
        reason = `${nominees[0].name} is my friend.`;
    } else if (rel1 === Relationship.Friend && rel0 !== Relationship.Friend) {
        save = 1;
        reason = `${nominees[1].name} is my friend.`;
    } else if (rel0 === Relationship.Friend && rel1 === Relationship.Friend) {
        save = Math.max(nominees[0].popularity, nominees[1].popularity) === nominees[0].popularity ? 0 : 1;
        reason = `Both nominees are my friends, but I like ${nominees[save].name} more.`;
    }
    return { decision: nominees[save], reason };
}

export function castJuryVote(juror: Houseguest, finalists: Houseguest[]): number {
    return favouriteIndex(juror, finalists);
}
