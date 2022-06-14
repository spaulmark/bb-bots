import { GameState, Houseguest, MutableGameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { Episode, EpisodeType } from "./episodes";
import React from "react";
import { Scene } from "./scenes/scene";
import { GoldenVeto } from "./veto/veto";
import { generateHohCompScene } from "./scenes/hohCompScene";

export const CoHoH: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 1,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "👥 Co-HoH",
    generate: generateCoHoH,
};

function generateCoHoH(initialGamestate: GameState): Episode {
    // generate (co)-hoh scene
    let currentGameState = new MutableGameState(initialGamestate);
    let hohArray: Houseguest[];
    let hohCompScene: Scene;
    const scenes: Scene[] = [];
    [currentGameState, hohCompScene, hohArray] = generateHohCompScene(currentGameState, {
        coHoH: true,
        coHohIsFinal: true,
    });
    scenes.push(hohCompScene);

    // generate nominations scene

    // veto replacement scene might be different because each hoh nominated one person, so whoever gets vetoed, that hoh replaces
    // veto scene is normal, but eviction scene the veto winner breaks the tie
    //
    //
    //
    // const episode = generateBBVanillaScenes(initialGamestate, GoldenVeto);
    // let currentGameState = episode.gameState;
    // const scenes: Scene[] = episode.scenes;
    // currentGameState.incrementLogIndex();
    // const doubleEviction = generateBBVanillaScenes(currentGameState, GoldenVeto, true);
    // currentGameState = doubleEviction.gameState;
    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        title: `Week ${currentGameState.phase}`,
        scenes,
        type: CoHoH,
    });
}
