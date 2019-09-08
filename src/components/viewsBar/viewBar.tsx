import React from "react";
import { popularityMode, powerMode } from "../../model/portraitDisplayMode";
import { ViewBarTag } from "./viewBarTag";

export class ViewsBar extends React.Component {
    // TODO: some indicator that they are selected.
    public render() {
        return (
            <div className="level box is-mobile" key="viewsbar">
                <ViewBarTag mode={popularityMode} text={"Popularity / Relationships"}></ViewBarTag>
                <ViewBarTag mode={powerMode} text={"Power Rankings"}></ViewBarTag>
                <ViewBarTag mode={popularityMode} disabled={true} text={"Cliques [Coming Soon]"}></ViewBarTag>
            </div>
        );
    }
}
