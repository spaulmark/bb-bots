import { Houseguest } from "../../model";
import { RelationshipMap } from "../../utils";
import {
    displayMode$,
    getSelectedCastPlayers,
    getSelectedPlayer,
    selectedCastPlayer$,
    selectedPlayer$,
} from "../../subjects/subjects";
import { powerMode } from "../../model/portraitDisplayMode";

export interface SelectedPlayerData {
    id: number;
    popularity: number;
    relationships: RelationshipMap;
    isEvicted: boolean;
    superiors?: { [id: number]: number };
}

export function selectPlayer(player: SelectedPlayerData | null) {
    if (!player || (getSelectedPlayer() && (getSelectedPlayer() as Houseguest).id === player.id)) {
        selectedPlayer$.next(null);
        return;
    }
    if (
        displayMode$.value === powerMode &&
        (!player.superiors || Object.keys(player.superiors).length === 0)
    ) {
        selectedPlayer$.next(null);
        return;
    }
    selectedPlayer$.next(player);
}

export function selectCastPlayer(id: number | null) {
    if (id === null) {
        selectedCastPlayer$.next(new Set());
        return;
    }
    const selectedCastPlayers = getSelectedCastPlayers();
    if (selectedCastPlayers.has(id)) {
        // remove if exists
        selectedCastPlayers.delete(id);
    } else {
        // else add
        selectedCastPlayers.add(id);
    }
    selectedCastPlayer$.next(selectedCastPlayers);
}
