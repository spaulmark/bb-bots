import { GameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { Episode, EpisodeType } from "./episodes";
import React from "react";
import { Scene } from "./scene";

export const DoubleEviction: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 2,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "Double Eviction",
    generate: generateDoubleEviction,
};

export function generateDoubleEviction(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate);
    let currentGameState = episode.gameState;
    const scenes: Scene[] = episode.scenes;

    currentGameState.incrementLogIndex();
    const doubleEviction = generateBBVanillaScenes(currentGameState, true);
    currentGameState = doubleEviction.gameState;
    scenes.push(
        new Scene({
            title: "Double Eviction",
            content: <div>{doubleEviction.scenes.map((scene) => scene.content)}</div>,
            gameState: doubleEviction.gameState,
        })
    );

    const gameState = new GameState(currentGameState);
    return new Episode({
        gameState,
        title: episode.title,
        scenes,
        type: DoubleEviction,
    });
}
