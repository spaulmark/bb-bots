import { GameState, MutableGameState } from "../../model";
import { Episode, EpisodeType } from "./episodes";

export const Teams: EpisodeType = {
    canPlayWith: (n: number) => n > 3,
    eliminates: 0,
    pseudo: true,
    name: "Teams",
    description:
        "Houseguests are divided into teams, and may not nominate their teammates unless they have no other option.",
    emoji: "🎌",
    generate: generateCoHoH,
};

function generateCoHoH(initialGamestate: GameState): Episode {
    let currentGameState = new MutableGameState(initialGamestate);
    // TODO: generate teams, this is probably a pseudo thing where it returns a function or whatever idk

    return new Episode({
        gameState: new GameState(currentGameState),
        initialGamestate,
        scenes: [],
        type: Teams,
    });
}
