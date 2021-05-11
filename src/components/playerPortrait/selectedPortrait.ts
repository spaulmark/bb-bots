import { Houseguest } from "../../model";
import { RelationshipMap } from "../../utils";
import { getSelectedPlayer, selectedPlayer$ } from "../../subjects/subjects";

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
    } else {
        selectedPlayer$.next(player);
    }
}
