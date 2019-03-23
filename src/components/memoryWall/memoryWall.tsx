import React from "react";
import "./memoryWall.scss";
import { Houseguest } from "../../model/houseguest";
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
  props.houseguests.forEach(houseguest => {
    const evictedImageURL = houseguest.profileData.evictedImageURL;
    const imageSrc =
      houseguest.isEvicted && evictedImageURL !== "BW"
        ? evictedImageURL
        : houseguest.profileData.imageURL;

    const className =
      houseguest.isEvicted && evictedImageURL === "BW" ? "grayscale-image" : "";
    rows.push(
      <div className="box memory-wall-portrait">
        <img
          className={className}
          src={imageSrc}
          style={{ width: 100, height: 100 }}
        />
        <br />
        {houseguest.profileData.name}
        {/* TODO: Color the name. center it. format it. */}
      </div>
    );
  });

  return <div className="columns is-gapless is-multiline">{rows}</div>;
}
