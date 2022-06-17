import { GameState, Houseguest, MutableGameState, getById, exclude } from "../../../model";
import { Scene } from "./scene";
import { shuffle } from "lodash";
import { Portrait, Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { DividerBox } from "../../layout/box";
import { backdoorNPlayers } from "../../../utils/ai/aiApi";
import { listNames } from "../../../utils/listStrings";

interface NomCeremonyOptions {
    doubleEviction?: boolean;
    thirdNominee?: boolean;
}

export function generateNomCeremonyScene(
    initialGameState: GameState,
    hohList: Houseguest[],
    options: NomCeremonyOptions
): [GameState, Scene, Houseguest[]] {
    const newGameState = new MutableGameState(initialGameState);
    const HoH = hohList[0];
    const coHoH = hohList.length > 1 ? hohList[1] : undefined;
    const doubleEviction = options.doubleEviction || false;

    const nom1: Houseguest = getById(
        newGameState,
        backdoorNPlayers(
            HoH,
            exclude(newGameState.houseguests, coHoH ? [HoH, coHoH] : [HoH]),
            newGameState,
            1
        )[0].decision
    );

    const nom2 = coHoH
        ? getById(
              newGameState,
              backdoorNPlayers(
                  coHoH,
                  exclude(newGameState.houseguests, [HoH, coHoH, nom1]),
                  newGameState,
                  1
              )[0].decision
          )
        : getById(
              newGameState,
              backdoorNPlayers(HoH, exclude(newGameState.houseguests, [HoH, nom1]), newGameState, 1)[0]
                  .decision
          );
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
        newGameState.currentLog.nominationsPreVeto.push(nom3.name);
    }
    newGameState.currentLog.nominationsPreVeto = require("alphanum-sort")(
        newGameState.currentLog.nominationsPreVeto
    );
    const shuffleOrDont = coHoH ? (a: Houseguest[]): Houseguest[] => a : shuffle;
    const noms = nom3 ? shuffleOrDont([nom1, nom2, nom3]) : shuffleOrDont([nom1, nom2]);
    const weI = coHoH ? "We" : "I";
    const finalStatement = `${weI} have nominated you, ${listNames(noms.map((n) => n.name))} for eviction. `;
    const myOur = coHoH ? "our" : "my";
    const theHoH = coHoH ? "Heads of Household" : "the Head of Household";
    const firstText = coHoH ? `${HoH.name} has nominated...` : "My first nominee is...";
    const secondText = coHoH ? `${coHoH.name} has nominated...` : "My second nominee is...";
    const scene = new Scene({
        title: "Nomination Ceremony",
        gameState: newGameState,
        content: (
            <div>
                <Centered>
                    {!doubleEviction &&
                        `This is the nomination ceremony. It is ${myOur} responsibility as ${theHoH} to
                    nominate ${options.thirdNominee ? `three` : `two`} houseguests for eviction.`}
                </Centered>
                {!doubleEviction && <Portraits centered={true} houseguests={hohList} />}
                <div className="columns is-marginless is-centered">
                    <DividerBox className="column">
                        <Centered>{firstText}</Centered>
                        <Portrait centered={true} houseguest={noms[0]} />
                    </DividerBox>
                    <DividerBox className="column">
                        <Centered>{secondText}</Centered>
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
