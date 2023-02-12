import { GameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { EpisodeType, Episode } from "./episodes";
import { BoomerangVeto } from "./veto/veto";

export const BoomerangVetoEpisode: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 1,
    emoji: "🪃",
    description: "A veto that must be discarded or used to save both nominees.",
    name: "Boomerang Veto",
    generate: generate,
};

function generate(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, { veto: BoomerangVeto });
    return new Episode({
        gameState: new GameState(episode.gameState),
        initialGamestate,
        scenes: episode.scenes,
        type: BoomerangVetoEpisode,
    });
}
