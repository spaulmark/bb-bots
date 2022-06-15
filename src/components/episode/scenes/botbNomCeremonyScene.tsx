import { GameState, Houseguest, MutableGameState, getById, exclude } from "../../../model";
import { Scene } from "./scene";
import { Portrait, Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { DividerBox } from "../../layout/box";
import { backdoorNPlayers } from "../../../utils/ai/aiApi";
import { listNames } from "../../../utils/listStrings";

export function generateBotbNomCeremonyScene(
    initialGameState: GameState,
    hoh1: Houseguest,
    hoh2: Houseguest
): [GameState, Scene, Houseguest[][]] {
    const newGameState = new MutableGameState(initialGameState);

    const exclusions = [hoh1, hoh2];
    const noms1: Houseguest[] = [];
    const noms2: Houseguest[] = [];
    for (let i = 0; i < 4; i++) {
        const hoh = i % 2 === 0 ? hoh1 : hoh2;
        const nextNom: Houseguest = getById(
            newGameState,
            backdoorNPlayers(hoh, exclude(newGameState.houseguests, exclusions), newGameState, 1)[0].decision
        );
        exclusions.push(nextNom);
        i % 2 === 0 ? noms1.push(nextNom) : noms2.push(nextNom);
    }
    [noms1, noms2].forEach((arr) => arr.forEach((nom) => nom.nominations++));
    newGameState.currentLog.nominationsPreVeto = [...noms1, ...noms2].map((nom) => nom.name);

    newGameState.currentLog.nominationsPreVeto = require("alphanum-sort")(
        newGameState.currentLog.nominationsPreVeto
    );
    const finalStatement = (noms: Houseguest[]) =>
        `I have nominated you, ${listNames(noms.map((n) => n.name))} for eviction. `;
    const firstText = "My first nominee is...";
    const secondText = "My second nominee is...";
    const scene = new Scene({
        title: "Nomination Ceremony",
        gameState: newGameState,
        content: (
            <div>
                <Centered>
                    This is the nomination ceremony. It is our responsibility as Heads of Household to each
                    nominate two houseguests for eviction.
                </Centered>
                <Portraits centered={true} houseguests={[hoh1]} />
                <div className="columns is-marginless is-centered">
                    <DividerBox className="column">
                        <Centered>{firstText}</Centered>
                        <Portrait centered={true} houseguest={noms1[0]} />
                    </DividerBox>
                    <DividerBox className="column">
                        <Centered>{secondText}</Centered>
                        <Portrait centered={true} houseguest={noms1[1]} />
                    </DividerBox>
                </div>
                <CenteredBold>{finalStatement(noms1)}</CenteredBold>
                <div style={{ marginTop: 50 }} />
                <Portraits centered={true} houseguests={[hoh2]} />
                <div className="columns is-marginless is-centered">
                    <DividerBox className="column">
                        <Centered>{firstText}</Centered>
                        <Portrait centered={true} houseguest={noms2[0]} />
                    </DividerBox>
                    <DividerBox className="column">
                        <Centered>{secondText}</Centered>
                        <Portrait centered={true} houseguest={noms2[1]} />
                    </DividerBox>
                </div>
                <CenteredBold>{finalStatement(noms2)}</CenteredBold>
                <br />
                {<NextEpisodeButton />}
            </div>
        ),
    });
    return [new GameState(newGameState), scene, [noms1, noms2]];
}
