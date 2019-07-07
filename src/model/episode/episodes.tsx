import React from "react";
import { GameState } from "../gameState";

export interface Episode {
    readonly scenes: Scene[];
    readonly title: string;
    readonly render: JSX.Element;
    readonly gameState: GameState;
    readonly type: EpisodeType;
}

export interface EpisodeType {
    readonly canPlayWith: (n: number) => boolean;
    readonly eliminates: number;
}

export class Scene {
    readonly title: string = "";
    readonly gameState: GameState = new GameState([]);
    readonly render: JSX.Element = <div>{`Error while rendering ${this.title}`}</div>;
    public constructor(init: Partial<Scene>) {
        Object.assign(this, init);
    }
}
