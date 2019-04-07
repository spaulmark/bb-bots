import React from "react";
import "./memoryWall.scss";
import { HouseguestPortrait } from "../playerPortrait/houseguestPortrait";
import { PlayerProfile } from "../../model";
export interface IMemoryWallProps {
  readonly houseguests: ProfileHouseguest[];
}

interface ProfileHouseguest extends PlayerProfile {
  isEvicted?: boolean;
  popularity?: number;
  hohWins?: number;
  povWins?: number;
  nominations?: number;
}

export function MemoryWall(props: IMemoryWallProps): JSX.Element {
  return <div className="box memory-wall">{getPlayers(props)}</div>;
}

function getPlayers(props: IMemoryWallProps): any {
  if (!props.houseguests || props.houseguests.length === 0) {
    return null;
  }
  const rows: JSX.Element[] = [];
  props.houseguests.forEach((houseguest: ProfileHouseguest) => {
    // TODO: Organizing and formatting so it looks better. Hard cap of 6 people per row.
    // Trying to even the rows and preventing rows of only one person.
    rows.push(
      <HouseguestPortrait
        evictedImageURL={houseguest.evictedImageURL}
        imageURL={houseguest.imageURL}
        name={houseguest.name}
        isEvicted={houseguest.isEvicted}
        popularity={houseguest.popularity}
        key={houseguest.name}
        subtitle={`${houseguest.hohWins ? `♔ ${houseguest.hohWins}` : ""}${
          houseguest.povWins && houseguest.hohWins
            ? `|🛇 ${houseguest.povWins}`
            : houseguest.povWins
            ? `🛇 ${houseguest.povWins}`
            : ""
        }${
          (houseguest.hohWins || houseguest.povWins) && houseguest.nominations
            ? "|"
            : ""
        }${houseguest.nominations ? `✘ ${houseguest.nominations}` : ""}`}
      />
    );
  });

  return (
    <div className="columns is-gapless is-mobile is-multiline is-centered">
      {rows}
    </div>
  );
}
