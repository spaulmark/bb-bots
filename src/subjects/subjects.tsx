import { BehaviorSubject, Subject } from "rxjs";
import { PregameScreen } from "../components/pregameScreen/pregameScreen";
import { Episode, PlayerProfile } from "../model";
import { SelectedPlayerData } from "../components/playerPortrait/selectedPortrait";
import React from "react";

export const mainContentStream$ = new BehaviorSubject(<PregameScreen cast={[]} />);

// Null resets the season
export const episodes$ = new BehaviorSubject<Episode | null>(null);
export const switchEpisode$ = new Subject<number>();

export function newEpisode(episode: Episode | null) {
    episodes$.next(episode);
}

export function switchSceneRelative(n: number) {
    switchEpisode$.next(n);
}

export const cast$ = new BehaviorSubject<PlayerProfile[]>([]);

export function updateCast(newCast: PlayerProfile[]) {
    cast$.next(newCast);
}

export function getCast(): PlayerProfile[] {
    return cast$.value;
}

export const selectedPlayer$ = new BehaviorSubject<SelectedPlayerData | null>(null);

export function getSelectedPlayer() {
    return selectedPlayer$.value;
}
