import { Episode, EpisodeType, GameState, Houseguest } from "../../model";
import React from "react";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { Scene } from "./scenes/scene";
import { generateHohCompScene } from "./scenes/hohCompScene";
import { generateNomCeremonyScene } from "./scenes/nomCeremonyScene";
import { generateVetoCompScene } from "./scenes/vetoCompScene";
import { generateVetoCeremonyScene } from "./scenes/vetoCeremonyScene";
import { generateEvictionScene } from "./scenes/evictionScene";
import { GoldenVeto } from "./veto/veto";

export const TripleEvictionCad: EpisodeType = {
    canPlayWith: (n: number) => n >= 6,
    eliminates: 3,
    arrowsEnabled: true,
    emoji: "🇨🇦",
    hasViewsbar: true,
    name: "Triple Eviction",
    description:
        "A double eviction with three nominees. Houseguests vote to save one, and the other two are evicted.",
    generate: generateTripleEvictionCad,
};

export function generateTripleEvictionCad(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, GoldenVeto);
    let currentGameState = episode.gameState;
    const scenes: Scene[] = episode.scenes;

    currentGameState.incrementLogIndex();

    let hohArray: Houseguest[];
    let hohCompScene: Scene;
    const tripleScenes: Scene[] = [];
    [currentGameState, hohCompScene, hohArray] = generateHohCompScene(currentGameState, {
        doubleEviction: true,
        customText: "Houseguests, please return to the living room. Tonight will be a triple eviction.",
    });
    tripleScenes.push(hohCompScene);
    const hoh = hohArray[0];

    let nomCeremonyScene;
    let nominees: Houseguest[];
    [currentGameState, nomCeremonyScene, nominees] = generateNomCeremonyScene(currentGameState, [hoh], {
        doubleEviction: true,
        thirdNominee: true,
    });
    tripleScenes.push(nomCeremonyScene);

    let vetoCompScene;
    let povWinner: Houseguest;
    [currentGameState, vetoCompScene, povWinner] = generateVetoCompScene(
        currentGameState,
        [hoh],
        nominees,
        GoldenVeto,
        true
    );
    tripleScenes.push(vetoCompScene);

    let vetoCeremonyScene;

    [currentGameState, vetoCeremonyScene, nominees] = generateVetoCeremonyScene(
        currentGameState,
        [hoh],
        nominees,
        povWinner,
        true,
        GoldenVeto,
        []
    );
    tripleScenes.push(vetoCeremonyScene);

    let evictionScene;
    [currentGameState, evictionScene] = generateEvictionScene(currentGameState, [hoh], nominees, {
        doubleEviction: true,
        votingTo: "Save",
    });
    tripleScenes.push(evictionScene);

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
        scenes,
        type: TripleEvictionCad,
    });
}
