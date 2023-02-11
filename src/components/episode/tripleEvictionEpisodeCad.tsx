import { Episode, EpisodeType, GameState, MutableGameState } from "../../model";
import React from "react";
import { Scene } from "./scenes/scene";
import { GoldenVeto } from "./veto/veto";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";

export const TripleEvictionCad: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 2,
    arrowsEnabled: true,
    emoji: "🇨🇦",
    chainable: true,
    name: "Triple Eviction",
    description:
        "A double eviction with three nominees. Houseguests vote to save one, and the other two are evicted.",
    generate: generateTripleEvictionCad,
};

export function generateTripleEvictionCad(initialGamestate: GameState): Episode {
    let currentGameState = new MutableGameState(initialGamestate);
    const scenes: Scene[] = [];
    currentGameState.incrementLogIndex();

    const episode = generateBBVanillaScenes(currentGameState, {
        veto: GoldenVeto,
        doubleEviction: true,
        thirdNominee: true,
        votingTo: "Save",
        hohCompCustomText:
            "Houseguests, please return to the living room. Tonight will be a triple eviction.",
    });
    currentGameState = episode.gameState;
    scenes.push(
        new Scene({
            title: "Triple Eviction",
            content: <div>{episode.scenes.map((scene) => scene.content)}</div>,
            gameState: currentGameState,
        })
    );
    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        scenes,
        type: TripleEvictionCad,
    });
}
