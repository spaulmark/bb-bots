import { GameState } from "../../model";
import { HasText } from "../layout/text";
import { NextEpisodeButton } from "../nextEpisodeButton/nextEpisodeButton";
import { generateBBVanillaScenes, Tabs } from "./bigBrotherEpisode";
import { WeekStartWrapper } from "./bigBrotherWeekstartWrapper";
import { Episode, EpisodeType, InitEpisode } from "./episodes";
import React from "react";
import { Scene } from "./scene";

export const DoubleEviction: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 2,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "Double Eviction",
    generate: generateDoubleEviction,
};

export function generateDoubleEviction(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate);
    let currentGameState = episode.gameState;
    const scenes: Scene[] = episode.scenes;

    currentGameState.incrementLogIndex();
    const doubleEviction = generateBBVanillaScenes(currentGameState, true);
    currentGameState = doubleEviction.gameState;
    scenes.push(
        new Scene({
            title: "Double Eviction",
            content: <div>{doubleEviction.scenes.map((scene) => scene.content)}</div>,
            gameState: doubleEviction.gameState,
        })
    );

    const content = (
        <HasText>
            <Tabs />
            <WeekStartWrapper gameState={initialGamestate} />
            <br />
            <NextEpisodeButton />
        </HasText>
    );
    const gameState = new GameState(currentGameState);
    return new Episode({
        gameState,
        content,
        title: episode.title,
        scenes,
        type: DoubleEviction,
    });
}
