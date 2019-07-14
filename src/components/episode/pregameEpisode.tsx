import React from "react";
import { Episode, EpisodeType } from "./episodes";
import { PregameScreen } from "../pregameScreen/pregameScreen";
import { GameState } from "../../model/gameState";

const PregameEpisodeType: EpisodeType = {
    eliminates: 0,
    canPlayWith: (n: number) => {
        return n > 2;
    }
};

export class PregameEpisode implements Episode {
    readonly title = "Pregame";
    readonly scenes = [];
    readonly render: JSX.Element;
    readonly gameState: GameState;
    readonly type = PregameEpisodeType;

    public constructor(gameState: GameState) {
        this.gameState = gameState;
        this.render = <PregameScreen cast={gameState.houseguests} />;
    }
}
