import { GameState, getJurors, nonEvictedHouseguests } from "../../../model";
import { Scene } from "../scene";
import { castJuryVote } from "../../../utils/ai/aiApi";
import { Portrait } from "../../playerPortrait/portraits";
import React from "react";

export function juryVoteScene(initialGameState: GameState): Scene {
    const jurors = getJurors(initialGameState);
    const finalists = nonEvictedHouseguests(initialGameState);
    let voteCount = [0, 0];
    const votes = jurors.map(juror => {
        const result = castJuryVote(juror, finalists);
        voteCount[result]++;
        return result;
    });
    const voteBlocks = [];

    // TODO: the formatting on this episode sucks...
    for (let i = 0; i < votes.length; i++) {
        voteBlocks.push(
            <div className="columns" key={`jury-vote${i}`}>
                <Portrait houseguest={jurors[i]} />
                <p>
                    <b>{`${jurors[i].name} has voted for...`}</b>
                </p>
                <Portrait houseguest={finalists[votes[i]]} />
            </div>
        );
    }
    const winner = voteCount[0] > voteCount[1] ? finalists[0] : finalists[1];

    const scene: Scene = new Scene({
        title: "Jury Votes",
        gameState: initialGameState,
        content: (
            <div>
                {voteBlocks}
                <Portrait houseguest={winner} />
                {`Congratulations, ${winner.name}, you are the winner of Big Brother!!!`}
            </div>
        )
    });
    return scene;
}
