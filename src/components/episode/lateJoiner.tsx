import React from "react";
import { GameState, MutableGameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { EpisodeType, Episode } from "./episodes";
import { Scene } from "./scenes/scene";

export const LateJoiner: EpisodeType = generateLateJoinerEpisodeType(1);

function generate(initialGamestate: GameState, joiners: number): Episode {
    throw "TODO";
}

export function generateLateJoinerEpisodeType(joiners: number): EpisodeType {
    return {
        canPlayWith: (n: number) => n >= 3,
        eliminates: -joiners,
        reduceCastSizeBy: joiners,
        emoji: "💤",
        chainable: true,
        name: "Late Joiner",
        description: "A new houseguest joins the game.",
        generate: (initialGameState: GameState) => generate(initialGameState, joiners),
    };
}
