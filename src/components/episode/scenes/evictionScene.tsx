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
import { NomineeVote, NormalVote, HoHVote } from "../../../model/logging/voteType";
import { evictHouseguest } from "../utilities/evictHouseguest";
import { listNames, listVotes } from "../../../utils/listStrings";

// a function that takes in an array of numbers and returns the indicies of all the numbers tied for the highest number
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

interface EvictionSceneOptions {
    votingTo: "Save" | "Evict";
    doubleEviction: boolean;
}

export function generateEvictionScene(
    initialGameState: GameState,
    HoH: Houseguest,
    nominees: Houseguest[],
    options: EvictionSceneOptions
): [GameState, Scene] {
    const doubleEviction = options.doubleEviction;
    const castVote: (hero: Houseguest, noms: Houseguest[], gameState: GameState) => NumberWithLogic =
        options.votingTo === "Save" ? castVoteToSave : castEvictionVote;
    let newGameState = new MutableGameState(initialGameState);
    newGameState.currentLog.votingTo = options.votingTo;
    nominees = shuffle(nominees);
    const votes: Array<ProfileHouseguest[]> = nominees.map((_) => []);
    let lastVoter: Houseguest;
    let outOf = 0;
    const nonVoters = new Set<number>(nominees.map((hg) => hg.id));
    nonVoters.add(HoH.id);
    nonEvictedHouseguests(newGameState).forEach((hg) => {
        if (!nonVoters.has(hg.id)) {
            const logic = castVote(hg, nominees, newGameState);
            const result: ProfileHouseguest = { ...hg };
            result.tooltip = logic.reason;
            newGameState.currentLog.votes[hg.id] = new NormalVote(nominees[logic.decision].id);
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
    let tieBreaker = { decision: -1, reason: "Error you should not be seeing this" };
    if (tieVote) {
        newGameState.currentLog.outOf++;
        // TODO: this is returning a vote to EVICT when they're saving
        tieBreaker = castVote(
            HoH,
            pluralities.map((p) => nominees[p]),
            newGameState
        );
        newGameState.currentLog.votes[HoH.id] = new HoHVote(nominees[tieBreaker.decision].id);
    }
    let evictees: Houseguest[] = [];

    if (options.votingTo === "Evict") {
        // voting to evict
        if (tieBreaker.decision > -1) {
            // there was a tie
            evictees.push(nominees[tieBreaker.decision]);
            newGameState.currentLog.votesInMajority = voteCounts[tieBreaker.decision] + 1;
        } else {
            // there wasn't a tie
            evictees.push(nominees[pluralities[0]]);
            newGameState.currentLog.votesInMajority = voteCounts[pluralities[0]];
        }
    } else {
        // voting to save
        if (tieBreaker.decision > -1) {
            // there was a tie
            const safe = nominees[tieBreaker.decision];
            newGameState.currentLog.votesInMajority = voteCounts[tieBreaker.decision] + 1;
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
    evictees.forEach((evictee) => {
        newGameState = evictHouseguest(newGameState, evictee.id);
    });
    const isUnanimous = voteCounts.filter((n) => n !== 0).length === 1;
    const voteCountText = isUnanimous
        ? "By a unanimous vote..."
        : `By a vote of ${listVotes(voteCounts.map((v) => `${v}`))}...`;

    const displayHoH: ProfileHouseguest = { ...HoH };
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
                        <Centered>{`${
                            HoH.name
                        }, as current Head of Household, you must cast the sole vote to ${options.votingTo.toLowerCase()}.`}</Centered>
                        <Portraits houseguests={[displayHoH]} centered={true} />
                        <CenteredBold>
                            I vote to {options.votingTo.toLowerCase()}
                            {` ${nominees[tieBreaker.decision].name}.`}
                        </CenteredBold>
                    </div>
                )}
                <Portraits houseguests={nominees.map((hg) => getById(newGameState, hg.id))} centered={true} />
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
