import React from "react";
import { PlayerProfile } from "../../model";
import { MemoryWall } from "../memoryWall";
import { NextEpisodeButton } from "../nextEpisodeButton/nextEpisodeButton";
import { ChooseCastLink } from "../topbar/topBar";
import { HasText } from "../layout/text";
import { popularityMode } from "../../model/portraitDisplayMode";
import { displayMode$ } from "../../subjects/subjects";
import { HelpLink } from "../episode/allianceList";

interface PregameScreenProps {
    cast: PlayerProfile[];
}

export class PregameScreen extends React.Component<PregameScreenProps, {}> {
    public componentDidMount() {
        displayMode$.next(popularityMode);
    }

    public render() {
        const props = this.props;
        if (props.cast.length === 0) {
            return (
                <HasText>
                    Cast is empty. <ChooseCastLink />
                </HasText>
            );
        }
        return (
            <HasText>
                <MemoryWall houseguests={props.cast} />
                <p>
                    <b> {"You can use the <- and -> arrow keys to move forwards and backwards."}</b>
                </p>
                <NextEpisodeButton />
            </HasText>
        );
    }
}
