import {
    GameState,
    Houseguest,
    MutableGameState,
    nonEvictedHouseguests,
    randomPlayer,
    getById
} from "../../../model";
import { Scene } from "../scene";
import { Portraits, Portrait } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";

export function finalHohCompScene(initialGameState: GameState): [GameState, Scene, Houseguest] {
    const newGameState = new MutableGameState(initialGameState);
    const final3 = nonEvictedHouseguests(initialGameState);
    const enduranceWinner = randomPlayer(final3);
    const enduranceLosers = final3.filter(hg => hg.id !== enduranceWinner.id);
    const skillWinner = randomPlayer(final3, [enduranceWinner]);
    const finalHoH = getById(newGameState, randomPlayer([enduranceWinner, skillWinner]).id);
    finalHoH.hohWins++;
    const scene: Scene = new Scene({
        title: "Final HoH Competition",
        gameState: newGameState,
        content: (
            <div>
                <p>The final 3 houseguests compete in the endurance competition.</p>
                <Portraits houseguests={final3} />
                <Portrait houseguest={enduranceWinner} />
                <p>
                    <b>{`${enduranceWinner.name} has won the endurance competition!`}</b>
                </p>
                <hr />
                <p>{`${enduranceLosers[0].name} and ${
                    enduranceLosers[1].name
                } compete in the skill competition.`}</p>
                <Portraits houseguests={enduranceLosers} />
                <Portrait houseguest={skillWinner} />
                <p>
                    <b>{`${skillWinner.name} has won the skill competition!`}</b>
                </p>
                <hr />
                <p>{`${enduranceWinner.name} and ${skillWinner.name} compete in the quiz competition.`}</p>
                <Portraits houseguests={[enduranceWinner, skillWinner]} />
                <Portrait houseguest={finalHoH} />
                <p>
                    <b>{`Congratulations ${finalHoH.name}, you are the final Head of Household!`}</b>
                </p>
                <NextEpisodeButton />
            </div>
        )
    });
    newGameState.phase++;
    return [new GameState(newGameState), scene, finalHoH];
}
