import {
  ProfileHouseguest,
  houseguestToPortrait,
  HouseguestPortrait
} from "../memoryWall";
import React from "react";
import { roundTwoDigits } from "../../utils";

export function memoryWallPortrait(
  houseguest: ProfileHouseguest,
  key?: any
): JSX.Element {
  let subtitle = [];
  if (houseguest.popularity && !houseguest.isEvicted) {
    let popularitySubtitle = `${roundTwoDigits(houseguest.popularity)}%`;
    const roundedDeltaPop = houseguest.deltaPopularity
      ? roundTwoDigits(houseguest.deltaPopularity)
      : 0;
    if (roundedDeltaPop !== 0) {
      const arrow = roundedDeltaPop > 0 ? " | ↑" : " | ↓";
      popularitySubtitle += `${arrow} ${roundedDeltaPop}%`;
    }
    subtitle.push(popularitySubtitle);
  }
  subtitle.push(`${compWins()}`);

  return (
    <HouseguestPortrait
      evictedImageURL={houseguest.evictedImageURL}
      imageURL={houseguest.imageURL}
      name={houseguest.name}
      isJury={houseguest.isJury}
      isEvicted={houseguest.isEvicted}
      key={key}
      popularity={houseguest.popularity}
      subtitle={subtitle}
    />
  );

  function compWins(): string {
    return `${houseguest.hohWins ? `♔ ${houseguest.hohWins}` : ""}${
      houseguest.povWins && houseguest.hohWins
        ? `|🛇 ${houseguest.povWins}`
        : houseguest.povWins
        ? `🛇 ${houseguest.povWins}`
        : ""
    }${
      (houseguest.hohWins || houseguest.povWins) && houseguest.nominations
        ? "|"
        : ""
    }${houseguest.nominations ? `✘ ${houseguest.nominations}` : ""}`;
  }
}

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
  detailed?: boolean;
}): JSX.Element {
  let key = 0;
  const rows: JSX.Element[] = [];
  if (!props.houseguests || props.houseguests.length === 0) {
    return <div />;
  }
  props.houseguests.forEach((houseguest: ProfileHouseguest) => {
    if (props.detailed) {
      rows.push(memoryWallPortrait(houseguest, key++));
    } else {
      rows.push(houseguestToPortrait(houseguest, key++));
    }
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
