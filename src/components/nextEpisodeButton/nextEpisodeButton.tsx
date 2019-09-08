import React from "react";
import { switchSceneRelative } from "../../subjects/subjects";

export function NextEpisodeButton(): JSX.Element {
    return (
        <button className="button is-primary" onClick={() => switchSceneRelative(1)}>
            Continue
        </button>
    );
}
