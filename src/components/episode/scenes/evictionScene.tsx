import { GameState, Houseguest, MutableGameState, nonEvictedHouseguests, getById } from "../../../model";
import { Scene } from "./scene";
import { shuffle } from "lodash";
import { ProfileHouseguest } from "../../memoryWall";
import { castEvictionVote, castVoteToSave, NumberWithLogic } from "../../../utils/ai/aiApi";
import { Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { CenteredBold, Centered } from "../../layout/centered";
import { DividerBox } from "../../layout/box";
import { NomineeVote, NormalVote, HoHVote, SaveVote, VoteType } from "../../../model/logging/voteType";
import { evictHouseguest } from "../utilities/evictHouseguest";
import { listNames, listVotes } from "../../../utils/listStrings";

function getHighestIndicies(numbers: number[]): number[] {
    const highest = Math.max(...numbers);
    const highestIndicies = numbers.reduce((acc: any[], cur, i) => {
        if (cur === highest) {
            acc.push(i);
        }
        return acc;
    }, []);
    return highestIndicies;
}

interface TieBreaker {
    hg: Houseguest;
    text: string;
    voteType: (id: number) => VoteType;
}

interface EvictionSceneOptions {
    votingTo: "Save" | "Evict";
    doubleEviction?: boolean;
    tieBreaker?: TieBreaker;
}

export function generateEvictionScene(
    initialGameState: GameState,
    hohArray: Houseguest[],
    nominees: Houseguest[],
    options: EvictionSceneOptions
): [GameState, Scene] {
    const doubleEviction = options.doubleEviction || false;
    const castVote: (hero: Houseguest, noms: Houseguest[], gameState: GameState) => NumberWithLogic =
        options.votingTo === "Save" ? castVoteToSave : castEvictionVote;
    let newGameState = new MutableGameState(initialGameState);
    newGameState.currentLog.votingTo = options.votingTo;
    nominees = shuffle(nominees);
    const votes: Array<ProfileHouseguest[]> = nominees.map((_) => []);
    let lastVoter: Houseguest;
    let outOf = 0;
    const nonVoters = new Set<number>(nominees.map((hg) => hg.id));
    hohArray.forEach((h) => nonVoters.add(h.id));
    nonEvictedHouseguests(newGameState).forEach((hg) => {
        if (!nonVoters.has(hg.id)) {
            const logic = castVote(hg, nominees, newGameState);
            const result: ProfileHouseguest = { ...hg };
            result.tooltip = logic.reason;
            newGameState.currentLog.votes[hg.id] =
                options.votingTo === "Evict"
                    ? new NormalVote(nominees[logic.decision].id)
                    : new SaveVote(nominees[logic.decision].id);
            votes[logic.decision].push(result);
            lastVoter = hg;
            outOf++;
        }
    });
    const voteCounts: number[] = votes.map((vote) => vote.length);
    const pluralities = getHighestIndicies(voteCounts);
    newGameState.currentLog.outOf = outOf;
    if (outOf === 1) {
        newGameState.currentLog.soleVoter = lastVoter!!.name;
    }
    let tieVote = pluralities.length > 1;
    let tieBreaker = { decision: -1, reason: "" };
    const tieBreakerHg = options.tieBreaker ? options.tieBreaker.hg : hohArray[0];
    if (tieVote) {
        newGameState.currentLog.outOf++;
        tieBreaker = castVote(
            tieBreakerHg!,
            pluralities.map((p) => nominees[p]),
            newGameState
        );
        const tiebreakerDecision = nominees[pluralities[tieBreaker.decision]].id;
        newGameState.currentLog.votes[tieBreakerHg!.id] = options.tieBreaker
            ? options.tieBreaker.voteType(tiebreakerDecision)
            : new HoHVote(tiebreakerDecision);
    }
    let evictees: Houseguest[] = [];

    if (options.votingTo === "Evict") {
        // voting to evict
        if (tieBreaker.decision > -1) {
            // there was a tie
            evictees.push(nominees[pluralities[tieBreaker.decision]]);
            newGameState.currentLog.votesInMajority = voteCounts[pluralities[tieBreaker.decision]] + 1;
        } else {
            // there wasn't a tie
            evictees.push(nominees[pluralities[0]]);
            newGameState.currentLog.votesInMajority = voteCounts[pluralities[0]];
        }
    } else {
        // voting to save
        if (tieBreaker.decision > -1) {
            // there was a tie
            const safe = nominees[pluralities[tieBreaker.decision]];
            newGameState.currentLog.votesInMajority = voteCounts[pluralities[tieBreaker.decision]] + 1;
            nominees.forEach((nom) => {
                if (nom.id !== safe.id) {
                    evictees.push(nom);
                }
            });
        } else {
            // there wasn't a tie
            const safe = nominees[pluralities[0]];
            newGameState.currentLog.votesInMajority = voteCounts[pluralities[0]];
            nominees.forEach((nom) => {
                if (nom.id !== safe.id) {
                    evictees.push(nom);
                }
            });
        }
    }
    const evicteesSet = new Set<number>(evictees.map((hg) => hg.id));
    nominees.forEach((hg) => {
        newGameState.currentLog.votes[hg.id] = new NomineeVote(evicteesSet.has(hg.id));
    });

    const votesPerEvictee: any = {};
    nominees.forEach((hg, i) => {
        if (!evicteesSet.has(hg.id)) return;
        votesPerEvictee[hg.id] = voteCounts[i] + (tieBreaker.decision === i ? 1 : 0);
    });

    if (options.votingTo === "Evict") evictees.sort((a, b) => votesPerEvictee[b.id] - votesPerEvictee[a.id]);
    else evictees.sort((a, b) => votesPerEvictee[a.id] - votesPerEvictee[b.id]);

    evictees.forEach((evictee) => {
        newGameState = evictHouseguest(newGameState, evictee.id);
    });
    const isUnanimous = voteCounts.filter((n) => n !== 0).length === 1;
    const voteCountText = isUnanimous
        ? "By a unanimous vote..."
        : `By a vote of ${listVotes(voteCounts.map((v) => `${v}`))}...`;

    const compWinner = options.tieBreaker ? options.tieBreaker.text : "current Head of Household";
    const soleVoteText = `${
        tieBreakerHg!.name
    }, as ${compWinner}, you must cast the sole vote to ${options.votingTo.toLowerCase()}.`;

    const displayHoH: ProfileHouseguest = { ...tieBreakerHg! };
    displayHoH.tooltip = tieBreaker.reason;
    const margin = doubleEviction ? { marginTop: 200 } : {};
    const scene = new Scene({
        title: "Live Eviction",
        gameState: initialGameState,
        content: (
            <div style={margin}>
                <CenteredBold>{voteCountText}</CenteredBold>
                <div className="columns is-centered">
                    {votes.map((voters, i) => (
                        <DividerBox className="column" key={`voters${i}`}>
                            <Portraits houseguests={voters} centered={true} />
                        </DividerBox>
                    ))}
                </div>
                {tieVote && (
                    <div>
                        <CenteredBold> We have a tie.</CenteredBold>
                        <Centered>{soleVoteText}</Centered>
                        <Portraits houseguests={[displayHoH]} centered={true} />
                        <CenteredBold>
                            I vote to {options.votingTo.toLowerCase()}
                            {` ${nominees[pluralities[tieBreaker.decision]].name}.`}
                        </CenteredBold>
                    </div>
                )}
                <Portraits
                    houseguests={nominees.map((_hg) => {
                        const hg: ProfileHouseguest = { ...getById(initialGameState, _hg.id) };
                        if (evicteesSet.has(_hg.id)) hg.isEvicted = true;
                        return hg;
                    })}
                    centered={true}
                />
                {options.votingTo === "Save" && (
                    <CenteredBold>{`${listNames(
                        nominees.filter((nom) => !evicteesSet.has(nom.id)).map((hg) => hg.name)
                    )}... you are safe.`}</CenteredBold>
                )}
                <CenteredBold>{`${options.votingTo === "Save" ? "That means " : ""}${listNames(
                    evictees.map((hg) => hg.name)
                )}... you have been evicted from the Big Brother House.`}</CenteredBold>
                <NextEpisodeButton />
            </div>
        ),
    });
    return [newGameState, scene];
}
