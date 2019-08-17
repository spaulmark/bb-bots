import React from "react";
import { GameState } from "../../model/gameState";
import { Scene } from "./scene";

export interface InitEpisode {
    scenes: Scene[];
    title: string;
    content: JSX.Element;
    gameState: GameState;
    type: EpisodeType;
}

export class Episode {
    readonly scenes: Scene[];
    readonly title: string;
    readonly content: JSX.Element;
    readonly gameState: GameState;
    readonly type: EpisodeType;
    get render(): JSX.Element {
        return (
            <div>
                <div key="viewsbar">Hey Dude</div>
                {this.content}
            </div>
        );
    }

    constructor(init: InitEpisode) {
        this.scenes = init.scenes;
        this.title = init.title;
        this.content = init.content;
        this.gameState = init.gameState;
        this.type = init.type;
    }
}

export interface EpisodeType {
    readonly canPlayWith: (n: number) => boolean;
    readonly eliminates: number;
}
