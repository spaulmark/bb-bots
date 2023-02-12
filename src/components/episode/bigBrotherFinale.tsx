import React from "react";
import { EpisodeType, Episode } from "./episodes";
import { GameState } from "../../model";
import { MemoryWall } from "../memoryWall";
import { NextEpisodeButton } from "../nextEpisodeButton/nextEpisodeButton";
import { finalHohCompScene } from "./scenes/finalHohCompScene";
import { finalEvictionScene } from "./scenes/finalEvictionScene";
import { juryVoteScene } from "./scenes/juryVoteScene";
import { HasText } from "../layout/text";

export const BigBrotherFinale: EpisodeType = {
    canPlayWith: (n: number) => n === 3,
    eliminates: 2,
    generate: generateBbFinale,
};

export function generateBbFinale(initialGameState: GameState): Episode {
    const title = "Finale";
    const content = (
        <HasText>
            <MemoryWall splits={[{ houseguests: initialGameState.houseguests }]} /> <br />
            <NextEpisodeButton />
        </HasText>
    );
    let currentGameState;
    let hohCompScene;
    let finalHoH;
    const scenes = [];
    [currentGameState, hohCompScene, finalHoH] = finalHohCompScene(initialGameState);
    scenes.push(hohCompScene);
    let finalEviction;
    [currentGameState, finalEviction] = finalEvictionScene(currentGameState, finalHoH);
    scenes.push(finalEviction);
    const [gameState, juryScene] = juryVoteScene(currentGameState);
    scenes.push(juryScene);
    return new Episode({ gameState, content, title, scenes, type: BigBrotherFinale });
}
