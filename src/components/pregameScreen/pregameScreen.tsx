import React from "react";
import { PlayerProfile } from "../../model";
import { MemoryWall } from "../memoryWall";
import { NextEpisodeButton } from "../buttons/nextEpisodeButton";

interface PregameScreenProps {
  cast: PlayerProfile[];
}

export function PregameScreen(props: PregameScreenProps): JSX.Element {
  if (props.cast.length === 0) {
    return <div>Cast is empty</div>;
  }
  return (
    <div>
      <MemoryWall houseguests={props.cast} />
      <NextEpisodeButton />
    </div>
  );
  // TODO: Begin game button, title stuff.
}
