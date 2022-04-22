import { GameState, Houseguest, MutableGameState, getById, exclude } from "../../../model";
import { Scene } from "./scene";
import { shuffle } from "lodash";
import { Portrait } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { DividerBox } from "../../layout/box";
import { backdoorNPlayers } from "../../../utils/ai/aiApi";

interface NomCeremonyOptions {
    doubleEviction: boolean;
    thirdNominee?: boolean;
}

export function generateNomCeremonyScene(
    initialGameState: GameState,
    HoH: Houseguest,
    options: NomCeremonyOptions
): [GameState, Scene, Houseguest[]] {
    const newGameState = new MutableGameState(initialGameState);
    const doubleEviction = options.doubleEviction;
    const [nom1, nom2] = [getById(newGameState, HoH.targets[0]), getById(newGameState, HoH.targets[1])];
    nom1.nominations++;
    nom2.nominations++;
    newGameState.currentLog.nominationsPreVeto = [nom1.name, nom2.name];
    let nom3: Houseguest | undefined;
    if (options.thirdNominee) {
        nom3 = getById(
            newGameState,
            backdoorNPlayers(HoH, exclude(newGameState.houseguests, [HoH, nom1, nom2]), newGameState, 1)[0]
                .decision
        );
        nom3.nominations++;
    }
    const noms = nom3 ? shuffle([nom1, nom2, nom3]) : shuffle([nom1, nom2]);
    const finalStatement = options.thirdNominee
        ? `I have nominated you, ${noms[0].name}, ${noms[1].name}, and ${noms[2].name} for eviction. `
        : `I have nominated you, ${noms[0].name} and you, ${noms[1].name} for eviction.`;
    const scene = new Scene({
        title: "Nomination Ceremony",
        gameState: newGameState,
        content: (
            <div>
                <Centered>
                    {!doubleEviction &&
                        `This is the nomination ceremony. It is my responsibility as the Head of Household to
                    nominate ${options.thirdNominee ? `three` : `two`} houseguests for eviction.`}
                </Centered>
                {!doubleEviction && <Portrait centered={true} houseguest={HoH} />}
                <div className="columns is-marginless is-centered">
                    <DividerBox className="column">
                        <Centered> My first nominee is...</Centered>
                        <Portrait centered={true} houseguest={noms[0]} />
                    </DividerBox>
                    <DividerBox className="column">
                        <Centered>My second nominee is...</Centered>
                        <Portrait centered={true} houseguest={noms[1]} />
                    </DividerBox>
                    {options.thirdNominee && (
                        <DividerBox className="column">
                            <Centered>My third nominee is...</Centered>
                            <Portrait centered={true} houseguest={noms[2]} />
                        </DividerBox>
                    )}
                </div>
                <CenteredBold>{finalStatement}</CenteredBold>
                <br />
                {!doubleEviction && <NextEpisodeButton />}
            </div>
        ),
    });
    return [new GameState(newGameState), scene, noms];
}
