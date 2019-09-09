import { ProfileHouseguest, HouseguestPortrait } from "../memoryWall";
import React from "react";

export function houseguestToPortrait(houseguest: ProfileHouseguest, key?: any): JSX.Element {
    return <HouseguestPortrait {...houseguest} key={key} detailed={false} />;
}

export function memoryWallPortrait(houseguest: ProfileHouseguest, key?: any): JSX.Element {
    return <HouseguestPortrait {...houseguest} key={key} detailed={true} />;
}
