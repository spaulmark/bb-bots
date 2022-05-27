import { GameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { EpisodeType, Episode } from "./episodes";
import { DiamondVeto } from "./veto/veto";

export const DiamondVetoEpisode: EpisodeType = {
    canPlayWith: (n: number) => n >= 4,
    eliminates: 1,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "💎 Diamond Veto",
    generate: generateNoVeto,
};

function generateNoVeto(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, DiamondVeto);
    return new Episode({
        gameState: new GameState(episode.gameState),
        initialGamestate,
        title: episode.title,
        scenes: episode.scenes,
        type: DiamondVetoEpisode,
    });
}
