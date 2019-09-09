import React from "react";
import { popularityMode, powerMode } from "../../model/portraitDisplayMode";
import { ViewBarTag } from "./viewBarTag";

export class ViewsBar extends React.Component {
    public render() {
        return (
            <div className="level box is-mobile" key="viewsbar">
                <ViewBarTag mode={popularityMode} text={"Relationships"}></ViewBarTag>
                <ViewBarTag mode={powerMode} text={"Power Rankings"}></ViewBarTag>
                <ViewBarTag mode={powerMode} disabled={true} text={"Cliques [Coming Soon]"}></ViewBarTag>
            </div>
        );
    }
}
