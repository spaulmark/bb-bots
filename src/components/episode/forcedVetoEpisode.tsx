import { GameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { EpisodeType, Episode } from "./episodes";
import { SpotlightVeto } from "./veto/veto";

export const ForcedVetoEpisode: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 1,
    arrowsEnabled: true,
    emoji: "🔦",
    hasViewsbar: true,
    name: "Forced Veto",
    description: "The veto winner must use the veto.",
    generate: generateForcedVeto,
};

function generateForcedVeto(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, SpotlightVeto);
    return new Episode({
        gameState: new GameState(episode.gameState),
        initialGamestate,
        scenes: episode.scenes,
        type: ForcedVetoEpisode,
    });
}
