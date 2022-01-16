import React from "react";
import { GameState, Houseguest, MutableGameState, nonEvictedHouseguests, randomPlayer } from "../../../model";
import { getBestFriend } from "../../../utils/ai/aiUtils";
import { Centered } from "../../layout/centered";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import { Portrait, Portraits } from "../../playerPortrait/portraits";
import { evictHouseguest } from "../bigBrotherEpisode";
import { Scene } from "../scene";

export function generateSafetyChainScene(initialGameState: GameState): [GameState, Scene] {
    const newGameState = new MutableGameState(initialGameState);
    const chainOrder: Houseguest[] = [];
    const chainStarter: Houseguest = randomPlayer(newGameState.houseguests);
    const options: Houseguest[] = nonEvictedHouseguests(newGameState).filter(
        (hg) => hg.id !== chainStarter.id
    );

    chainOrder.push(chainStarter);
    const safeSpots = newGameState.nonEvictedHouseguests.size - 1;
    let currentChooser: Houseguest = chainStarter;
    const stuff: JSX.Element[] = [];
    while (chainOrder.length < safeSpots) {
        const newSafeIndex = getBestFriend(currentChooser, options);
        chainOrder.push(options[newSafeIndex]);
        options.splice(newSafeIndex, 1);
        stuff.push(
            <Centered key={`safetychain-${newGameState.phase}-${chainOrder.length}`}>
                {currentChooser.name} has chosen {chainOrder[chainOrder.length - 1].name}!
                <Portraits
                    houseguests={[currentChooser, chainOrder[chainOrder.length - 1]]}
                    centered={true}
                />
            </Centered>
        );
        currentChooser = chainOrder[chainOrder.length - 1];
    }
    stuff.push(
        <Centered key={`safetychain-final-${newGameState.phase}-${chainOrder.length}`}>
            {options[0].name} has been left out!
            <Portrait houseguest={options[0]} centered={true} />
        </Centered>
    );
    evictHouseguest(newGameState, options[0].id);
    const scene: Scene = new Scene({
        title: "Chain Ceremony",
        gameState: initialGameState,
        content: (
            <div>
                {stuff}
                <NextEpisodeButton />
            </div>
        ),
    });

    return [newGameState, scene];
}
