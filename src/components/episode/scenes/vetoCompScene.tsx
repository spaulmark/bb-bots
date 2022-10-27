import {
    GameState,
    Houseguest,
    MutableGameState,
    nonEvictedHouseguests,
    randomPlayer,
    getById,
    exclude,
} from "../../../model";
import { Scene } from "./scene";
import { Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { listNames } from "../../../utils/listStrings";
import { Veto } from "../veto/veto";

export function generateVetoCompScene(
    initialGameState: GameState,
    HoHs: Houseguest[],
    nominees: Houseguest[],
    veto: Veto,
    doubleEviction: boolean = false
): [GameState, Scene, Houseguest] {
    const newGameState = new MutableGameState(initialGameState);

    const hohPlaysVeto = newGameState.hohPlaysVeto || newGameState.remainingPlayers <= 5 || HoHs.length > 1;
    const maxVetoPlayers = hohPlaysVeto ? 6 : 5;

    // pick players
    const choices = exclude(nonEvictedHouseguests(newGameState), HoHs);
    let povPlayers: any[] = [];
    const everyoneWillPlay = nonEvictedHouseguests(newGameState).length <= maxVetoPlayers;
    if (everyoneWillPlay) {
        HoHs.forEach((hoh) => povPlayers.push({ ...hoh }));
        nominees.forEach((nominee) => povPlayers.push({ ...nominee }));
        while (exclude(choices, povPlayers).length > 0) {
            povPlayers.push({ ...randomPlayer(choices, povPlayers) });
        }
    } else {
        hohPlaysVeto && HoHs.forEach((hoh) => povPlayers.push({ ...hoh }));
        nominees.forEach((nominee) => povPlayers.push({ ...nominee }));
        while (povPlayers.length < maxVetoPlayers) {
            povPlayers.push({ ...randomPlayer(choices, povPlayers) });
        }
    }
    let povWinner = randomPlayer(povPlayers);
    povWinner = getById(newGameState, povWinner.id);
    povWinner.povWins++;
    newGameState.currentLog.vetoWinner = povWinner.name;
    newGameState.currentLog.vetoEmoji = veto.emoji;
    let introText: string;
    if (everyoneWillPlay) {
        introText = "Everyone left in the house will compete in this challenge.";
    } else {
        introText = `${
            hohPlaysVeto ? `${listNames(HoHs.map((h) => h.name))}, as Head of Household, and ` : ``
        }${listNames(nominees.map((nom) => nom.name))} as nominees, will compete, as well as ${
            povPlayers.length - (hohPlaysVeto ? HoHs.length : 0) - nominees.length
        } others chosen by random draw.`;
    }
    const firstRow = [...(hohPlaysVeto ? HoHs : []), ...nominees];
    const extras = [];
    for (let i = firstRow.length; i < povPlayers.length; i++) {
        extras.push(povPlayers[i]);
    }
    const vetoEmoji = veto.emoji ? `${veto.emoji} ` : "";
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
                <CenteredBold>{`${povWinner.name} has won the ${vetoEmoji}${veto.name}!`}</CenteredBold>
                {!doubleEviction && <NextEpisodeButton />}
            </div>
        ),
    });
    return [new GameState(newGameState), scene, povWinner];
}
