import React from "react";
import { GameState, MutableGameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { EpisodeType, Episode } from "./episodes";
import { Scene } from "./scenes/scene";

export const InstantEviction: EpisodeType = {
    canPlayWith: (n: number) => n >= 4,
    eliminates: 1,
    arrowsEnabled: true,
    emoji: "⚡",
    hasViewsbar: true,
    chainable: true,
    name: "Instant Eviction",
    description: "A double eviction without a veto.",
    generate: generateInstantEviction,
};

function generateInstantEviction(initialGamestate: GameState): Episode {
    let currentGameState = new MutableGameState(initialGamestate);
    const scenes: Scene[] = [];

    currentGameState.incrementLogIndex();
    const doubleEviction = generateBBVanillaScenes(currentGameState, null, true);
    currentGameState = doubleEviction.gameState;

    scenes.push(
        new Scene({
            title: "Instant Eviction",
            content: <div>{doubleEviction.scenes.map((scene) => scene.content)}</div>,
            gameState: doubleEviction.gameState,
        })
    );

    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        scenes,
        type: InstantEviction,
    });
}
