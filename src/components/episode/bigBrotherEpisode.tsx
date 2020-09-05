import {
    MutableGameState,
    getById,
    inJury,
    nonEvictedHouseguests,
    GameState,
    Houseguest,
    EpisodeType,
    Episode,
    InitEpisode,
} from "../../model";
import { getFinalists, finalJurySize } from "../../model/season";
import { generateHohCompScene } from "./scenes/hohCompScene";
import { generateNomCeremonyScene } from "./scenes/nomCeremonyScene";
import { generateVetoCompScene } from "./scenes/vetoCompScene";
import { generateVetoCeremonyScene } from "./scenes/vetoCeremonyScene";
import { generateEvictionScene } from "./scenes/evictionScene";
import { MemoryWall } from "../memoryWall";
import { NextEpisodeButton } from "../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Scene } from "./scene";
import { HasText } from "../layout/text";

export const BigBrotherVanilla: EpisodeType = {
    canPlayWith: (n: number) => {
        return n > 1;
    },
    eliminates: 1,
    arrowsEnabled: true,
    hasViewsbar: true,
};

// Refactoring ideas
/**
 * Might be best to start passing ids instead of houseguests for HoH/nominees/veto winner
 */

export function evictHouseguest(gameState: MutableGameState, id: number) {
    const evictee = getById(gameState, id);
    if (gameState.currentLog) gameState.currentLog.evicted = evictee.id;
    evictee.isEvicted = true;
    if (gameState.remainingPlayers - getFinalists() <= finalJurySize()) {
        evictee.isJury = true;
    }
    if (inJury(gameState)) {
        nonEvictedHouseguests(gameState).forEach((hg) => {
            hg.superiors.delete(evictee.id);
        });
    }
    gameState.remainingPlayers--;
}

export function generateBbVanilla(initialGameState: GameState): BigBrotherVanillaEpisode {
    let currentGameState;
    let hohCompScene;
    let hoh: Houseguest;
    const scenes = [];
    [currentGameState, hohCompScene, hoh] = generateHohCompScene(initialGameState);
    scenes.push(hohCompScene);

    let nomCeremonyScene;
    let nominees: Houseguest[];
    [currentGameState, nomCeremonyScene, nominees] = generateNomCeremonyScene(currentGameState, hoh);
    scenes.push(nomCeremonyScene);

    let vetoCompScene;
    let povWinner: Houseguest;
    [currentGameState, vetoCompScene, povWinner] = generateVetoCompScene(
        currentGameState,
        hoh,
        nominees[0],
        nominees[1]
    );
    scenes.push(vetoCompScene);
    let vetoCeremonyScene;

    [currentGameState, vetoCeremonyScene, nominees] = generateVetoCeremonyScene(
        currentGameState,
        hoh,
        nominees,
        povWinner
    );
    scenes.push(vetoCeremonyScene);

    let evictionScene;
    [currentGameState, evictionScene] = generateEvictionScene(currentGameState, hoh, nominees);
    scenes.push(evictionScene);

    const title = `Week ${currentGameState.phase}`;
    const content = (
        <HasText>
            {`Week ${currentGameState.phase}`}
            <MemoryWall houseguests={initialGameState.houseguests} /> <br />
            {currentGameState.phase === 1 && <b>Try clicking on houseguests to view their relationships.</b>}
            <br />
            <NextEpisodeButton />
        </HasText>
    );
    const gameState = new GameState(currentGameState);
    return new BigBrotherVanillaEpisode({ title, scenes, content, gameState, type: BigBrotherVanilla });
}
export class BigBrotherVanillaEpisode extends Episode {
    readonly title: string;
    readonly scenes: Scene[];
    readonly content: JSX.Element;
    readonly gameState: GameState;
    readonly type = BigBrotherVanilla;

    public constructor(init: InitEpisode) {
        super(init);
        this.title = init.title;
        this.scenes = init.scenes;
        this.content = init.content;
        this.gameState = init.gameState;
    }
}
