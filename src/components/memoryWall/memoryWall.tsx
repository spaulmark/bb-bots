import React from "react";
import "./memoryWall.scss";
import { houseguestToPortrait } from "../playerPortrait/houseguestPortrait";
import { PlayerProfile, Houseguest } from "../../model";
export interface IMemoryWallProps {
  readonly houseguests: ProfileHouseguest[];
}

export interface ProfileHouseguest extends PlayerProfile {
  isEvicted?: boolean;
  popularity?: number;
  hohWins?: number;
  povWins?: number;
  nominations?: number;
}

export function MemoryWall(props: IMemoryWallProps): JSX.Element {
  return <div className="memory-wall">{getPlayers(props)}</div>;
}

function getPlayers(props: IMemoryWallProps): any {
  if (!props.houseguests || props.houseguests.length === 0) {
    return null;
  }
  const rows: JSX.Element[] = [];
  let key = 0;
  props.houseguests.forEach((houseguest: ProfileHouseguest) => {
    // TODO: Organizing and formatting so it looks better. Hard cap of 6 people per row.
    // Trying to even the rows and preventing rows of only one person.
    rows.push(houseguestToPortrait(houseguest, key++));
  });

  return (
    <div className="columns is-gapless is-mobile is-multiline is-centered">
      {rows}
    </div>
  );
}
