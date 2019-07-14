import React from "react";
import { EpisodeType, Episode, Scene } from "./episodes";
import { GameState } from "../../model";
import { MemoryWall } from "../memoryWall";
import { NextEpisodeButton } from "../buttons/nextEpisodeButton";
import { Houseguest } from "../../model/houseguest";
import {
    nonEvictedHouseguests,
    MutableGameState,
    randomPlayer,
    getById,
    getJurors
} from "../../model/gameState";
import { Portraits, Portrait } from "../playerPortrait/portraits";
import { evictHouseguest } from "./bigBrotherEpisode";
import { castEvictionVote, castJuryVote } from "../../utils/ai/aiApi";

export const BigBrotherFinale: EpisodeType = {
    canPlayWith: (n: number) => n === 3,
    eliminates: 2
};

function finalHohCompScene(initialGameState: GameState): [GameState, Scene, Houseguest] {
    const newGameState = new MutableGameState(initialGameState);
    const final3 = nonEvictedHouseguests(initialGameState);
    const enduranceWinner = randomPlayer(final3);
    const enduranceLosers = final3.filter(hg => hg.id !== enduranceWinner.id);
    const skillWinner = randomPlayer(final3, [enduranceWinner]);
    const finalHoH = getById(newGameState, randomPlayer([enduranceWinner, skillWinner]).id);
    finalHoH.hohWins++;
    const scene: Scene = {
        title: "Final HoH Competition",
        gameState: newGameState,
        render: (
            <div>
                <p>The final 3 houseguests compete in the endurance competition.</p>
                <Portraits houseguests={final3} />
                <Portrait houseguest={enduranceWinner} />
                <p>
                    <b>{`${enduranceWinner.name} has won the endurance competition!`}</b>
                </p>
                <hr />
                <p>{`${enduranceLosers[0].name} and ${
                    enduranceLosers[1].name
                } compete in the skill competition.`}</p>
                <Portraits houseguests={enduranceLosers} />
                <Portrait houseguest={skillWinner} />
                <p>
                    <b>{`${skillWinner.name} has won the skill competition!`}</b>
                </p>
                <hr />
                <p>{`${enduranceWinner.name} and ${skillWinner.name} compete in the quiz competition.`}</p>
                <Portraits houseguests={[enduranceWinner, skillWinner]} />
                <Portrait houseguest={finalHoH} />
                <p>
                    <b>{`Congratulations ${finalHoH.name}, you are the final Head of Household!`}</b>
                </p>
                <NextEpisodeButton />
            </div>
        )
    };
    newGameState.phase++;
    return [new GameState(newGameState), scene, finalHoH];
}

function finalEvictionScene(initialGameState: GameState, HoH: Houseguest): [GameState, Scene] {
    const newGameState = new MutableGameState(initialGameState);
    const nominees = nonEvictedHouseguests(newGameState).filter(hg => hg.id !== HoH.id);
    const vote = castEvictionVote(HoH, nominees, newGameState);
    const evictee = nominees[vote];
    evictHouseguest(newGameState, evictee.id);
    const scene: Scene = {
        title: "Final Eviction",
        gameState: newGameState,
        render: (
            <div>
                <div style={{ textAlign: "center" }}>
                    {`As the final HoH of the season, ${HoH.name}, you may now cast the sole vote to evict.`}
                    <Portrait houseguest={HoH} centered={true} />
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
    };
    return [new GameState(newGameState), scene];
}

function juryVoteScene(initialGameState: GameState): Scene {
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

    const scene: Scene = {
        title: "Jury Votes",
        gameState: initialGameState,
        render: (
            <div>
                {voteBlocks}
                <Portrait houseguest={winner} />
                {`Congratulations, ${winner.name}, you are the winner of Big Brother!!!`}
            </div>
        )
    };
    return scene;
}

export class BigBrotherFinaleEpisode implements Episode {
    readonly title: string;
    readonly scenes: Scene[] = [];
    readonly render: JSX.Element;
    readonly gameState: GameState;
    readonly type = BigBrotherFinale;

    public constructor(initialGameState: GameState) {
        this.title = "Finale";
        this.render = (
            <div>
                {/* TODO: custom title here*/}
                Finale Night
                <MemoryWall houseguests={initialGameState.houseguests} /> <br />
                <NextEpisodeButton />
            </div>
        );
        let currentGameState;
        let hohCompScene;
        let finalHoH;
        [currentGameState, hohCompScene, finalHoH] = finalHohCompScene(initialGameState);
        this.scenes.push(hohCompScene);
        let finalEviction;
        [currentGameState, finalEviction] = finalEvictionScene(currentGameState, finalHoH);
        this.scenes.push(finalEviction);

        let voteScene;
        voteScene = juryVoteScene(currentGameState);
        this.scenes.push(voteScene);

        this.gameState = currentGameState;
    }
}
