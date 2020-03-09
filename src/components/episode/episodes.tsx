import React from "react";
import { GameState } from "../../model/gameState";
import { Scene } from "./scene";
import { ViewsBar } from "../viewsBar/viewBar";

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
    readonly arrowsEnabled: boolean = true;
    get render(): JSX.Element {
        const viewsBar = this.type.hasViewsbar ? <ViewsBar /> : null;
        return (
            <div>
                {viewsBar}
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
    readonly arrowsEnabled: boolean;
    readonly hasViewsbar: boolean;
}
