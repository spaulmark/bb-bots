import React from "react";
import { ProfileHouseguest } from "../memoryWall";
import { houseguestToPortrait, memoryWallPortrait } from "./houseguestToPortrait";
import { Tooltip } from "../tooltip/tooltip";

let key = -1;

function PortraitWrapper(props: { centered?: boolean; children: any }): JSX.Element {
    return (
        <div
            key={key++}
            className={`columns is-gapless is-mobile is-multiline ${props.centered ? "is-centered" : ""}`}
        >
            {props.children}
        </div>
    );
}

export function Portrait(props: { houseguest: ProfileHouseguest; centered?: boolean }): JSX.Element {
    const result = (
        <PortraitWrapper centered={props.centered}>{houseguestToPortrait(props.houseguest)}</PortraitWrapper>
    );
    if (props.houseguest.tooltip) {
        return (
            <PortraitWrapper centered={props.centered}>
                <Tooltip text={props.houseguest.tooltip}>{houseguestToPortrait(props.houseguest)}</Tooltip>
            </PortraitWrapper>
        );
    }
    return result;
}

export function Portraits(props: {
    houseguests: ProfileHouseguest[];
    centered?: boolean;
    detailed?: boolean;
}): JSX.Element {
    const rows: JSX.Element[] = [];
    if (!props.houseguests || props.houseguests.length === 0) {
        return <div />;
    }
    props.houseguests.forEach((houseguest: ProfileHouseguest) => {
        let result;
        if (props.detailed) {
            result = memoryWallPortrait(houseguest, key++);
        } else {
            result = houseguestToPortrait(houseguest, key++);
        }
        if (houseguest.tooltip) {
            result = (
                <Tooltip key={key++} text={houseguest.tooltip}>
                    {result}
                </Tooltip>
            );
        }
        rows.push(result);
    });
    return (
        <div className={`columns is-gapless is-mobile is-multiline ${props.centered && "is-centered"}`}>
            {rows}
        </div>
    );
}
