import React from "react";
import { PlayerProfile } from "../../model";
import { MemoryWall } from "../memoryWall";
import { NextEpisodeButton } from "../nextEpisodeButton/nextEpisodeButton";
import { ChooseCastLink } from "../topbar/topBar";
import { HasText } from "../layout/text";
import { popularityMode } from "../../model/portraitDisplayMode";
import { displayMode$ } from "../../subjects/subjects";
import { selectedColor } from "../playerPortrait/houseguestPortraitController";

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
                <h2
                    style={{
                        color: selectedColor.toHex(),
                        textShadow: "rgb(114, 46, 123) 2px 2px 0px",
                        textAlign: "center",
                    }}
                >
                    Big Brother Bots
                </h2>
                <MemoryWall houseguests={props.cast} />
                <p>
                    <b> {"You can use the <- and -> arrow keys to move forwards and backwards."}</b>
                </p>
                <NextEpisodeButton />
            </HasText>
        );
    }
}
