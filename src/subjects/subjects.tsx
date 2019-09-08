import { BehaviorSubject, Subject } from "rxjs";
import { PregameScreen } from "../components/pregameScreen/pregameScreen";
import { Episode, PlayerProfile } from "../model";
import { SelectedPlayerData } from "../components/playerPortrait/selectedPortrait";
import React from "react";

// What is currently being displayed.
export const mainContentStream$ = new BehaviorSubject(<PregameScreen cast={[]} />);
// Push episodes to this subject to add them to the sidebar. Null resets everything.
export const episodes$ = new BehaviorSubject<Episode | null>(null);
// Switches episodes.
export const switchEpisode$ = new Subject<number>();
export function newEpisode(episode: Episode | null) {
    episodes$.next(episode);
}
export function switchSceneRelative(n: number) {
    switchEpisode$.next(n);
}
// the list of players in the game
export const cast$ = new BehaviorSubject<PlayerProfile[]>([]);
export function updateCast(newCast: PlayerProfile[]) {
    cast$.next(newCast);
}
export function getCast(): PlayerProfile[] {
    return cast$.value;
}
// The player that the user has clicked on.
export const selectedPlayer$ = new BehaviorSubject<SelectedPlayerData | null>(null);
export function getSelectedPlayer() {
    return selectedPlayer$.value;
}
