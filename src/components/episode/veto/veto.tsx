import { Houseguest, GameState, exclude, getById, nonEvictedHouseguests } from "../../../model";
import { backdoorNPlayers, HouseguestWithLogic, NumberWithLogic } from "../../../utils/ai/aiApi";
import { classifyRelationship, RelationshipType } from "../../../utils/ai/classifyRelationship";
import { isBetterTarget, getRelationshipSummary } from "../../../utils/ai/targets";

export interface Veto {
    name: string;
    use: (hero: Houseguest, nominees: Houseguest[], gameState: GameState, HoH: number) => HouseguestWithLogic;
}

export const GoldenVeto: Veto = {
    name: "Golden Power of Veto",
    use: useGoldenVeto,
};

export const DiamondVeto: Veto = {
    name: "Diamond Power of Veto",
    use: useDiamondVeto,
};

export const SpotlightVeto: Veto = {
    name: "Spotlight Power of Veto",
    use: (_hero: Houseguest, _nominees: Houseguest[], _gameState: GameState, _HoH: number) => {
        throw new Error("Not implemented");
    },
};

function useGoldenVetoPreJury(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState
): HouseguestWithLogic {
    let reason = "None of these nominees are my friends.";
    let potentialSave: Houseguest | null = null;
    let alwaysSave: Houseguest | null = null;
    nominees.forEach((nominee) => {
        // TODO: Save people who you can beat in the end if you are low winrate
        const relationship = classifyRelationship(
            hero.popularity,
            nominee.popularity,
            hero.relationshipWith(nominee)
        );
        if (relationship === RelationshipType.Friend) {
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
function useGoldenVeto(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState,
    HoH: number
): HouseguestWithLogic {
    const checks = basicVetoChecks(hero, nominees, gameState, HoH);
    if (checks) return checks;

    return useGoldenVetoPreJury(hero, nominees, gameState) || null;
}

// only works with 2 nominees
function useDiamondVeto(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState,
    HoH: number
): HouseguestWithLogic {
    const checks = basicVetoChecks(hero, nominees, gameState, HoH);
    if (checks) return checks;

    // get the 2 best targets out of the pool of all options
    const idealTargets: NumberWithLogic[] = backdoorNPlayers(
        hero,
        exclude(nonEvictedHouseguests(gameState), [hero, getById(gameState, HoH)]),
        gameState,
        2
    );
    // if ideal targets is equal to nominees, do nothing
    const ids1 = idealTargets.map((n) => n.decision);
    const ids2 = nominees.map((n) => n.id);
    if ((ids1[0] === ids2[0] && ids1[1] === ids2[1]) || (ids1[0] === ids2[1] && ids1[1] === ids2[0])) {
        return {
            decision: null,
            reason: "These are my ideal nominations.",
        };
    }
    // otherwise, replace the person i least want gone
    const worseTarget: number = isBetterTarget(
        getRelationshipSummary(hero, nominees[0]),
        getRelationshipSummary(hero, nominees[1]),
        hero,
        gameState
    )
        ? 0
        : 1;

    return { decision: nominees[worseTarget], reason: "I would rather see someone else nominated." };
}

function basicVetoChecks(hero: Houseguest, nominees: Houseguest[], gameState: GameState, HoH: number) {
    if (hero.id === HoH) {
        return { decision: null, reason: "I support my original nominations." };
    }
    for (const nom of nominees) {
        if (hero.id === nom.id) return { decision: hero, reason: "I am going to save myself." };
    }
    // if you're not nominated, don't use the veto if you are the only replacement nominee
    if (gameState.remainingPlayers - 1 - nominees.length === 1) {
        return {
            decision: null,
            reason: "It doesn't make sense to use the veto here.",
        };
    }
    return null;
}
