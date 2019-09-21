import React from "react";
import { roundTwoDigits } from "../../utils";
import { ProfileHouseguest, PortraitProps, PortraitState } from "../memoryWall";
import { SelectedPlayerData } from "./selectedPortrait";
import {
    RelationshipTypeToSymbol,
    RelationshipType as Relationship,
    classifyRelationship
} from "../../utils/ai/classifyRelationship";
import { getSelectedPlayer } from "../../subjects/subjects";

export function generatePowerSubtitle(
    hero: PortraitProps,
    state: PortraitState,
    _: boolean | undefined
): any[] {
    let key = 0;
    let subtitle: any[] = [];
    key = addPopularityLine(state, hero, !!_, subtitle, key);
    key = addCompsLine(hero, subtitle, key);
    if (!hero.isEvicted && state.powerRanking) {
        const data = getSelectedPlayer() as SelectedPlayerData | null;
        if (data && data.id !== hero.id) {
            subtitle.push(<div key={key++}>{`${state.powerRanking!.beats > 0 ? "LOSE" : "WIN"}`}</div>);
        } else if (data && data.id === hero.id) {
            subtitle.push(<div key={key++}>I WOULD</div>);
        } else {
            subtitle.push(
                <div key={key++}>{`WINS ${state.powerRanking.beats}/${state.powerRanking.outOf}`}</div>
            );
        }
    }
    return subtitle;
}

export function generatePopularitySubtitle(
    hero: PortraitProps,
    state: PortraitState,
    detailed: boolean = false
): any[] {
    let key = 0;
    let subtitle: any[] = [];
    // popularity
    key = addPopularityLine(state, hero, detailed, subtitle, key);
    // competition wins
    key = addCompsLine(hero, subtitle, key);
    // friendship count / relationship classification titles
    ({ subtitle, key } = addFriendshipCountTitles(hero, subtitle, key));
    return subtitle;
}

function addFriendshipCountTitles(hero: PortraitProps, subtitle: any[], key: number) {
    if (!hero.isEvicted) {
        const data = getSelectedPlayer() as SelectedPlayerData | null;
        if (data && data.id !== hero.id) {
            const titles = friendOrEnemyTitle(hero, data);
            subtitle = subtitle.concat(titles.map(txt => <div key={key++}>{txt}</div>));
        } else {
            const titles = friendEnemyCountTitle(hero);
            subtitle = subtitle.concat(titles.map(txt => <div key={key++}>{txt}</div>));
        }
    } else {
        subtitle.push(<br key={key++} style={{ lineHeight: 1 }} />);
    }
    return { subtitle, key };
}

function addPopularityLine(
    state: { popularity?: number },
    hero: PortraitProps,
    detailed: boolean,
    subtitle: any[],
    key: number
) {
    let popularity = state.popularity;
    if (popularity && (popularity > 1 || popularity < -1)) {
        popularity = hero.popularity;
    }
    if (popularity && !hero.isEvicted) {
        let popularitySubtitle = `${roundTwoDigits(popularity)}%`;
        const deltaPop = getDeltaPopularity(hero, popularity);
        if (detailed && deltaPop !== 0) {
            const arrow = deltaPop > 0 ? " | ↑" : " | ↓";
            popularitySubtitle += `${arrow} ${deltaPop}%`;
        }
        subtitle.push(<div key={key++}>{popularitySubtitle}</div>);
    }
    return key;
}

function addCompsLine(hero: PortraitProps, subtitle: any[], key: number) {
    if (compWins(hero)) {
        subtitle.push(<div key={key++}>{`${compWins(hero)}`}</div>);
    } else {
        subtitle.push(<br key={key++} style={{ lineHeight: 1 }} />);
    }
    return key;
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
