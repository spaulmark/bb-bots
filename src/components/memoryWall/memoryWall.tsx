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

    const imageClass =
      houseguest.isEvicted && evictedImageURL === "BW" ? "grayscale" : "";

    rows.push(
      <div
        className={`memory-wall-portrait ${
          houseguest.isEvicted ? "evicted" : ""
        }`}
      >
        <img
          className={imageClass}
          src={imageSrc}
          style={{ width: 100, height: 100 }}
        />
        <br />
        {houseguest.profileData.name}
        {/* TODO: Color the name based on popularity. */}
      </div>
    );
  });

  return (
    <div className="columns is-gapless is-mobile is-multiline is-centered">
      {rows}
    </div>
  );
}
