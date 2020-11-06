import {
    GameState,
    Houseguest,
    MutableGameState,
    exclude,
    nonEvictedHouseguests,
    getById,
} from "../../../model";
import { Scene } from "../scene";
import { shuffle } from "lodash";
import { Portrait } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { DividerBox } from "../../layout/box";

export function generateNomCeremonyScene(
    initialGameState: GameState,
    HoH: Houseguest
): [GameState, Scene, Houseguest[]] {
    const newGameState = new MutableGameState(initialGameState);
    const options = exclude(nonEvictedHouseguests(newGameState), [HoH]);
    const [nom1, nom2] = [getById(newGameState, HoH.targets[0]), getById(newGameState, HoH.targets[1])];
    nom1.nominations++;
    nom2.nominations++;
    newGameState.currentLog.nominationsPreVeto = [nom1.name, nom2.name];
    const noms = shuffle([nom1, nom2]);
    const scene = new Scene({
        title: "Nomination Ceremony",
        gameState: newGameState,
        content: (
            <div>
                <Centered>
                    This is the nomination ceremony. It is my responsibility as the Head of Household to
                    nominate two houseguests for eviction.
                </Centered>
                <Portrait centered={true} houseguest={HoH} />
                <div className="columns is-marginless is-centered">
                    <DividerBox className="column">
                        <Centered> My first nominee is...</Centered>
                        <Portrait centered={true} houseguest={noms[0]} />
                    </DividerBox>
                    <DividerBox className="column">
                        <Centered>My second nominee is...</Centered>
                        <Portrait centered={true} houseguest={noms[1]} />
                    </DividerBox>
                </div>
                <CenteredBold>{`I have nominated you, ${noms[0].name} and you, ${noms[1].name} for eviction.`}</CenteredBold>
                <br />
                <NextEpisodeButton />
            </div>
        ),
    });
    return [new GameState(newGameState), scene, [nom1, nom2]];
}
