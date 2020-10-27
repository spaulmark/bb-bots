import React from "react";
import { PlayerProfile } from "../../model";
import { Portraits } from "../playerPortrait/portraits";
import { RelationshipMap } from "../../utils";
export interface IMemoryWallProps {
    readonly houseguests: ProfileHouseguest[];
}

export interface ProfileHouseguest extends PlayerProfile {
    id?: number;
    relationships?: RelationshipMap;
    isEvicted?: boolean;
    isJury?: boolean;
    popularity?: number;
    deltaPopularity?: number;
    hohWins?: number;
    povWins?: number;
    nominations?: number;
    tooltip?: string;
    friends?: number;
    enemies?: number;
    targetingMe?: number;
}

export function MemoryWall(props: IMemoryWallProps): JSX.Element {
    if (!props.houseguests || props.houseguests.length === 0) {
        return <div />;
    }
    return (
        // TODO: modulo magic. i dare you.
        <div
            style={{
                margin: "auto",
                maxWidth: props.houseguests.length < 26 ? 800 : -1,
            }}
        >
            <Portraits houseguests={props.houseguests} centered={true} detailed={true} />
        </div>
    );
}
