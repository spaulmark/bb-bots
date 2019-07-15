import React from "react";
import { CastingScreen } from "../castingScreen/castingScreen";
import "./topBar.scss";
import { getCast } from "../mainPage/mainPageController";
import { pushToMainContentStream } from "../../subjects/subjects";

export function EditCastLink(): JSX.Element {
    return (
        <div
            className="topbar-link"
            onClick={() => {
                pushToMainContentStream(<CastingScreen cast={getCast()} />);
            }}
        >
            Edit Cast
        </div>
    );
}

export function EditSeasonLink(): JSX.Element {
    return (
        <div
            className="topbar-link"
            onClick={() => {
                pushToMainContentStream(<CastingScreen cast={getCast()} />); // TODO: Proper edit season linking
            }}
        >
            Edit Season
        </div>
    );
}

export function Topbar(): JSX.Element {
    return (
        <div className="level box is-mobile" style={{ marginTop: 30 }}>
            <div className="level-item">
                <EditCastLink />
            </div>
            <div className="level-item">
                <EditSeasonLink />
            </div>
        </div>
    );
}
