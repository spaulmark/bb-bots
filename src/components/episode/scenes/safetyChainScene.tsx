import React from "react";
import { GameState, Houseguest, nonEvictedHouseguests } from "../../../model";
import { HoHVote, NomineeVote, NormalVote, SaveVote } from "../../../model/logging/voteType";
import { Centered, CenteredBold } from "../../layout/centered";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import { Portraits } from "../../playerPortrait/portraits";
import { Scene } from "./scene";
import { evictHouseguest } from "../utilities/evictHouseguest";
import { getWorstTarget } from "../../../utils/ai/aiApi";
import { listNames } from "../../../utils/listStrings";
import { generateHohCompScene } from "./hohCompScene";

export function generateSafetyChainScene(initialGameState: GameState): [GameState, Scene] {
    const chainOrder: Houseguest[] = [];
    const [newGameState, HoHscene, HoHarray] = generateHohCompScene(initialGameState, {
        doubleEviction: true,
        customText:
            "Houseguests, please return to the living room. It is time for a Safety Chain Special Eviction.",
        skipHoHWin: true,
        bottomText: "has won the safety competition!",
    });
    const chainStarter: Houseguest = HoHarray[0];
    const options: Houseguest[] = nonEvictedHouseguests(newGameState).filter(
        (hg) => hg.id !== chainStarter.id
    );
    chainOrder.push(chainStarter);
    const safeSpots = newGameState.nonEvictedHouseguests.size - 3;
    let currentChooser: Houseguest = chainStarter;
    const sceneContent: JSX.Element[] = [];
    let first = true;
    while (chainOrder.length < safeSpots) {
        const newSafeIndex = options.indexOf(getWorstTarget(currentChooser, options, newGameState));
        chainOrder.push(options[newSafeIndex]);
        newGameState.currentLog.votes[currentChooser.id] = first
            ? new HoHVote(options[newSafeIndex].id)
            : new SaveVote(options[newSafeIndex].id);
        first = false;
        options.splice(newSafeIndex, 1);
        sceneContent.push(
            <Centered key={`safetychain-${newGameState.phase}-${chainOrder.length}`}>
                {currentChooser.name} has chosen {chainOrder[chainOrder.length - 1].name}!
            </Centered>,
            <Portraits
                houseguests={[currentChooser, chainOrder[chainOrder.length - 1]]}
                key={`safetychain-${newGameState.phase}-${chainOrder.length}-2`}
                centered={true}
            />
        );
        currentChooser = chainOrder[chainOrder.length - 1];
    }

    const leftOut = options.slice(0, 3);

    newGameState.currentLog.votes[chainOrder[chainOrder.length - 1].id] = new NomineeVote(false);
    newGameState.currentLog.votes[options[0].id] = new NomineeVote(true);
    newGameState.currentLog.nominationsPostVeto = [options[0].name, chainOrder[chainOrder.length - 1].name];
    sceneContent.push(
        <CenteredBold key={`safetychain-final-${newGameState.phase}-${chainOrder.length}`}>
            {listNames(leftOut.map((h) => h.name))} compete in a second safety competition.
        </CenteredBold>,
        <Portraits
            houseguests={leftOut}
            centered={true}
            key={`safetychain-final-${newGameState.phase}-${chainOrder.length}-2`}
        />
    );
    evictHouseguest(newGameState, options[0].id);

    const scene: Scene = new Scene({
        title: "Chain Ceremony",
        gameState: initialGameState,
        content: (
            <div>
                {HoHscene.content}
                {sceneContent}
                <NextEpisodeButton />
            </div>
        ),
    });
    return [newGameState, scene];
}
