import { GameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { EpisodeType, Episode } from "./episodes";

export const NoVeto: EpisodeType = {
    canPlayWith: (n: number) => n >= 4,
    eliminates: 1,
    arrowsEnabled: true,
    emoji: "🚫",
    hasViewsbar: true,
    name: "No Veto",
    description: "A week without a veto.",
    generate: generateNoVeto,
};

function generateNoVeto(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, null);
    return new Episode({
        gameState: new GameState(episode.gameState),
        initialGamestate,
        scenes: episode.scenes,
        type: NoVeto,
    });
}
