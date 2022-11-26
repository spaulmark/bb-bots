import {
    exclude,
    GameState,
    getMembersFromSplitIndex,
    Houseguest,
    MutableGameState,
    randomPlayer,
} from "../../../model";
import { Scene } from "./scene";
import { Portrait, Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { Centered, CenteredBold } from "../../layout/centered";
import { HoHVote } from "../../../model/logging/voteType";
import { listNames } from "../../../utils/listStrings";
import { isNotWellDefined } from "../../../utils";

interface HohCompOptions {
    doubleEviction?: boolean;
    customText?: string;
    coHoH?: boolean;
    coHohIsFinal?: boolean;
    skipHoHWin?: boolean;
    compName?: string;
    bottomText?: string;
    competitors?: Houseguest[];
    splitIndex?: number;
}

export function generateHohCompScene(
    initialGameState: GameState,
    options: HohCompOptions
): [GameState, Scene, Houseguest[]] {
    const newGameState = new MutableGameState(initialGameState);
    const houseguests = isNotWellDefined(options.splitIndex)
        ? newGameState.houseguests
        : getMembersFromSplitIndex(options.splitIndex, newGameState);
    const coHoH = options.coHoH || false;
    const coHohIsFinal = options.coHohIsFinal || false;
    const doubleEviction: boolean = options.doubleEviction || false;
    const previousHoh = initialGameState.previousHOH ? initialGameState.previousHOH : [];
    const competitors = options.competitors || exclude(houseguests, previousHoh);
    const newHoH: Houseguest = randomPlayer(competitors);
    const newHoH2: Houseguest = options.coHoH ? randomPlayer(competitors, [newHoH, ...previousHoh]) : newHoH;
    // set previous hoh
    if (!options.skipHoHWin) {
        (!coHoH || coHohIsFinal) && (newGameState.previousHOH = [newHoH]);
        coHoH && coHohIsFinal && (newGameState.previousHOH = [newHoH, newHoH2]);
        // add hoh vote in whatever
        (!coHoH || coHohIsFinal) && (newGameState.currentLog.votes[newHoH.id] = new HoHVote());
        coHoH && coHohIsFinal && (newGameState.currentLog.votes[newHoH2.id] = new HoHVote());
        // new hoh wins
        newHoH.hohWins += 1;
        coHoH && (newHoH2.hohWins += 1);
    }
    const portraitLine = coHoH ? (
        <Portraits centered={true} houseguests={[newHoH, newHoH2]} />
    ) : (
        <Portrait centered={true} houseguest={newHoH} />
    );
    const wonText = options.bottomText
        ? `${listNames([newHoH.name])} ${options.bottomText}`
        : `${coHoH ? listNames([newHoH.name, newHoH2.name]) : newHoH.name} ${
              coHoH ? "have" : "has"
          } won Head of Household!`;

    const scene = new Scene({
        title: "HoH Competition",
        gameState: initialGameState,
        content: (
            <div>
                {options.customText !== undefined ? (
                    <CenteredBold>{options.customText}</CenteredBold>
                ) : (
                    previousHoh.length > 0 &&
                    (doubleEviction ? (
                        <CenteredBold>
                            Houseguests, please return to the living room. Tonight will be a{" "}
                            {initialGameState.__logindex__ > 1 ? "another double" : "double"} eviction.
                        </CenteredBold>
                    ) : (
                        <Centered>
                            {`Houseguests, it's time to find a new Head of Household. As outgoing HoH, ${listNames(
                                previousHoh.map((h) => h.name)
                            )} will not compete.`}
                        </Centered>
                    ))
                )}
                {portraitLine}
                <CenteredBold>{wonText}</CenteredBold>
                <br />
                {!doubleEviction && <NextEpisodeButton />}
            </div>
        ),
    });

    return [new GameState(newGameState), scene, coHoH ? [newHoH, newHoH2] : [newHoH]];
}
