import { GameState, Houseguest, MutableGameState, nonEvictedHouseguests } from "../../../model";
import { Scene } from "../scene";
import { castEvictionVote } from "../../../utils/ai/aiApi";
import { ProfileHouseguest } from "../../memoryWall";
import { evictHouseguest } from "../bigBrotherEpisode";
import { Portrait, Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";
import { CenteredBold, Centered } from "../../layout/centered";
import { HoHVote, NomineeVote } from "../../../model/logging/voteType";

export function finalEvictionScene(initialGameState: GameState, HoH: Houseguest): [GameState, Scene] {
    const newGameState = new MutableGameState(initialGameState);
    const nominees = nonEvictedHouseguests(newGameState).filter(hg => hg.id !== HoH.id);
    newGameState.currentLog.nominationsPostVeto = nominees.map(hg => hg.name);
    const { decision: vote, reason } = castEvictionVote(HoH, nominees, newGameState);
    const evictee = nominees[vote];
    const survivor = nominees[vote == 1 ? 0 : 1];
    newGameState.currentLog.votes[survivor.id] = new NomineeVote(false);
    newGameState.currentLog.votes[HoH.id] = new HoHVote(evictee.id);
    newGameState.currentLog.votesInMajority = 1;
    const hoh: ProfileHouseguest = { ...HoH };
    hoh.tooltip = reason;
    evictHouseguest(newGameState, evictee.id);
    const scene: Scene = new Scene({
        title: "Final Eviction",
        gameState: newGameState,
        content: (
            <div>
                <div style={{ textAlign: "center" }}>
                    {`As the final HoH of the season, ${HoH.name}, you may now cast the sole vote to evict.`}
                    <Portrait houseguest={hoh} centered={true} />
                    <CenteredBold>{`I vote to evict ${evictee.name}.`}</CenteredBold>
                    <Portraits houseguests={nominees} centered={true} />
                    <Centered>
                        It's official... {evictee.name}, you will be the final person leaving the Big Brother
                        House.
                    </Centered>
                </div>
                <NextEpisodeButton />
            </div>
        )
    });
    return [new GameState(newGameState), scene];
}
