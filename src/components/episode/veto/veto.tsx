import { every } from "lodash";
import { Houseguest, GameState, exclude, getById, nonEvictedHouseguests } from "../../../model";
import { backdoorNPlayers, HouseguestWithLogic, NumberWithLogic } from "../../../utils/ai/aiApi";
import { classifyRelationship, RelationshipType } from "../../../utils/ai/classifyRelationship";
import {
    isBetterTarget,
    getRelationshipSummary,
    isBetterTargetWithLogic,
    determineStrategy,
    TargetStrategy,
} from "../../../utils/ai/targets";

export interface Veto {
    name: string;
    emoji: string;
    use: (
        hero: Houseguest,
        nominees: Houseguest[],
        gameState: GameState,
        HoH: number,
        exclusions: Houseguest[]
    ) => HouseguestWithLogic;
}

export const GoldenVeto: Veto = {
    name: "Golden Power of Veto",
    emoji: "",
    use: useGoldenVeto,
};

export const DiamondVeto: Veto = {
    name: "Diamond Power of Veto",
    emoji: "💎",
    use: useDiamondVeto,
};

export const SpotlightVeto: Veto = {
    name: "Spotlight Power of Veto",
    emoji: "🔦",
    use: useSpotlightVeto,
};

export const BoomerangVeto: Veto = {
    name: "Boomerang Power of Veto",
    emoji: "🪃",
    use: useBoomerangVeto,
};

// only works for 2 nominees
function useBoomerangVeto(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState,
    HoH: number,
    exclusions: Houseguest[]
): HouseguestWithLogic {
    if (nominees.length !== 2) throw new Error("Boomerang veto only works for 2 nominees.");
    const checks = basicVetoChecks(hero, nominees, gameState, HoH, exclusions);
    if (checks) return checks;
    // Need an additional check for boomerang veto, since there are 2 replacement noms
    if (gameState.remainingPlayers - 1 - nominees.length === 2) {
        return {
            decision: null,
            reason: "It doesn't make sense to use the veto here.",
        };
    }

    // if you wouldn't use gold veto on either of them, discard
    const veto1 = useGoldenVeto(hero, [nominees[0]], gameState, HoH, exclusions);
    const veto2 = useGoldenVeto(hero, [nominees[1]], gameState, HoH, exclusions);
    if (veto1.decision === null && veto2.decision === null) {
        return { decision: null, reason: "I don't want to save either of these noms." };
    }
    // if you would use gold veto on both of them, use
    if (veto1.decision !== null && veto2.decision !== null) {
        return { decision: nominees[0], reason: "I want to save both of these noms." };
    }
    // if you would only use it on one of them, only use it if you have low friend counts
    const strategy = determineStrategy(hero);
    if (strategy === TargetStrategy.StatusQuo) {
        return { decision: null, reason: "I want to evict at least one of these noms." };
    } else {
        return { decision: nominees[0], reason: "I want to save at least one of these noms." };
    }
}

function useSpotlightVeto(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState,
    HoH: number,
    exclusions: Houseguest[]
): HouseguestWithLogic {
    // basically ya forced to use it
    const checks = basicVetoChecks(hero, nominees, gameState, HoH, exclusions);
    if (checks && checks.decision !== null) return checks;
    // use the veto on whoever is the worse target between the 2 nominees
    const invertedDecision = isBetterTargetWithLogic(
        getRelationshipSummary(hero, nominees[0]),
        getRelationshipSummary(hero, nominees[1]),
        hero,
        gameState
    );
    const decision = invertedDecision.decision === 0 ? 1 : 0;
    return { decision: nominees[decision], reason: invertedDecision.reason };
}

function useGoldenVeto(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState,
    HoH: number,
    exclusions: Houseguest[]
): HouseguestWithLogic {
    const checks = basicVetoChecks(hero, nominees, gameState, HoH, exclusions);
    if (checks) return checks;
    let reason = "None of these nominees are my friends.";
    let potentialSave: Houseguest | null = null;
    let alwaysSave: Houseguest | null = null;
    nominees.forEach((nominee) => {
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

// only works with 2 nominees
function useDiamondVeto(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState,
    HoH: number,
    exclusions: Houseguest[],
    skipChecks: boolean = false
): HouseguestWithLogic {
    if (!skipChecks) {
        const checks = basicVetoChecks(hero, nominees, gameState, HoH, exclusions);
        if (checks) return checks;
    }
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

function basicVetoChecks(
    hero: Houseguest,
    nominees: Houseguest[],
    gameState: GameState,
    HoH: number,
    immunePlayers: Houseguest[] = []
): HouseguestWithLogic | null {
    if (hero.id === HoH) {
        return {
            decision: null,
            reason: "These are my ideal nominations.",
        };
    }
    for (const nom of nominees) {
        if (hero.id === nom.id) return { decision: hero, reason: "I am going to save myself." };
    }
    // if player is not immune, don't use the veto if you are the only replacement nominee
    if (
        every(immunePlayers, (player) => player.id !== hero.id) &&
        gameState.remainingPlayers - 1 - immunePlayers.length - nominees.length === 1
    ) {
        return {
            decision: null,
            reason: "It doesn't make sense to use the veto here.",
        };
    }
    return null;
}
