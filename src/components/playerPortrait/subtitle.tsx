import React from "react";
import { roundTwoDigits } from "../../utils";
import { ProfileHouseguest, PortraitProps, PortraitState } from "../memoryWall";
import {
    RelationshipTypeToSymbol,
    RelationshipType as Relationship,
    classifyRelationship
} from "../../utils/ai/classifyRelationship";
import { getSelectedPlayer } from "../../subjects/subjects";
import { SelectedPlayerData } from "./selectedPortrait";

function _generateSubtitle(hero: PortraitProps, state: PortraitState, detailed: boolean): any[] {
    let key = 0;
    let popularity = state.popularity;
    if (popularity && (popularity > 1 || popularity < -1)) {
        popularity = hero.popularity;
    }
    let subtitle: any[] = [];
    // popularity
    if (popularity && !hero.isEvicted) {
        let popularitySubtitle = `${roundTwoDigits(popularity)}%`;
        const deltaPop = getDeltaPopularity(hero, popularity);
        if (detailed && deltaPop !== 0) {
            const arrow = deltaPop > 0 ? " | ↑" : " | ↓";
            popularitySubtitle += `${arrow} ${deltaPop}%`;
        }
        subtitle.push(<div key={key++}>{popularitySubtitle}</div>);
    }
    // competition wins
    if (compWins(hero)) {
        subtitle.push(<div key={key++}>{`${compWins(hero)}`}</div>);
    } else {
        subtitle.push(<br key={key++} style={{ lineHeight: 1 }} />);
    }
    // friendship count / titles
    if (!hero.isEvicted && getSelectedPlayer() !== null) {
        const data = getSelectedPlayer() as SelectedPlayerData;
        if (data.id !== hero.id) {
            const titles = friendOrEnemyTitle(hero, data);
            subtitle = subtitle.concat(titles.map(txt => <div key={key++}>{txt}</div>));
        } else {
            const titles = friendEnemyCountTitle(hero);
            subtitle = subtitle.concat(titles.map(txt => <div key={key++}>{txt}</div>));
        }
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

function friendOrEnemyTitle(hero: PortraitProps, villain: SelectedPlayerData): string[] {
    const titles: string[] = [];
    titles.push(
        RelationshipTypeToSymbol[
            classifyRelationship(hero.popularity || 0, villain.popularity, hero.relationships![villain.id])
        ]
    );
    return titles;
}

function friendEnemyCountTitle(hero: PortraitProps): string[] {
    const titles: string[] = [];
    const count = hero.getFriendEnemyCount ? hero.getFriendEnemyCount() : { friends: 0, enemies: 0 };
    titles.push(
        `${count.friends} ${RelationshipTypeToSymbol[Relationship.Friend]} | ${count.enemies} ${
            RelationshipTypeToSymbol[Relationship.Enemy]
        }`
    );
    return titles;
}
