import { GameState, MutableGameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { Episode, EpisodeType, Split } from "./episodes";
import React from "react";
import { Scene } from "./scenes/scene";
import { GoldenVeto } from "./veto/veto";
import { shuffle } from "lodash";

export const SplitHouse: EpisodeType = {
    canPlayWith: (n: number) => n >= 6,
    eliminates: 2,
    arrowsEnabled: true,
    emoji: "↔️",
    hasViewsbar: true,
    name: "Split House",
    description:
        "Houseguests are divided into two groups, and each group plays a round of Big Brother, isolated from the others.",
    splitFunction: splitHouseRandomly(["Indoors", "Outdoors"]),
    generate,
};

// TODO: the split needs to get assigned to the gamestate in the episode factory
function generate(initialGamestate: GameState): Episode {
    let currentGameState = new MutableGameState(initialGamestate);
    const scenes: Scene[] = [];
    // currentGameState.incrementLogIndex();
    const doubleEviction = generateBBVanillaScenes(currentGameState, {
        doubleEviction: true,
        veto: GoldenVeto,
    });
    currentGameState = doubleEviction.gameState;
    scenes.push(
        new Scene({
            title: "Double Eviction",
            content: <div>{doubleEviction.scenes.map((scene) => scene.content)}</div>,
            gameState: doubleEviction.gameState,
        })
    );

    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        scenes,
        type: SplitHouse,
    });
}

function splitHouseRandomly(names: string[]): (gameState: GameState) => Split[] {
    return (currentGameState: GameState) => {
        const nonEvictedHouseguests: number[] = shuffle(Array.from(currentGameState.nonEvictedHouseguests));
        const members: Set<number>[] = [];
        for (let i = 0; i < names.length; i++) {
            members.push(new Set<number>());
        }
        nonEvictedHouseguests.forEach((hgid, i) => {
            members[i % names.length].add(hgid);
        });
        const result: Split[] = members.map((members, i) => ({
            name: names[i],
            members,
        }));
        return result;
    };
}
