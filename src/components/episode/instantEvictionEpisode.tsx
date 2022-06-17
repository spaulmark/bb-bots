import React from "react";
import { GameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { EpisodeType, Episode } from "./episodes";
import { Scene } from "./scenes/scene";
import { GoldenVeto } from "./veto/veto";

export const InstantEviction: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 2,
    arrowsEnabled: true,
    emoji: "⚡",
    hasViewsbar: true,
    name: "Instant Eviction",
    description: "A double eviction without a veto.",
    generate: generateInstantEviction,
};

function generateInstantEviction(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, GoldenVeto);
    let currentGameState = episode.gameState;
    const scenes: Scene[] = episode.scenes;

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
