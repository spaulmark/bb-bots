import { GameState, Houseguest, MutableGameState, nonEvictedHouseguests, getById } from "../../../model";
import { Scene } from "../scene";
import { shuffle } from "lodash";
import { ProfileHouseguest } from "../../memoryWall";
import { castEvictionVote } from "../../../utils/ai/aiApi";
import { evictHouseguest } from "../bigBrotherEpisode";
import { Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { CenteredBold, Centered } from "../../layout/centered";
import { DividerBox } from "../../layout/box";
import { NomineeVote, NormalVote, HoHVote } from "../../../model/logging/voteType";

export function generateEvictionScene(
    initialGameState: GameState,
    HoH: Houseguest,
    nominees: Houseguest[]
): [GameState, Scene] {
    const newGameState = new MutableGameState(initialGameState);
    nominees = shuffle(nominees);
    const votes: Array<ProfileHouseguest[]> = [[], []];
    nonEvictedHouseguests(newGameState).forEach(hg => {
        if (hg.id !== nominees[0].id && hg.id !== nominees[1].id && hg.id !== HoH.id) {
            const logic = castEvictionVote(hg, nominees, newGameState);
            const result: ProfileHouseguest = { ...hg };
            result.tooltip = logic.reason;
            newGameState.currentLog.votes[hg.id] = new NormalVote(nominees[logic.decision].id);
            votes[logic.decision].push(result);
        }
    });
    const votesFor0 = votes[0].length;
    const votesFor1 = votes[1].length;

    newGameState.currentLog.votes[nominees[0].id] = new NomineeVote();
    newGameState.currentLog.votes[nominees[1].id] = new NomineeVote();

    let tieVote = votesFor0 === votesFor1;
    let tieBreaker = { decision: 0, reason: "Error you should not be seeing this" };
    if (tieVote) {
        tieBreaker = castEvictionVote(HoH, nominees, newGameState);
        newGameState.currentLog.votes[HoH.id] = new HoHVote(nominees[tieBreaker.decision].id);
    }
    let evictee: Houseguest;
    if (votesFor0 > votesFor1) {
        evictee = nominees[0];
        newGameState.currentLog.votesInMajority = votesFor0;
    } else if (votesFor1 > votesFor0) {
        evictee = nominees[1];
        newGameState.currentLog.votesInMajority = votesFor1;
    } else {
        evictee = nominees[tieBreaker.decision];
        newGameState.currentLog.votesInMajority = votesFor1 + 1;
    }
    evictHouseguest(newGameState, evictee.id);
    const isUnanimous = votesFor0 === 0 || votesFor1 === 0;
    const voteCountText = isUnanimous
        ? "By a unanimous vote..."
        : `By a vote of ${votesFor0} to ${votesFor1}...`;

    const displayHoH: ProfileHouseguest = { ...HoH };
    displayHoH.tooltip = tieBreaker.reason;
    const scene = new Scene({
        title: "Live Eviction",
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
                {tieVote && (
                    <div>
                        <CenteredBold> We have a tie.</CenteredBold>
                        <Centered>{`${HoH.name}, as current Head of Household, you must cast the sole vote to evict.`}</Centered>
                        <Portraits houseguests={[displayHoH]} centered={true} />
                        <CenteredBold>I vote to evict {`${evictee.name}.`}</CenteredBold>
                    </div>
                )}
                <Portraits
                    houseguests={[
                        getById(newGameState, nominees[0].id),
                        getById(newGameState, nominees[1].id)
                    ]}
                    centered={true}
                />
                <CenteredBold>{`${evictee.name}... you have been evicted from the Big Brother House.`}</CenteredBold>
                <NextEpisodeButton />
            </div>
        )
    });
    return [newGameState, scene];
}
