import { Episode, EpisodeType, GameState } from "../../model";
import React from "react";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { Scene } from "./scenes/scene";
import { GoldenVeto } from "./veto/veto";

export const TripleEvictionUs: EpisodeType = {
    canPlayWith: (n: number) => n >= 6,
    eliminates: 3,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "🇺🇸 Triple Eviction",
    generate: generateTripleEvictionUs,
};

export function generateTripleEvictionUs(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, GoldenVeto);
    let currentGameState = episode.gameState;
    const scenes: Scene[] = episode.scenes;

    currentGameState.incrementLogIndex();
    const doubleEviction = generateBBVanillaScenes(currentGameState, GoldenVeto, true);
    currentGameState = doubleEviction.gameState;
    scenes.push(
        new Scene({
            title: "Double Eviction",
            content: <div>{doubleEviction.scenes.map((scene) => scene.content)}</div>,
            gameState: doubleEviction.gameState,
        })
    );
    currentGameState.incrementLogIndex();
    const tripleEviction = generateBBVanillaScenes(currentGameState, GoldenVeto, true);
    currentGameState = tripleEviction.gameState;
    scenes.push(
        new Scene({
            title: "Triple Eviction",
            content: <div>{tripleEviction.scenes.map((scene) => scene.content)}</div>,
            gameState: tripleEviction.gameState,
        })
    );
    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        title: episode.title,
        scenes,
        type: TripleEvictionUs,
    });
}
