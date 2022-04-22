import { Episode, EpisodeType, GameState } from "../../model";
import React from "react";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { Scene } from "./scenes/scene";

export const TripleEvictionCad: EpisodeType = {
    canPlayWith: (n: number) => n >= 6,
    eliminates: 3,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "Triple Eviction 🇨🇦",
    generate: generateTripleEvictionCad,
};

// TODO: we need to make it so they don't use triple eviction veto -___-

export function generateTripleEvictionCad(initialGamestate: GameState): Episode {
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

    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        title: episode.title,
        scenes,
        type: TripleEvictionCad,
    });
}
