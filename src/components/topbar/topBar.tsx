import React from "react";
import { CastingScreen } from "../castingScreen/castingScreen";
import { mainContentStream$, getCast } from "../../subjects/subjects";
import styled from "styled-components";
import { ThemeSwitcher } from "./themeSwitch";
import { ColorTheme } from "../../theme/theme";
import { Box } from "../layout/box";

const TopbarLink = styled.div`
    color: ${({ theme }: { theme: ColorTheme }) => theme.link};
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
    const style = { ...{ marginTop: 30 }, ...(props.style || {}) };
    return (
        <Box className="level is-mobile" style={style}>
            <div className="level-item">
                <EditCastLink />
            </div>
            <div className="level-item">
                <EditSeasonLink />
            </div>
            <div className="level-item">
                <ThemeSwitcher />
            </div>
        </Box>
    );
}
