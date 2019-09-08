import React from "react";
import { PortraitDisplayMode, popularityMode, powerMode } from "../../model/portraitDisplayMode";
import { displayMode$ } from "../../subjects/subjects";

function setDisplayMode(p: PortraitDisplayMode) {
    displayMode$.next(p);
}

export class ViewsBar extends React.Component {
    render() {
        return (
            <div className="level box is-mobile" key="viewsbar">
                <span className="level-item tag" onClick={() => setDisplayMode(popularityMode)}>
                    Popularity View
                </span>
                <span className="level-item tag" onClick={() => setDisplayMode(powerMode)}>
                    Power Rankings
                </span>
                <span className="level-item tag">Cliques</span>
            </div>
        );
    }
}
