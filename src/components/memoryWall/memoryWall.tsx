import React from "react";
import "./memoryWall.scss";
import { PlayerProfile } from "../../model";
import { Portraits } from "../playerPortrait/portraits";
import { RelationshipMap } from "../../utils";
export interface IMemoryWallProps {
  readonly houseguests: ProfileHouseguest[];
}

export interface ProfileHouseguest extends PlayerProfile {
  id?: number;
  relationships?: RelationshipMap;
  isEvicted?: boolean;
  isJury?: boolean;
  popularity?: number;
  deltaPopularity?: number;
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
  return (
    <div
      style={{
        margin: "auto",
        maxWidth: props.houseguests.length < 30 ? 700 : -1
      }}
    >
      <Portraits
        houseguests={props.houseguests}
        centered={true}
        detailed={true}
      />
    </div>
  );
}
