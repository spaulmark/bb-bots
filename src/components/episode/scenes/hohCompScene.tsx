import { GameState, Houseguest, MutableGameState, randomPlayer } from "../../../model";
import { Scene } from "../scene";
import { Portrait } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";

export function generateHohCompScene(initialGameState: GameState): [GameState, Scene, Houseguest] {
    const newGameState = new MutableGameState(initialGameState);

    const previousHoh = initialGameState.previousHOH ? [initialGameState.previousHOH] : [];
    const newHoH: Houseguest = randomPlayer(newGameState.houseguests, previousHoh);
    newGameState.previousHOH = newHoH;
    newGameState.phase++;
    newHoH.hohWins += 1;

    const scene = new Scene({
        title: "HoH Competition",
        gameState: initialGameState,
        content: (
            <div>
                {previousHoh.length > 0 &&
                    `Houseguests, it's time to find a new Head of Household. As outgoing HoH, ${
                        previousHoh[0].name
                    } will not compete. `}
                <Portrait houseguest={newHoH} />
                {newHoH.name} has won Head of Household!
                <br />
                <NextEpisodeButton />
            </div>
        )
    });

    return [new GameState(newGameState), scene, newHoH];
}
