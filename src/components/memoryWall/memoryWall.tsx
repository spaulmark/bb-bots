import React from "react";
import { PlayerProfile } from "../../model";
import { Portraits } from "../playerPortrait/portraits";
import { RelationshipMap } from "../../utils";
import { Tribe } from "../../model/tribe";
export interface MemoryWallProps {
    readonly splits: { splitName?: string; houseguests: ProfileHouseguest[] }[];
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
    tribe?: Tribe;
    editable?: boolean;
    ignoreSelected?: boolean;
}
export function MemoryWall(props: MemoryWallProps): JSX.Element {
    const result: JSX.Element[] = [];
    let key = 0;
    for (const split of props.splits) {
        const houseguests = split.houseguests;
        if (!houseguests || houseguests.length === 0) {
            result.push(<div key={key++} />);
        }
        result.push(
            <div
                key={key++}
                style={{
                    margin: "auto",
                    maxWidth: houseguests.length < 26 ? 800 : -1,
                }}
            >
                <Portraits houseguests={houseguests} centered={true} detailed={true} />
            </div>
        );
    }
    return <div>{result}</div>;
}
