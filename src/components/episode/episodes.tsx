import React from "react";
import { GameState, getById, nonEvictedHouseguests } from "../../model/gameState";
import { Scene } from "./scenes/scene";
import { ViewsBar } from "../viewsBar/viewBar";
import { defaultContent } from "./bigBrotherEpisode";
import { getEmoji } from "../seasonEditor/twistAdder";
import { Houseguest } from "../../model";
import { isNotWellDefined } from "../../utils";

export interface InitEpisode {
    scenes: Scene[];
    title?: string;
    content?: JSX.Element;
    gameState: GameState;
    initialGamestate?: GameState;
    type: EpisodeType;
}

export class Episode {
    readonly scenes: Scene[];
    readonly title: string;
    readonly content: JSX.Element;
    readonly gameState: GameState; // State of the game after a phase.
    readonly initialGameState: GameState;
    readonly type: EpisodeType;
    get render(): JSX.Element {
        const viewsBar = this.type.hideViewsBar ? null : <ViewsBar gameState={this.scenes[0].gameState} />;
        return (
            <div>
                {viewsBar}
                {this.content}
            </div>
        );
    }

    constructor(init: InitEpisode) {
        this.scenes = init.scenes;
        this.title = init.title || `Week ${init.gameState.phase} ${getEmoji(init.type)}`;
        this.content = init.content || defaultContent(init.initialGamestate || init.gameState);
        this.gameState = init.gameState;
        this.initialGameState = init.initialGamestate || init.gameState;
        this.type = init.type;
    }
}

export interface Split {
    name: string;
    members: Set<number>;
}

export function nonEvictedHousguestsSplit(splitIndex: number | null | undefined, gameState: GameState) {
    return isNotWellDefined(splitIndex)
        ? nonEvictedHouseguests(gameState)
        : getNonEvictedHgsFromSplitIndex(splitIndex, gameState);
}

function getNonEvictedHgsFromSplitIndex(index: number, gameState: GameState): Houseguest[] {
    return getMembersFromSplitIndex(index, gameState).filter((hg) => !hg.isEvicted);
}

export function getMembersFromSplitIndex(index: number, gameState: GameState): Houseguest[] {
    return getSplitMembers(gameState.split[index], gameState);
}

export function getSplitMembers(split: { members: Set<number> }, gameState: GameState): Houseguest[] {
    return Array.from(split.members).map((id) => getById(gameState, id));
}

export function getNonevictedSplitMembers(
    split: { members: Set<number> },
    gameState: GameState
): Houseguest[] {
    return getSplitMembers(split, gameState).filter((hg) => !hg.isEvicted);
}

export interface EpisodeType {
    readonly canPlayWith: (n: number) => boolean;
    readonly eliminates: number;
    readonly arrowsDisabled?: boolean;
    readonly hideViewsBar?: boolean;
    readonly chainable?: boolean;
    readonly pseudo?: boolean;
    readonly name?: string;
    readonly emoji?: string;
    readonly description?: string;
    readonly teamsLookupId?: number;
    readonly splitFunction?: (gameState: GameState) => Split[];
    readonly generate: (gameState: GameState) => Episode;
}
