import React from "react";
import { GameState } from "../../model/gameState";
import { Scene } from "./scenes/scene";
import { ViewsBar } from "../viewsBar/viewBar";
import { defaultContent } from "./bigBrotherEpisode";
import { getEmoji } from "../seasonEditor/twistAdder";

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
    readonly gameState: GameState;
    readonly initialGameState: GameState;
    readonly type: EpisodeType;
    get render(): JSX.Element {
        const viewsBar = this.type.hasViewsbar ? <ViewsBar gameState={this.scenes[0].gameState} /> : null;
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

export interface EpisodeType {
    readonly canPlayWith: (n: number) => boolean;
    readonly eliminates: number;
    readonly arrowsEnabled: boolean;
    readonly hasViewsbar: boolean;
    readonly name: string;
    readonly emoji: string;
    readonly description: string;
    readonly generate: (gameState: GameState) => Episode;
}
