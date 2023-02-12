import { GameState } from "../../model";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";
import { EpisodeType, Episode } from "./episodes";

export const BbAustralia: EpisodeType = {
    canPlayWith: (n: number) => n >= 4,
    eliminates: 1,
    emoji: "🇦🇺",
    name: "BB Australia",
    description:
        "3 nominees, and no veto. Nominees are able to vote. The previous HoH participates in the HoH comp.",
    generate,
};

function generate(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, {
        veto: null,
        thirdNominee: true,
        nomineesCanVote: true,
        previousHoHcanCompete: true,
    });
    return new Episode({
        gameState: new GameState(episode.gameState),
        initialGamestate,
        scenes: episode.scenes,
        type: BbAustralia,
    });
}
