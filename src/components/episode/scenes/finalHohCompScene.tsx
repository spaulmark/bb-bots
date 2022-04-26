import {
    GameState,
    Houseguest,
    MutableGameState,
    nonEvictedHouseguests,
    randomPlayer,
    getById,
} from "../../../model";
import { Scene } from "./scene";
import { Portraits, Portrait } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";

export function finalHohCompScene(initialGameState: GameState): [GameState, Scene, Houseguest] {
    const newGameState = new MutableGameState(initialGameState);
    const final3 = nonEvictedHouseguests(initialGameState);
    const enduranceWinner = randomPlayer(final3);
    const enduranceLosers = final3.filter((hg) => hg.id !== enduranceWinner.id);
    const skillWinner = randomPlayer(final3, [enduranceWinner]);
    const finalHoH = getById(newGameState, randomPlayer([enduranceWinner, skillWinner]).id);
    finalHoH.hohWins++;
    const scene: Scene = new Scene({
        title: "Final HoH Competition",
        gameState: newGameState,
        content: (
            <div>
                <Centered>The final 3 houseguests compete in the endurance competition.</Centered>
                <Portraits houseguests={final3} centered={true} />
                <Portrait houseguest={enduranceWinner} centered={true} />
                <CenteredBold>{`${enduranceWinner.name} has won the endurance competition!`}</CenteredBold>
                <hr />
                <Centered>{`${enduranceLosers[0].name} and ${enduranceLosers[1].name} compete in the skill competition.`}</Centered>
                <Portraits houseguests={enduranceLosers} centered={true} />
                <Portrait houseguest={skillWinner} centered={true} />
                <CenteredBold>{`${skillWinner.name} has won the skill competition!`}</CenteredBold>
                <hr />
                <Centered>{`${enduranceWinner.name} and ${skillWinner.name} compete in the quiz competition.`}</Centered>
                <Portraits houseguests={[enduranceWinner, skillWinner]} centered={true} />
                <Portrait houseguest={finalHoH} centered={true} />
                <CenteredBold>{`Congratulations ${finalHoH.name}, you are the final Head of Household!`}</CenteredBold>
                <NextEpisodeButton />
            </div>
        ),
    });
    return [new GameState(newGameState), scene, finalHoH];
}
