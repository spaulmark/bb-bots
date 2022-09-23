import { BehaviorSubject, Subject } from "rxjs";
import { PregameScreen, PregameScreenProps } from "../components/pregameScreen/pregameScreen";
import { Episode, PlayerProfile } from "../model";
import { SelectedPlayerData } from "../components/playerPortrait/selectedPortrait";
import React from "react";
import { PortraitDisplayMode, popularityMode } from "../model/portraitDisplayMode";
import { ColorTheme } from "../theme/theme";
import { EpisodeLibrary } from "../model/season";
import { activeScreen$, Screens } from "../components/topbar/topBar";

// What is currently being displayed.
export const mainContentStream$ = new BehaviorSubject(<PregameScreen cast={[]} options={{}} />);

export function pushToMainContentStream(content: JSX.Element, tab?: Screens) {
    tab && activeScreen$.next(tab);
    mainContentStream$.next(content);
}

// Push episodes to this subject to add them to the sidebar. Null resets everything.
export const episodes$ = new BehaviorSubject<Episode | null>(null);
// Forcibly switches to an episode. Used when adding a new episode.
export const switchEpisode$ = new Subject<number>();
export function newEpisode(episode: Episode | null) {
    episodes$.next(episode);
}
export function switchSceneRelative(n: number) {
    switchEpisode$.next(n);
}

// pushed when a new season is created (may need to be upgraded to behavior subject in the future)
export const season$ = new Subject<EpisodeLibrary>();

// the list of players in the game
export const cast$ = new BehaviorSubject<PregameScreenProps>({ cast: [] });

// note this function overwrites everything
export function overwriteCast(newCast: PlayerProfile[]) {
    cast$.next({ cast: newCast });
}
export function getCast(): PlayerProfile[] {
    return cast$.value.cast;
}
// The player that the user has clicked on.
export const selectedPlayer$ = new BehaviorSubject<SelectedPlayerData | null>(null);
export function getSelectedPlayer() {
    return selectedPlayer$.value;
}

// The cast member(s) that the user has clicked on.
// Used for the casting screen.
export const selectedCastPlayer$ = new BehaviorSubject<Set<number>>(new Set<number>());

export function getSelectedCastPlayers() {
    return selectedCastPlayer$.value;
}

// The decks that have been selected on the casting screen.
export const selectedDecks$ = new BehaviorSubject<Set<string>>(new Set<string>());

export function selectDeckSubject(deck: string | null) {
    if (deck === null) {
        selectedDecks$.next(new Set());
        return;
    }
    const selectedDecks = selectedDecks$.value;
    if (selectedDecks.has(deck)) {
        // remove if exists
        selectedDecks.delete(deck);
    } else {
        // else add
        selectedDecks.add(deck);
    }
    selectedDecks$.next(selectedDecks);
}

// The tab selected on the start of each week.
export const weekStartTab$ = new BehaviorSubject<number>(0);

// The display mode selected by the viewsbar.
export const displayMode$ = new BehaviorSubject<PortraitDisplayMode>(popularityMode);

// If the screen is fullscreen or not.
export const isFullscreen$ = new BehaviorSubject<boolean>(false);

// dark or light mode.
export const theme$ = new Subject<ColorTheme>();
