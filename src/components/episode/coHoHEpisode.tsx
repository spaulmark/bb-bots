import { GameState } from "../../model";
import { Episode, EpisodeType } from "./episodes";
import { GoldenVeto } from "./veto/veto";
import { PoVvote } from "../../model/logging/voteType";
import { generateBBVanillaScenes } from "./bigBrotherEpisode";

export const CoHoH: EpisodeType = {
    canPlayWith: (n: number) => n >= 5,
    eliminates: 1,
    arrowsEnabled: true,
    hasViewsbar: true,
    name: "Co-HoH",
    description:
        "Two HoHs each name one nominee, and are responsible for replacing the person they nominated if the veto is used on them.",
    emoji: "👥",
    generate: generateCoHoH,
};

function generateCoHoH(initialGamestate: GameState): Episode {
    const episode = generateBBVanillaScenes(initialGamestate, {
        veto: GoldenVeto,
        coHoH: true,
        coHohIsFinal: true,
        tieBreaker: (povWinner) => {
            return povWinner
                ? { hg: povWinner, text: "Power of Veto winner", voteType: (id) => new PoVvote(id) }
                : undefined;
        },
    });
    return new Episode({
        gameState: new GameState(episode.gameState),
        initialGamestate,
        scenes: episode.scenes,
        type: CoHoH,
    });
}
