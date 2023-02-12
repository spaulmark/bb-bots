import { GameState } from "../../model";
import { Episode, EpisodeType } from "./episodes";
import { generateSafetyChainScene } from "./scenes/safetyChainScene";

export const SafetyChain: EpisodeType = {
    canPlayWith: (n: number) => n >= 3,
    eliminates: 1,
    chainable: true,
    name: "Safety Chain",
    emoji: "⛓️",
    description:
        "The winner of a competition gives safety to another houseguest, who gives safety to another houseguest, until 3 unsafe houseguests remain. They compete in a final safety competition, and the two losers face an eviction vote.",
    generate: generateSafetyChain,
};

export function generateSafetyChain(initialGameState: GameState): Episode {
    let currentGameState: GameState = initialGameState;
    currentGameState.incrementLogIndex();
    let safetyChainScene;
    [currentGameState, safetyChainScene] = generateSafetyChainScene(initialGameState);
    return new Episode({
        gameState: new GameState(currentGameState),
        scenes: [safetyChainScene],
        type: SafetyChain,
    });
}
