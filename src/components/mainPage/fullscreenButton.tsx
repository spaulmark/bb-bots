import React from "react";
import { isFullscreen$ } from "../../subjects/subjects";
import styled from "styled-components";

const FullscreenIcon = styled.img`
    position: -webkit-sticky;
    position: sticky;
    top: 20px;
    right: 20px;
`;

export function FullscreenButton(): JSX.Element {
    return (
        <FullscreenIcon
            src={
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAASElEQVRIiWNgGAUEACMa/z+R6ohWz0Sqi0gFLIRcQAAQDAGa+2DoWzAKRgH1wX8G3OULWfqHfkYbsNIUPR5IrQ/gYLQsGngAAEPgCRZjAdYSAAAAAElFTkSuQmCC"
            }
            className="button is-rounded"
            onClick={() => {
                isFullscreen$.next(!isFullscreen$.getValue());
            }}
        />
    );
}
