import { GameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { Episode, EpisodeType } from "./episodes";
import React from "react";
import { Scene } from "./scenes/scene";
import { GoldenVeto } from "./veto/veto";

export const DoubleEviction: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 2,
    arrowsEnabled: true,
    emoji: "⏩",
    hasViewsbar: true,
    name: "Double Eviction",
    generate: generateDoubleEviction,
};

function generateDoubleEviction(initialGamestate: GameState): Episode {
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

    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        title: episode.title,
        scenes,
        type: DoubleEviction,
    });
}
