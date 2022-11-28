import { Episode, EpisodeType, GameState, Houseguest, MutableGameState } from "../../model";
import React from "react";
import { Scene } from "./scenes/scene";
import { generateHohCompScene } from "./scenes/hohCompScene";
import { generateNomCeremonyScene } from "./scenes/nomCeremonyScene";
import { generateVetoCompScene } from "./scenes/vetoCompScene";
import { generateVetoCeremonyScene } from "./scenes/vetoCeremonyScene";
import { generateEvictionScene } from "./scenes/evictionScene";
import { GoldenVeto } from "./veto/veto";

export const TripleEvictionCad: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 2,
    arrowsEnabled: true,
    emoji: "🇨🇦",
    chainable: true,
    hasViewsbar: true,
    name: "Triple Eviction",
    description:
        "A double eviction with three nominees. Houseguests vote to save one, and the other two are evicted.",
    generate: generateTripleEvictionCad,
};

export function generateTripleEvictionCad(initialGamestate: GameState): Episode {
    let currentGameState = new MutableGameState(initialGamestate);
    const scenes: Scene[] = [];
    const doubleEviction = true;

    currentGameState.incrementLogIndex();

    let hohArray: Houseguest[];
    let hohCompScene: Scene;
    const tripleScenes: Scene[] = [];
    [currentGameState, hohCompScene, hohArray] = generateHohCompScene(currentGameState, {
        doubleEviction,
        customText: "Houseguests, please return to the living room. Tonight will be a triple eviction.",
    });
    tripleScenes.push(hohCompScene);
    const hoh = hohArray[0];

    let nomCeremonyScene;
    let nominees: Houseguest[];
    [currentGameState, nomCeremonyScene, nominees] = generateNomCeremonyScene(currentGameState, [hoh], {
        doubleEviction,
        thirdNominee: true,
    });
    tripleScenes.push(nomCeremonyScene);

    let vetoCompScene;
    let povWinner: Houseguest;
    [currentGameState, vetoCompScene, povWinner] = generateVetoCompScene(currentGameState, [hoh], nominees, {
        veto: GoldenVeto,
        doubleEviction,
    });
    tripleScenes.push(vetoCompScene);

    let vetoCeremonyScene;

    [currentGameState, vetoCeremonyScene, nominees] = generateVetoCeremonyScene(
        currentGameState,
        [hoh],
        nominees,
        povWinner,
        { doubleEviction, veto: GoldenVeto }
    );
    tripleScenes.push(vetoCeremonyScene);

    let evictionScene;
    [currentGameState, evictionScene] = generateEvictionScene(currentGameState, [hoh], nominees, {
        doubleEviction,
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
