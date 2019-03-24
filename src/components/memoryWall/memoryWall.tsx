import React from "react";
import "./memoryWall.scss";
import { Houseguest } from "../../model/houseguest";
import { HouseguestPortrait } from "./houseguestPortrait";
export interface IMemoryWallProps {
  readonly houseguests: Houseguest[];
}

export function MemoryWall(props: IMemoryWallProps): JSX.Element {
  return <div className="box memory-wall">{getPlayers(props)}</div>;
}

function getPlayers(props: IMemoryWallProps): any {
  if (!props.houseguests || props.houseguests.length === 0) {
    return null;
  }
  const rows: JSX.Element[] = [];
  props.houseguests.forEach((houseguest: Houseguest) => {
    rows.push(
      <HouseguestPortrait
        houseguest={houseguest}
        key={houseguest.profileData.name}
      />
    );
  });

  return (
    <div className="columns is-gapless is-mobile is-multiline is-centered">
      {rows}
    </div>
  );
}
