import { GameState, Houseguest, MutableGameState } from "../../../model";
import { Scene } from "./scene";
import { Portrait, Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { DividerBox } from "../../layout/box";
import { rng } from "../../../utils";
import { listNames } from "../../../utils/listStrings";

export function generateBotbScene(
    initialGameState: GameState,
    hohArray: Houseguest[],
    nomsArray: Houseguest[]
): [GameState, Scene, Houseguest, Houseguest[], Houseguest[]] {
    const newGameState = new MutableGameState(initialGameState);
    const hoh0wins = rng().flipCoin();
    const hoh = hohArray[hoh0wins ? 0 : 1];
    newGameState.previousHOH = [hoh];
    const noms = hoh0wins ? [nomsArray[0], nomsArray[1]] : [nomsArray[2], nomsArray[3]];
    const winners = hoh0wins ? [nomsArray[2], nomsArray[3]] : [nomsArray[0], nomsArray[1]];

    const block = (hohIndex: number, nomIndex: number) => {
        return (
            <div className="column">
                <div className="columns is-centered">
                    <div className="column">
                        <Portrait centered={true} houseguest={hohArray[hohIndex]} />
                    </div>
                </div>
                <div className="columns is-centered">
                    <DividerBox className={`column is-11`}>
                        <Portraits
                            centered={true}
                            houseguests={[nomsArray[nomIndex], nomsArray[nomIndex + 1]]}
                        />
                    </DividerBox>
                </div>
            </div>
        );
    };
    const block0 = block(0, 0);
    const block1 = block(1, 2);

    const scene = new Scene({
        title: "Battle of the Block",
        gameState: newGameState,
        content: (
            <div>
                <Centered>
                    {`This is the Battle of the Block competition. ${hohArray[0].name}'s nominees will battle ${hohArray[1].name}'s nominees to save themselves from the block. The winning pair will win safety for the week, and dethrone the HoH that nominated them.`}
                </Centered>
                <div className="columns is-centered">
                    {block0} {block1}
                </div>
                <Centered>...</Centered>
                <Portraits centered={true} houseguests={winners} />
                <CenteredBold>
                    {`${listNames(winners.map((w) => w.name))} have won the Battle of the Block!`}
                </CenteredBold>

                <div className="column">
                    <div className="columns is-centered">
                        <div className="column">
                            <Portrait centered={true} houseguest={hoh} />
                        </div>
                    </div>
                    <div className="columns is-centered">
                        <DividerBox className="column is-5">
                            <Portrait centered={true} houseguest={noms[0]} />
                        </DividerBox>
                        <DividerBox className="column is-5">
                            <Portrait centered={true} houseguest={noms[1]} />
                        </DividerBox>
                    </div>
                </div>

                <CenteredBold>
                    {`${listNames([hoh.name])} will remain as HoH, with ${listNames(
                        noms.map((n) => n.name)
                    )} as nominees.`}
                </CenteredBold>
                <br />
                {<NextEpisodeButton />}
            </div>
        ),
    });
    return [new GameState(newGameState), scene, hoh, noms, winners];
}
