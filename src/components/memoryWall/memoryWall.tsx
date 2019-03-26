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
        evictedImageURL={houseguest.evictedImageURL}
        imageURL={houseguest.imageURL}
        name={houseguest.name}
        isEvicted={houseguest.isEvicted}
        popularity={houseguest.popularity}
        key={houseguest.name}
        povWins={houseguest.povWins}
        hohWins={houseguest.hohWins}
        noms={houseguest.nominations}
      />
    );
  });

  return (
    <div className="columns is-gapless is-mobile is-multiline is-centered">
      {rows}
    </div>
  );
}
