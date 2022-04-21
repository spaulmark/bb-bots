import React from "react";
import { GameState } from "../../model";
import { Episode, EpisodeType } from "./episodes";
import { Scene } from "./scene";
import { generateSafetyChainScene } from "./scenes/safetyChainScene";

export const SafetyChain: EpisodeType = {
    canPlayWith: (n: number) => n >= 3,
    eliminates: 1,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "Safety Chain",
    generate: generateSafetyChain,
};

export function generateSafetyChain(initialGameState: GameState): Episode {
    let currentGameState: GameState = initialGameState;
    const title = `Safety Chain ${currentGameState.phase}`;
    const scenes: Scene[] = [];
    let safetyChainScene;
    [currentGameState, safetyChainScene] = generateSafetyChainScene(initialGameState);
    scenes.push(safetyChainScene);
    return new Episode({ gameState: currentGameState, title, scenes, type: SafetyChain });
}
