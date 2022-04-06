import React from "react";
import { GameState } from "../../model";
import { HasText } from "../layout/text";
import { NextEpisodeButton } from "../nextEpisodeButton/nextEpisodeButton";
import { Tabs } from "./bigBrotherEpisode";
import { WeekStartWrapper } from "./bigBrotherWeekstartWrapper";
import { Episode, EpisodeType, InitEpisode } from "./episodes";
import { Scene } from "./scene";
import { generateSafetyChainScene } from "./scenes/safetyChainScene";

export const SafetyChain: EpisodeType = {
    canPlayWith: (n: number) => n >= 3,
    eliminates: 1,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "Safety Chain",
};

export function generateSafetyChain(initialGameState: GameState): SafetyChainEpisode {
    const content = (
        <HasText>
            <Tabs />
            <WeekStartWrapper gameState={initialGameState} />
            <NextEpisodeButton />
        </HasText>
    );
    let currentGameState: GameState = initialGameState;
    const title = `Safety Chain ${currentGameState.phase}`;
    const scenes: Scene[] = [];
    let safetyChainScene;
    [currentGameState, safetyChainScene] = generateSafetyChainScene(initialGameState);
    scenes.push(safetyChainScene);
    return new SafetyChainEpisode({ gameState: currentGameState, content, title, scenes, type: SafetyChain });
}

export class SafetyChainEpisode extends Episode {
    readonly title: string;
    readonly scenes: Scene[];
    readonly content: JSX.Element;
    readonly gameState: GameState;
    readonly type = SafetyChain;

    public constructor(init: InitEpisode) {
        super(init);
        this.title = init.title;
        this.scenes = init.scenes;
        this.content = init.content;
        this.gameState = init.gameState;
    }
}
