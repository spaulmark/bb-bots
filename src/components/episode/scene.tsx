import React from "react";
import { GameState } from "../../model/gameState";
interface InitScene {
    readonly title: string;
    readonly gameState: GameState;
    readonly content: JSX.Element;
}
export class Scene {
    readonly title: string = "";
    readonly gameState: GameState = new GameState([]);
    readonly content: JSX.Element = <div>{`Error while rendering ${this.title}`}</div>;
    public render: JSX.Element;
    public constructor(init: Partial<InitScene>) {
        Object.assign(this, init);
        this.render = (
            <div>
                Hey dude
                {this.content}
            </div>
        );
    }
}
