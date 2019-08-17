import { switchSceneRelative } from "../sidebar/sidebarController";
import React from "react";

export function NextEpisodeButton(): JSX.Element {
    return (
        <button className="button is-primary" onClick={() => switchSceneRelative(1)}>
            Continue
        </button>
    );
}
