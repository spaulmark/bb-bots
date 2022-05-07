import React from "react";
import { CastingScreen } from "../castingScreen/castingScreen";
import { mainContentStream$, getCast } from "../../subjects/subjects";
import styled from "styled-components";
import { ColorTheme } from "../../theme/theme";
import { Box } from "../layout/box";
import { DeckScreen } from "../deckScreen/deckScreen";
import { SeasonEditorPage } from "../seasonEditor/seasonEditorPage";

export const TopbarLink = styled.a`
    color: ${({ theme }: { theme: ColorTheme }) => theme.link};
    cursor: pointer;
`;

export function AdvancedEditLink(): JSX.Element {
    return (
        <TopbarLink
            onClick={() => {
                mainContentStream$.next(<CastingScreen cast={JSON.parse(JSON.stringify(getCast()))} />);
            }}
        >
            Edit / Upload Cast
        </TopbarLink>
    );
}

export function EditSeasonLink(): JSX.Element {
    return (
        <TopbarLink
            onClick={() => {
                mainContentStream$.next(<SeasonEditorPage />);
            }}
        >
            Edit Season/Twists
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
    const style = { ...(props.style || {}) };
    return (
        <Box className="level is-mobile" style={style}>
            <div className="level-item">
                <ChooseCastLink />
            </div>
            <div className="level-item">
                <AdvancedEditLink />
            </div>
            <div className="level-item">
                <EditSeasonLink />
            </div>
            {/* <div className="level-item">
                <ThemeSwitcher />  eventually this can be used for custom themes
            </div> */}
        </Box>
    );
}
