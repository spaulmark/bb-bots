import { Episode, EpisodeType, GameState, Houseguest } from "../../model";
import React from "react";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { Scene } from "./scenes/scene";
import { generateHohCompScene } from "./scenes/hohCompScene";

export const TripleEvictionCad: EpisodeType = {
    canPlayWith: (n: number) => n >= 6,
    eliminates: 3,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "Triple Eviction 🇨🇦",
    generate: generateTripleEvictionCad,
};

export function generateTripleEvictionCad(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate);
    let currentGameState = episode.gameState;
    const scenes: Scene[] = episode.scenes;

    currentGameState.incrementLogIndex();

    // hoh comp
    let hoh: Houseguest;
    let hohCompScene: Scene;
    const tripleScenes: Scene[] = [];
    [currentGameState, hohCompScene, hoh] = generateHohCompScene(currentGameState, {
        doubleEviction: true,
        customText: "Houseguests, please return to the living room. Tonight will be a triple eviction.",
    }); // TODO: HoH comp scene options object
    tripleScenes.push(hohCompScene);
    // nominations, TODO: use backdoorNplayers function to find N nominees

    // pov

    // veto ceremony

    // vote to SAVE

    scenes.push(
        new Scene({
            title: "Triple Eviction",
            content: <div>{tripleScenes.map((scene) => scene.content)}</div>,
            gameState: currentGameState,
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
