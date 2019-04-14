import React from "react";
import { PlayerProfile } from "../../model";
import { MemoryWall } from "../memoryWall";

interface PregameScreenProps {
  cast: PlayerProfile[];
}

export function PregameScreen(props: PregameScreenProps): JSX.Element {
  return <MemoryWall houseguests={props.cast} />;
  // TODO: Begin game button, title stuff.
}
