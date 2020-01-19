import { GameState, getJurors, nonEvictedHouseguests } from "../../../model";
import { Scene } from "../scene";
import { castJuryVote } from "../../../utils/ai/aiApi";
import { Portraits } from "../../playerPortrait/portraits";
import React from "react";
import { ProfileHouseguest } from "../../memoryWall";
import { CenteredBold } from "../../layout/centered";
import { DividerBox } from "../../layout/box";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";

export function juryVoteScene(initialGameState: GameState): Scene {
    const jurors = getJurors(initialGameState);
    const finalists = nonEvictedHouseguests(initialGameState);
    const votes: Array<ProfileHouseguest[]> = [[], []];
    jurors.forEach(juror => {
        const decision = castJuryVote(juror, finalists);
        const result: ProfileHouseguest = { ...juror };
        votes[decision].push(result);
    });
    const votesFor0 = votes[0].length;
    const votesFor1 = votes[1].length;
    const isUnanimous = votesFor0 === 0 || votesFor1 === 0;
    const voteCountText = isUnanimous
        ? "By a unanimous vote..."
        : `By a vote of ${votesFor0} to ${votesFor1}...`;

    const winner = votesFor0 > votesFor1 ? finalists[0] : finalists[1];
    const scene = new Scene({
        title: "Jury Votes",
        gameState: initialGameState,
        content: (
            <div>
                <CenteredBold>{voteCountText}</CenteredBold>
                <div className="columns is-centered">
                    <DividerBox className="column">
                        <Portraits houseguests={votes[0]} centered={true} />
                    </DividerBox>
                    <DividerBox className="column">
                        <Portraits houseguests={votes[1]} centered={true} />
                    </DividerBox>
                </div>
                <Portraits houseguests={finalists} centered={true} />
                <CenteredBold>{`Congratulations, ${winner.name}... you are the winner of Big Brother!`}</CenteredBold>
                <NextEpisodeButton />
            </div>
        )
    });
    return scene;
}
