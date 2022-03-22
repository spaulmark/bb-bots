import React from "react";
import { popularityMode, powerMode } from "../../model/portraitDisplayMode";
import { ViewBarTag } from "./viewBarTag";
import { GameState, inJury } from "../../model";
import { displayMode$ } from "../../subjects/subjects";

export class ViewsBar extends React.Component<{ gameState: GameState }, {}> {
    public constructor(props: { gameState: GameState }) {
        super(props);
    }

    componentDidUpdate() {
        if (!inJury(this.props.gameState) && displayMode$.value === powerMode) {
            displayMode$.next(popularityMode);
        }
    }

    render() {
        return (
            <div className="level is-mobile" key="viewsbar" style={{ marginBottom: 0 }}>
                <ViewBarTag mode={popularityMode} text={"Relationships"}></ViewBarTag>
                {inJury(this.props.gameState) && (
                    <ViewBarTag mode={powerMode} text={"Endgame Winrate"}></ViewBarTag>
                )}
            </div>
        );
    }
}
