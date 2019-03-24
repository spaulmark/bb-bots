import React from "react";
import { Houseguest } from "../../model/houseguest";

function componentToHex(c: any) {
  var hex = Math.round(c).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

const maxPopularity = { r: 137, g: 252, b: 137 };
const minPopularity = { r: 252, g: 137, b: 137 };

function rgbToHex(r: any, g: any, b: any) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export const HouseguestPortrait = (props: any) => {
  const evictedImageURL = props.houseguest.profileData.evictedImageURL;
  const imageSrc =
    props.houseguest.isEvicted && evictedImageURL !== "BW"
      ? evictedImageURL
      : props.houseguest.profileData.imageURL;

  const imageClass =
    props.houseguest.isEvicted && evictedImageURL === "BW" ? "grayscale" : "";

  const percent = (props.houseguest.popularity + 1) / 2;
  const backgroundColor = props.houseguest.isEvicted
    ? undefined
    : rgbToHex(
        maxPopularity.r + percent * (minPopularity.r - maxPopularity.r),
        maxPopularity.g + percent * (minPopularity.g - maxPopularity.g),
        maxPopularity.b + percent * (minPopularity.b - maxPopularity.b)
      );
  return (
    <div
      key={props.houseguest.profileData.name}
      style={{
        backgroundColor
      }}
      className={`memory-wall-portrait ${
        props.houseguest.isEvicted ? "evicted" : ""
      }`}
    >
      <img
        className={imageClass}
        src={imageSrc}
        style={{ width: 100, height: 100 }}
      />
      <br />
      {props.houseguest.profileData.name}
    </div>
  );
};
