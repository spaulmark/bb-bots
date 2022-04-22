import {
    GameState,
    Houseguest,
    MutableGameState,
    nonEvictedHouseguests,
    randomPlayer,
    getById,
} from "../../../model";
import { Scene } from "./scene";
import { Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { listNames } from "../../../utils/names";

export function generateVetoCompScene(
    initialGameState: GameState,
    HoH: Houseguest,
    nominees: Houseguest[],
    doubleEviction: boolean = false
): [GameState, Scene, Houseguest] {
    const newGameState = new MutableGameState(initialGameState);

    // pick players
    const choices = nonEvictedHouseguests(newGameState);
    let povPlayers: any[] = [];
    const everyoneWillPlay = choices.length <= 6;

    if (everyoneWillPlay) {
        povPlayers.push({ ...HoH });
        nominees.forEach((nominee) => povPlayers.push({ ...nominee }));
        while (povPlayers.length < choices.length) {
            povPlayers.push({ ...randomPlayer(choices, povPlayers) });
        }
    } else {
        povPlayers.push({ ...HoH });
        nominees.forEach((nominee) => povPlayers.push({ ...nominee }));
        while (povPlayers.length < 6) {
            povPlayers.push({ ...randomPlayer(choices, povPlayers) });
        }
    }
    let povWinner = randomPlayer(povPlayers);
    povWinner = getById(newGameState, povWinner.id);
    povWinner.povWins++;
    newGameState.currentLog.vetoWinner = povWinner.name;
    let introText: string;
    if (everyoneWillPlay) {
        introText = "Everyone left in the house will compete in this challenge.";
    } else {
        introText = `${HoH.name}, as Head of Household, and ${listNames(
            nominees.map((nom) => nom.name)
        )} as nominees, will compete, as well as ${6 - 1 - nominees.length} others chosen by random draw.`; // this line assumes hoh plays in veto (-1)
    }
    const extras = nominees[2] ? [] : [povPlayers[3]];
    const firstRow = [povPlayers[0], povPlayers[1], povPlayers[2]];
    nominees[2] && firstRow.push(povPlayers[3]);
    povPlayers[4] && extras.push(povPlayers[4]);
    povPlayers[5] && extras.push(povPlayers[5]);
    const scene = new Scene({
        title: "Veto Competition",
        gameState: initialGameState,
        content: (
            <div>
                <Centered>
                    {doubleEviction
                        ? "The houseguests compete in the veto competition."
                        : "It's time to pick players for the veto competition."}
                </Centered>
                <Portraits centered={true} houseguests={firstRow} />
                {!doubleEviction && <Centered>{introText}</Centered>}
                <Portraits centered={true} houseguests={extras} />
                <Centered>...</Centered>
                <Portraits centered={true} houseguests={[povWinner]} />
                <CenteredBold>{`${povWinner.name} has won the Golden Power of Veto!`}</CenteredBold>
                {!doubleEviction && <NextEpisodeButton />}
            </div>
        ),
    });
    return [new GameState(newGameState), scene, povWinner];
}
