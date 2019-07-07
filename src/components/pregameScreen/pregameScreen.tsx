import React from "react";
import { PlayerProfile } from "../../model";
import { MemoryWall } from "../memoryWall";
import { NextEpisodeButton } from "../buttons/nextEpisodeButton";
import { EditCastLink } from "../topbar/topBar";

interface PregameScreenProps {
    cast: PlayerProfile[];
}

export function PregameScreen(props: PregameScreenProps): JSX.Element {
    if (props.cast.length === 0) {
        return (
            <div>
                Cast is empty. <EditCastLink />
            </div>
        );
    }
    return (
        <div>
            Welcome to Big Brother!
            <MemoryWall houseguests={props.cast} />
            <NextEpisodeButton />
        </div>
    );
    // TODO: Custom season title.
}
