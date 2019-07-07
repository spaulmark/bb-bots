import { ProfileHouseguest, HouseguestPortrait } from "../memoryWall";
import React from "react";
import { generateSubtitle, generateDetailedSubtitle } from "./subtitle";

export function houseguestToPortrait(houseguest: ProfileHouseguest, key?: any): JSX.Element {
    return <HouseguestPortrait {...houseguest} key={key} generateSubtitle={generateSubtitle} />;
}

export function memoryWallPortrait(houseguest: ProfileHouseguest, key?: any): JSX.Element {
    return <HouseguestPortrait {...houseguest} key={key} generateSubtitle={generateDetailedSubtitle} />;
}
