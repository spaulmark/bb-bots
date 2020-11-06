import { GameState, Houseguest, MutableGameState, randomPlayer } from "../../../model";
import { Scene } from "../scene";
import { Portrait } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { HoHVote } from "../../../model/logging/voteType";
import { heroShouldTargetSuperiors } from "../../../utils/ai/aiUtils";

export function generateHohCompScene(initialGameState: GameState): [GameState, Scene, Houseguest] {
    const newGameState = new MutableGameState(initialGameState);

    const previousHoh = initialGameState.previousHOH ? [initialGameState.previousHOH] : [];
    const newHoH: Houseguest = randomPlayer(newGameState.houseguests, previousHoh);
    newGameState.previousHOH = newHoH;
    newGameState.currentLog.votes[newHoH.id] = new HoHVote();
    newHoH.hohWins += 1;
    const scene = new Scene({
        title: "HoH Competition",
        gameState: initialGameState,
        content: (
            <div>
                <Centered>
                    {previousHoh.length > 0 &&
                        `Houseguests, it's time to find a new Head of Household. As outgoing HoH, ${previousHoh[0].name} will not compete. `}
                </Centered>
                <Portrait centered={true} houseguest={newHoH} />
                <CenteredBold>{newHoH.name} has won Head of Household!</CenteredBold>
                <br />
                <NextEpisodeButton />
            </div>
        ),
    });

    return [new GameState(newGameState), scene, newHoH];
}
