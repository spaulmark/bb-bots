import React from "react";
import { isFullscreen$ } from "../../subjects/subjects";

export function FullscreenButton(): JSX.Element {
    return (
        <div
            className="button is-primary"
            onClick={() => {
                isFullscreen$.next(!isFullscreen$.getValue());
            }}
        >
            Fullscreen
        </div>
    );
}
