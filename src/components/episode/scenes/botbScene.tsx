import { GameState, Houseguest, MutableGameState, getById, exclude } from "../../../model";
import { Scene } from "./scene";
import { Portrait, Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { DividerBox } from "../../layout/box";
import { backdoorNPlayers } from "../../../utils/ai/aiApi";
import { listNames } from "../../../utils/listStrings";
import { rng } from "../../../utils";

export function generateBotbScene(
    initialGameState: GameState,
    hohArray: Houseguest[],
    nomsArray: Houseguest[]
): [GameState, Scene, Houseguest, Houseguest[]] {
    const newGameState = new MutableGameState(initialGameState);
    console.log(hohArray, nomsArray);
    const hoh0wins = rng().flipCoin();
    const hoh = hohArray[hoh0wins ? 0 : 1];
    const noms = hoh0wins ? [nomsArray[0], nomsArray[1]] : [nomsArray[2], nomsArray[3]];
    const scene = new Scene({
        title: "Battle of the Block",
        gameState: newGameState,
        content: (
            <div>
                <Centered>
                    {`This is the Battle of the Block competition. ${hohArray[0].name}'s nominees will battle ${hohArray[1].name}'s nominees to save themselves from the block. The winning pair will win safety for the week, and dethrone the HoH that nominated them.`}
                </Centered>
                <div className="columns is-marginless is-centered is-mobile">
                    <div className="column">
                        <Portrait centered={true} houseguest={hohArray[0]} />
                    </div>
                    <div className="column">
                        <Portrait centered={true} houseguest={hohArray[1]} />
                    </div>
                </div>
                <div className="columns is-marginless is-centered">
                    <DividerBox className="column">
                        <Portraits centered={true} houseguests={[nomsArray[0], nomsArray[1]]} />
                    </DividerBox>
                    <DividerBox className="column">
                        <Portraits centered={true} houseguests={[nomsArray[2], nomsArray[3]]} />
                    </DividerBox>
                </div>
                <br />
                {<NextEpisodeButton />}
            </div>
        ),
    });
    return [new GameState(newGameState), scene, hoh, noms];
}
