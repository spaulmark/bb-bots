import React from "react";
import { CastingScreen } from "../castingScreen/castingScreen";
import { mainContentStream$, getCast } from "../../subjects/subjects";
import styled from "styled-components";
import { ThemeSwitcher } from "./themeSwitch";
import { ColorTheme } from "../../theme/theme";
import { Box } from "../layout/box";
import { DeckScreen } from "../deckScreen/deckScreen";

const TopbarLink = styled.div`
    color: ${({ theme }: { theme: ColorTheme }) => theme.link};
    cursor: pointer;
`;

export function AdvancedEditLink(): JSX.Element {
    return (
        <TopbarLink
            onClick={() => {
                mainContentStream$.next(<CastingScreen cast={getCast()} />);
            }}
        >
            Advanced Edit
        </TopbarLink>
    );
}

export function ChooseCastLink(): JSX.Element {
    return (
        <TopbarLink
            onClick={() => {
                mainContentStream$.next(<DeckScreen />);
            }}
        >
            Choose Cast
        </TopbarLink>
    );
}

export function Topbar(props: { style?: any }): JSX.Element {
    const style = { ...{ marginTop: 30 }, ...(props.style || {}) };
    return (
        <Box className="level is-mobile" style={style}>
            <div className="level-item">
                <ChooseCastLink />
            </div>
            <div className="level-item">
                <AdvancedEditLink />
            </div>
            <div className="level-item">
                <ThemeSwitcher />
            </div>
        </Box>
    );
}
