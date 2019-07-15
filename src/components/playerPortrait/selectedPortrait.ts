import { BehaviorSubject } from "rxjs";
import { Houseguest } from "../../model";
import { RelationshipMap } from "../../utils";

export const selectedPlayer$ = new BehaviorSubject<SelectedPlayerData | null>(null);

export interface SelectedPlayerData {
    id: number;
    popularity: number; // TODO:  this is EXTREMELY bad. we are pushing a static object to something that NEEDS TO dynamically change
    relationships: RelationshipMap; // this is bad and i dont know HOW TO FIX IT
    isEvicted: boolean;
    superiors?: Set<number>;
}

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
