import { BehaviorSubject } from "rxjs";
import { Houseguest } from "../../model";
import { RelationshipMap } from "../../utils";

export const selectedPlayer$ = new BehaviorSubject<SelectedPlayerData | null>(
  null
);

export interface SelectedPlayerData {
  id: number;
  relationships: RelationshipMap;
}

export function getSelectedPlayer() {
  return selectedPlayer$.value;
}

export function selectPlayer(player: SelectedPlayerData) {
  if (
    getSelectedPlayer() &&
    (getSelectedPlayer() as Houseguest).id === player.id
  ) {
    selectedPlayer$.next(null);
  } else {
    selectedPlayer$.next(player);
  }
}
