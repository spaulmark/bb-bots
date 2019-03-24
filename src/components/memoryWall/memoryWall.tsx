import React from "react";
import "./memoryWall.scss";
import { Houseguest } from "../../model/houseguest";
export interface IMemoryWallProps {
  readonly houseguests: Houseguest[];
}

function componentToHex(c: any) {
  var hex = Math.round(c).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: any, g: any, b: any) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function MemoryWall(props: IMemoryWallProps): JSX.Element {
  return <div className="box memory-wall">{getPlayers(props)}</div>;
}

const maxPopularity = { r: 137, g: 252, b: 137 };
const minPopularity = { r: 252, g: 137, b: 137 };

// TODO: make portrait its own functional component

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

    const percent = (houseguest.popularity + 1) / 2;
    const backgroundColor = houseguest.isEvicted
      ? undefined
      : rgbToHex(
          maxPopularity.r + percent * (minPopularity.r - maxPopularity.r),
          maxPopularity.g + percent * (minPopularity.g - maxPopularity.g),
          maxPopularity.b + percent * (minPopularity.b - maxPopularity.b)
        );

    rows.push(
      <div
        key={houseguest.profileData.name}
        style={{
          backgroundColor
        }}
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
      </div>
    );
  });

  return (
    <div className="columns is-gapless is-mobile is-multiline is-centered">
      {rows}
    </div>
  );
}
