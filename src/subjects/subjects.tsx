import { BehaviorSubject, Subject } from "rxjs";
import { PregameScreen } from "../components/pregameScreen/pregameScreen";
import { PlayerProfile, Episode, Houseguest } from "../model";
import { SelectedPlayerData } from "../components/playerPortrait/selectedPortrait";

export const mainContentStream$ = new BehaviorSubject<JSX.Element>(<PregameScreen cast={[]} />);
export function pushToMainContentStream(e: JSX.Element) {
    mainContentStream$.next(e);
}

export const cast$ = new BehaviorSubject<PlayerProfile[]>([]);

// Null resets the season
export const episodes$ = new BehaviorSubject<Episode | null>(null);
export const switchEpisode$ = new Subject<number>();

export const selectedPlayer$ = new BehaviorSubject<SelectedPlayerData | null>(null);

export function getSelectedPlayer() {
    return selectedPlayer$.value;
}

export function selectPlayer(player: SelectedPlayerData | null) {
    if (!player || (getSelectedPlayer() && (getSelectedPlayer() as Houseguest).id === player.id)) {
        selectedPlayer$.next(null);
    } else {
        selectedPlayer$.next(player);
    }
}
