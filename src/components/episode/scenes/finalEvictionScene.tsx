import { GameState, Houseguest, MutableGameState, nonEvictedHouseguests } from "../../../model";
import { Scene } from "../scene";
import { castEvictionVote } from "../../../utils/ai/aiApi";
import { ProfileHouseguest } from "../../memoryWall";
import { evictHouseguest } from "../bigBrotherEpisode";
import { Portrait, Portraits } from "../../playerPortrait/portraits";
import { NextEpisodeButton } from "../../nextEpisodeButton/nextEpisodeButton";
import React from "react";

export function finalEvictionScene(initialGameState: GameState, HoH: Houseguest): [GameState, Scene] {
    const newGameState = new MutableGameState(initialGameState);
    const nominees = nonEvictedHouseguests(newGameState).filter(hg => hg.id !== HoH.id);
    const { vote, reason } = castEvictionVote(HoH, nominees, newGameState);
    const evictee = nominees[vote];
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
                    <b>
                        <p>{`I vote to evict ${evictee.name}.`}</p>
                    </b>
                    <Portraits houseguests={nominees} centered={true} />
                    <p>
                        It's official... {evictee.name}, you will be the final person leaving the Big Brother
                        House.
                    </p>
                </div>
                <NextEpisodeButton />
            </div>
        )
    });
    return [new GameState(newGameState), scene];
}
