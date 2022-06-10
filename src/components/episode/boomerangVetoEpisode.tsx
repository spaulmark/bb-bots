import { GameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { EpisodeType, Episode } from "./episodes";
import { BoomerangVeto } from "./veto/veto";

export const BoomerangVetoEpisode: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 1,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "🪃 Boomerang Veto",
    generate: generate,
};

function generate(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, BoomerangVeto);
    return new Episode({
        gameState: new GameState(episode.gameState),
        initialGamestate,
        title: episode.title,
        scenes: episode.scenes,
        type: BoomerangVetoEpisode,
    });
}
