import { ProfileHouseguest, houseguestToPortrait } from "../memoryWall";
import React from "react";

export function Portrait(props: {
  houseguest: ProfileHouseguest;
  centered?: boolean;
}): JSX.Element {
  return (
    <div
      className={`columns is-gapless is-mobile is-multiline ${props.centered &&
        "is-centered"}`}
    >
      {houseguestToPortrait(props.houseguest)}
    </div>
  );
}

export function Portraits(props: {
  houseguests: ProfileHouseguest[];
  centered?: boolean;
}): JSX.Element {
  let key = 0;
  const rows: JSX.Element[] = [];
  if (!props.houseguests || props.houseguests.length === 0) {
    return <div />;
  }
  props.houseguests.forEach((houseguest: ProfileHouseguest) => {
    rows.push(houseguestToPortrait(houseguest, key++));
  });

  return (
    <div
      className={`columns is-gapless is-mobile is-multiline ${props.centered &&
        "is-centered"}`}
    >
      {rows}
    </div>
  );
}
