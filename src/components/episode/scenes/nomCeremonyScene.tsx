import {
    GameState,
    Houseguest,
    MutableGameState,
    exclude,
    nonEvictedHouseguests,
    getById
} from "../../../model";
import { Scene } from "../scene";
import { shuffle } from "lodash";
import { Portrait } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { nominateNPlayers } from "../../../utils/ai/aiApi";

export function generateNomCeremonyScene(
    initialGameState: GameState,
    HoH: Houseguest
): [GameState, Scene, Houseguest[]] {
    const newGameState = new MutableGameState(initialGameState);
    const options = exclude(nonEvictedHouseguests(newGameState), [HoH]);
    const nom1 = getById(newGameState, nominateNPlayers(HoH, options, newGameState, 2)[0].decision);
    const nom2 = getById(
        newGameState,
        nominateNPlayers(HoH, exclude(options, [nom1]), newGameState, 2)[1].decision
    );
    nom1.nominations++;
    nom2.nominations++;
    const noms = shuffle([nom1, nom2]);
    const scene = new Scene({
        title: "Nomination Ceremony",
        gameState: newGameState,
        content: (
            <div>
                <Portrait houseguest={HoH} />
                <br />
                This is the nomination ceremony. It is my responsibility as the Head of Household to nominate
                two houseguests for eviction.
                <br />
                <b>
                    My first nominee is...
                    <br />
                    <Portrait houseguest={noms[0]} />
                    <br />
                    My second nominee is...
                    <br />
                    <Portrait houseguest={noms[1]} />
                    {`I have nominated you, ${noms[0].name} and you, ${noms[1].name} for eviction.`}
                    <br />
                </b>
                <NextEpisodeButton />
            </div>
        )
    });
    return [new GameState(newGameState), scene, [nom1, nom2]];
}
