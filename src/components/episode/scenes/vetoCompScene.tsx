import {
    GameState,
    Houseguest,
    MutableGameState,
    nonEvictedHouseguests,
    randomPlayer,
    getById
} from "../../../model";
import { Scene } from "../scene";
import { Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";

export function generateVetoCompScene(
    initialGameState: GameState,
    HoH: Houseguest,
    nom1: Houseguest,
    nom2: Houseguest
): [GameState, Scene, Houseguest] {
    const newGameState = new MutableGameState(initialGameState);

    // pick players
    const choices = nonEvictedHouseguests(newGameState);
    let povPlayers: any[] = [];
    const everyoneWillPlay = choices.length <= 6;

    if (everyoneWillPlay) {
        povPlayers.push({ ...HoH });
        povPlayers.push({ ...nom1 });
        povPlayers.push({ ...nom2 });
        while (povPlayers.length < choices.length) {
            povPlayers.push({ ...randomPlayer(choices, povPlayers) });
        }
    } else {
        // TODO: houseguests choice picks
        povPlayers.push({ ...HoH });
        povPlayers.push({ ...nom1 });
        povPlayers.push({ ...nom2 });
        povPlayers.push({ ...randomPlayer(choices, povPlayers) });
        povPlayers.push({ ...randomPlayer(choices, povPlayers) });
        povPlayers.push({ ...randomPlayer(choices, povPlayers) });
    }
    let povWinner = randomPlayer(povPlayers);
    povWinner = getById(newGameState, povWinner.id);
    povWinner.povWins++;
    newGameState.currentLog.vetoWinner = povWinner.name;
    let introText: string;
    if (everyoneWillPlay) {
        introText = "Everyone left in the house will compete in this challenge.";
    } else {
        introText = `${HoH.name}, as Head of Household, and ${nom1.name} and ${nom2.name} as nominees, will compete, as well as 3 others chosen by random draw.`;
    }
    const extras = [povPlayers[3]];
    povPlayers[4] && extras.push(povPlayers[4]);
    povPlayers[5] && extras.push(povPlayers[5]);
    const scene = new Scene({
        title: "Veto Competition",
        gameState: initialGameState,
        content: (
            <div>
                <Centered>It's time to pick players for the veto competition.</Centered>
                <Portraits centered={true} houseguests={[HoH, nom1, nom2]} />
                <Centered>{introText}</Centered>
                <Portraits centered={true} houseguests={extras} />
                <Centered>...</Centered>
                <Portraits centered={true} houseguests={[povWinner]} />
                <CenteredBold>{`${povWinner.name} has won the Golden Power of Veto!`}</CenteredBold>
                <NextEpisodeButton />
            </div>
        )
    });
    return [new GameState(newGameState), scene, povWinner];
}
