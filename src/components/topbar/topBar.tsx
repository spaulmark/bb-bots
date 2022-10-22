import React from "react";
import { CastingScreen } from "../castingScreen/castingScreen";
import { getCast, pushToMainContentStream } from "../../subjects/subjects";
import styled from "styled-components";
import { ColorTheme } from "../../theme/theme";
import { Box } from "../layout/box";
import { DeckScreen } from "../deckScreen/deckScreen";
import { SeasonEditorPage } from "../seasonEditor/seasonEditorPage";
import { BehaviorSubject, Subscription } from "rxjs";

export enum Screens {
    Deck = 1,
    Casting = 2,
    Season = 3,
    Ingame = 4,
    EditRelationships = 5,
}

// for topbar minty colors
export const activeScreen$ = new BehaviorSubject<Screens>(Screens.Ingame);

export const TopbarLink = styled.a`
    color: ${({ theme }: { theme: ColorTheme }) => theme.link};
    cursor: pointer;
`;

export const ActiveTopbarLink = styled.mark`
    cursor: pointer;
    font-weight: bold;
`;

export function CastingScreenLink(): JSX.Element {
    const LinkStyle = activeScreen$.value === Screens.Casting ? ActiveTopbarLink : TopbarLink;
    return (
        <LinkStyle
            onClick={() => {
                pushToMainContentStream(
                    <CastingScreen cast={JSON.parse(JSON.stringify(getCast()))} />,
                    Screens.Casting
                );
            }}
        >
            Edit / Upload Cast
        </LinkStyle>
    );
}

export function EditSeasonLink(): JSX.Element {
    const LinkStyle = activeScreen$.value === Screens.Season ? ActiveTopbarLink : TopbarLink;
    return (
        <LinkStyle
            onClick={() => {
                pushToMainContentStream(<SeasonEditorPage />, Screens.Season);
            }}
        >
            Edit Season/Twists
        </LinkStyle>
    );
}

export function ChooseCastLink(): JSX.Element {
    const LinkStyle = activeScreen$.value === Screens.Deck ? ActiveTopbarLink : TopbarLink;
    return (
        <LinkStyle
            onClick={() => {
                pushToMainContentStream(<DeckScreen />, Screens.Deck);
            }}
        >
            Choose Cast
        </LinkStyle>
    );
}

export class Topbar extends React.Component<{ style?: any }, { tab: Screens }> {
    private subs: Subscription[] = [];
    constructor(props: Readonly<{ style?: any }>) {
        super(props);
        this.state = { tab: Screens.Ingame };
    }
    componentDidMount() {
        this.subs.push(activeScreen$.subscribe((tab) => this.setState({ tab })));
    }
    componentWillUnmount() {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    public render(): JSX.Element {
        const style = { ...(this.props.style || {}) };
        return (
            <Box className="level is-mobile" style={style}>
                <div className="level-item">
                    <ChooseCastLink />
                </div>
                <div className="level-item">
                    <CastingScreenLink />
                </div>
                <div className="level-item">
                    <EditSeasonLink />
                </div>
            </Box>
        );
    }
}
