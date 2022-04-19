import React from "react";
import { Episode, EpisodeType, GameState } from "../../model";
import { HasText } from "../layout/text";
import { NextEpisodeButton } from "../nextEpisodeButton/nextEpisodeButton";
import { generateBBVanillaScenes, Tabs } from "./bigBrotherEpisode";
import { WeekStartWrapper } from "./bigBrotherWeekstartWrapper";
import { Scene } from "./scene";

export const TripleEvictionCad: EpisodeType = {
    canPlayWith: (n: number) => n >= 6,
    eliminates: 3,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "Triple Eviction CAD",
    generate: generateTripleEvictionCad,
};

// TODO: we need to make it so they don't use triple eviction veto -___-

export function generateTripleEvictionCad(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate);
    let currentGameState = episode.gameState;
    const scenes: Scene[] = episode.scenes;

    currentGameState.incrementLogIndex();

    const gameState = new GameState(currentGameState);
    const content = (
        <HasText>
            <Tabs />
            <WeekStartWrapper gameState={initialGamestate} />
            <br />
            <NextEpisodeButton />
        </HasText>
    );
    return new Episode({
        gameState,
        content,
        title: episode.title,
        scenes,
        type: TripleEvictionCad,
    });
}
