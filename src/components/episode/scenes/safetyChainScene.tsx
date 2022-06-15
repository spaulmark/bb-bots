import React from "react";
import { GameState, Houseguest, MutableGameState, nonEvictedHouseguests, randomPlayer } from "../../../model";
import { HoHVote, NomineeVote, NormalVote } from "../../../model/logging/voteType";
import { getBestFriend } from "../../../utils/ai/aiUtils";
import { Centered } from "../../layout/centered";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import { Portrait, Portraits } from "../../playerPortrait/portraits";
import { Scene } from "./scene";
import { evictHouseguest } from "../utilities/evictHouseguest";

export function generateSafetyChainScene(initialGameState: GameState): void {
    // const newGameState = new MutableGameState(initialGameState);
    // const chainOrder: Houseguest[] = [];
    // const chainStarter: Houseguest = randomPlayer(newGameState.houseguests);
    // const options: Houseguest[] = nonEvictedHouseguests(newGameState).filter(
    //     (hg) => hg.id !== chainStarter.id
    // );
    // chainOrder.push(chainStarter);
    // const safeSpots = newGameState.nonEvictedHouseguests.size - 1;
    // let currentChooser: Houseguest = chainStarter;
    // const sceneContent: JSX.Element[] = [];
    // let first = true;
    // while (chainOrder.length < safeSpots) {
    //     const newSafeIndex = getBestFriend(currentChooser, options);
    //     chainOrder.push(options[newSafeIndex]);
    //     newGameState.currentLog.votes[currentChooser.id] = first
    //         ? new HoHVote(options[newSafeIndex].id)
    //         : new NormalVote(options[newSafeIndex].id);
    //     first = false;
    //     options.splice(newSafeIndex, 1);
    //     sceneContent.push(
    //         <Centered key={`safetychain-${newGameState.phase}-${chainOrder.length}`}>
    //             {currentChooser.name} has chosen {chainOrder[chainOrder.length - 1].name}!
    //             <Portraits
    //                 houseguests={[currentChooser, chainOrder[chainOrder.length - 1]]}
    //                 centered={true}
    //             />
    //         </Centered>
    //     );
    //     currentChooser = chainOrder[chainOrder.length - 1];
    // }
    // newGameState.currentLog.soleVoter = chainOrder[chainOrder.length - 2].name;
    // newGameState.currentLog.votes[chainOrder[chainOrder.length - 1].id] = new NomineeVote(false);
    // newGameState.currentLog.votes[options[0].id] = new NomineeVote(true);
    // newGameState.currentLog.nominationsPostVeto = [options[0].name, chainOrder[chainOrder.length - 1].name];
    // sceneContent.push(
    //     <Centered key={`safetychain-final-${newGameState.phase}-${chainOrder.length}`}>
    //         {options[0].name} has been left out!
    //         <Portrait houseguest={options[0]} centered={true} />
    //     </Centered>
    // );
    // evictHouseguest(newGameState, options[0].id); // TODO: newGameState = evicthouseguest...
    // const scene: Scene = new Scene({
    //     title: "Chain Ceremony",
    //     gameState: initialGameState,
    //     content: (
    //         <div>
    //             {sceneContent}
    //             <NextEpisodeButton />
    //         </div>
    //     ),
    // });
    // return [newGameState, scene];
}
