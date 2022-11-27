import React from "react";
import { PlayerProfile } from "../../model";
import { Portraits } from "../playerPortrait/portraits";
import { RelationshipMap } from "../../utils";
import { Tribe } from "../../model/tribe";
import { TribeContainer } from "./tribeContainer";
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

    if (props.splits.length === 1) {
        const houseguests = props.splits[0].houseguests;
        if (houseguests.length === 0) return <div key={key++} />;
        return (
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

    // FIXME: split color doesn't exist yet //
    for (const split of props.splits) {
        const houseguests = split.houseguests;
        result.push(
            <div
                key={key++}
                style={{
                    margin: "auto",
                    maxWidth: houseguests.length < 26 ? 800 : -1,
                }}
            >
                <TribeContainer
                    hgs={houseguests}
                    key={key++}
                    tribe={{ name: split.splitName || "", color: "#fff" }}
                />
            </div>
        );
    }
    return (
        <div
            style={{
                margin: "auto",
                maxWidth: -1,
            }}
        >
            {/* // FIXME: this used to say is-multiline. it likely breaks for more than 2 splits */}
            <div className="columns is-centered">{result}</div>
        </div>
    );
}
