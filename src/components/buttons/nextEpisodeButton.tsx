import { switchEpisodeRelative } from "../sidebar/sidebarController";
import React from "react";

export function NextEpisodeButton(): JSX.Element {
  return (
    <button
      className="button is-primary"
      onClick={() => switchEpisodeRelative(1)}
    >
      Continue
    </button>
  );
}
