import React from "react";

function componentToHex(c: any) {
  var hex = Math.round(c).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

const maxPopularity = { r: 137, g: 252, b: 137 };
const minPopularity = { r: 252, g: 137, b: 137 };

function rgbToHex(r: any, g: any, b: any) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export interface IPortraitProps {
  evictedImageURL: string;
  imageURL: string;
  name: string;
  isEvicted: boolean;
  popularity: number;
  subtitle?: string;
  tags?: string[];
}

export const HouseguestPortrait = (props: IPortraitProps) => {
  const evictedImageURL = props.evictedImageURL;
  const imageSrc =
    props.isEvicted && evictedImageURL !== "BW"
      ? evictedImageURL
      : props.imageURL;

  const imageClass =
    props.isEvicted && evictedImageURL === "BW" ? "grayscale" : "";

  const percent = (props.popularity + 1) / 2;
  const backgroundColor = props.isEvicted
    ? undefined
    : rgbToHex(
        maxPopularity.r + percent * (minPopularity.r - maxPopularity.r),
        maxPopularity.g + percent * (minPopularity.g - maxPopularity.g),
        maxPopularity.b + percent * (minPopularity.b - maxPopularity.b)
      );
  return (
    <div
      key={props.name}
      style={{
        backgroundColor
      }}
      className={`memory-wall-portrait ${props.isEvicted ? "evicted" : ""}`}
    >
      <img
        className={imageClass}
        src={imageSrc}
        style={{ width: 100, height: 100 }}
      />
      <br />
      {props.name}
      <br />
      {!!props.subtitle && (
        <div className="portrait-history">{props.subtitle}</div>
      )}
    </div>
  );
};
