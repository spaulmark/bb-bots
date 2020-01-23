import React from "react";
import { EpisodeType, Episode, InitEpisode } from "./episodes";
import { Scene } from "./scene";
import { GameState } from "../../model";
import { MemoryWall } from "../memoryWall";
import { NextEpisodeButton } from "../nextEpisodeButton/nextEpisodeButton";
import { finalHohCompScene } from "./scenes/finalHohCompScene";
import { finalEvictionScene } from "./scenes/finalEvictionScene";
import { juryVoteScene } from "./scenes/juryVoteScene";

export const BigBrotherFinale: EpisodeType = {
    canPlayWith: (n: number) => n === 3,
    eliminates: 2
};

export function generateBbFinale(initialGameState: GameState): BigBrotherFinaleEpisode {
    const title = "Finale";
    const content = (
        <div>
            Finale Night
            <MemoryWall houseguests={initialGameState.houseguests} /> <br />
            <NextEpisodeButton />
        </div>
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
    return new BigBrotherFinaleEpisode({ gameState, content, title, scenes, type: BigBrotherFinale });
}

export class BigBrotherFinaleEpisode extends Episode {
    readonly title: string;
    readonly scenes: Scene[];
    readonly content: JSX.Element;
    readonly gameState: GameState;
    readonly type = BigBrotherFinale;

    public constructor(init: InitEpisode) {
        super(init);
        this.title = init.title;
        this.scenes = init.scenes;
        this.content = init.content;
        this.gameState = init.gameState;
    }
}
