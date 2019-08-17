import { GameState, Houseguest, MutableGameState, nonEvictedHouseguests, getById } from "../../../model";
import { Scene } from "../scene";
import { shuffle } from "lodash";
import { ProfileHouseguest } from "../../memoryWall";
import { castEvictionVote } from "../../../utils/ai/aiApi";
import { evictHouseguest } from "../bigBrotherEpisode";
import { Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";

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
            votes[logic.vote].push(result);
        }
    });
    const votesFor0 = votes[0].length;
    const votesFor1 = votes[1].length;

    let tieVote = votesFor0 === votesFor1;
    let tieBreaker = { vote: 0, reason: "Error you should not be seeing this" };
    if (tieVote) {
        tieBreaker = castEvictionVote(HoH, nominees, newGameState);
    }
    let evictee: Houseguest;
    if (votesFor0 > votesFor1) {
        evictee = nominees[0];
    } else if (votesFor1 > votesFor0) {
        evictee = nominees[1];
    } else {
        evictee = nominees[tieBreaker.vote];
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
                <p style={{ textAlign: "center" }}>
                    <b>{voteCountText} </b>
                </p>
                <div className="columns is-centered">
                    <div className="column box">
                        <Portraits houseguests={votes[0]} centered={true} />
                    </div>
                    <div className="column box">
                        <Portraits houseguests={votes[1]} centered={true} />
                    </div>
                </div>
                {tieVote && (
                    <div>
                        <p style={{ textAlign: "center" }}>
                            <b> We have a tie.</b> <br />
                            {`${
                                HoH.name
                            }, as current Head of Household, you must cast the sole vote to evict.`}
                        </p>
                        <Portraits houseguests={[displayHoH]} centered={true} />
                        <p style={{ textAlign: "center" }}>
                            <b>I vote to evict {`${evictee.name}.`}</b>
                        </p>
                    </div>
                )}

                <Portraits
                    houseguests={[
                        getById(newGameState, nominees[0].id),
                        getById(newGameState, nominees[1].id)
                    ]}
                    centered={true}
                />
                <p style={{ textAlign: "center" }}>
                    <b>{`${evictee.name}... you have been evicted from the Big Brother House.`}</b>
                </p>
                <NextEpisodeButton />
            </div>
        )
    });
    return [newGameState, scene];
}
