import React from "react";
import { CastingScreen } from "../castingScreen/castingScreen";
import { mainContentStream$, getCast } from "../../subjects/subjects";
import styled from "styled-components";

const TopbarLink = styled.div`
    color: blue;
    cursor: pointer;
`;

export function EditCastLink(): JSX.Element {
    return (
        <TopbarLink
            onClick={() => {
                mainContentStream$.next(<CastingScreen cast={getCast()} />);
            }}
        >
            Edit Cast
        </TopbarLink>
    );
}

export function EditSeasonLink(): JSX.Element {
    return (
        <TopbarLink
            onClick={() => {
                mainContentStream$.next(<CastingScreen cast={getCast()} />);
            }}
        >
            Edit Season
        </TopbarLink>
    );
}

export function Topbar(props: { style?: any }): JSX.Element {
    const style = { ...props.style, ...{ marginTop: 30 } };
    return (
        <div className="level box is-mobile" style={style}>
            <div className="level-item">
                <EditCastLink />
            </div>
            <div className="level-item">
                <EditSeasonLink />
            </div>
        </div>
    );
}
