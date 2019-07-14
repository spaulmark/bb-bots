import React from "react";
import { roundTwoDigits } from "../../utils";
import { ProfileHouseguest, PortraitProps, PortraitState } from "../memoryWall";

function _generateSubtitle(houseguest: PortraitProps, state: PortraitState, detailed: boolean): any[] {
    let key = 0;
    let popularity = state.popularity;
    if (popularity && (popularity > 1 || popularity < -1)) {
        popularity = houseguest.popularity;
    }
    let subtitle: any[] = [];
    if (popularity && !houseguest.isEvicted) {
        let popularitySubtitle = `${roundTwoDigits(popularity)}%`;
        const deltaPop = getDeltaPopularity(houseguest, popularity);
        if (detailed && deltaPop !== 0) {
            const arrow = deltaPop > 0 ? " | ↑" : " | ↓";
            popularitySubtitle += `${arrow} ${deltaPop}%`;
        }
        subtitle.push(<div key={key++}>{popularitySubtitle}</div>);
    }
    if (compWins(houseguest)) {
        subtitle.push(<div key={key++}>{`${compWins(houseguest)}`}</div>);
    } else {
        subtitle.push(<br key={key++} style={{ lineHeight: 1 }} />);
    }
    if (!houseguest.isEvicted && state.titles.length !== 0) {
        subtitle = subtitle.concat(state.titles.map(txt => <div key={key++}>{txt}</div>));
    } else {
        subtitle.push(<br key={key++} style={{ lineHeight: 1 }} />);
    }
    return subtitle;
}

export function generateSubtitle(houseguest: PortraitProps, state: PortraitState): any[] {
    return _generateSubtitle(houseguest, state, false);
}

export function generateDetailedSubtitle(houseguest: PortraitProps, state: PortraitState): any[] {
    return _generateSubtitle(houseguest, state, true);
}

function getDeltaPopularity(houseguest: PortraitProps, statePopularity: number) {
    if (roundTwoDigits(houseguest.popularity) !== roundTwoDigits(statePopularity)) {
        return 0;
    }
    return houseguest.deltaPopularity ? roundTwoDigits(houseguest.deltaPopularity) : 0;
}

function compWins(houseguest: ProfileHouseguest): string {
    return `${houseguest.hohWins ? `♔ ${houseguest.hohWins}` : ""}${
        houseguest.povWins && houseguest.hohWins
            ? `|🛇 ${houseguest.povWins}`
            : houseguest.povWins
            ? `🛇 ${houseguest.povWins}`
            : ""
    }${(houseguest.hohWins || houseguest.povWins) && houseguest.nominations ? "|" : ""}${
        houseguest.nominations ? `✘ ${houseguest.nominations}` : ""
    }`;
}
