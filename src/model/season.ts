import { BigBrotherVanilla } from "../components/episode/bigBrotherEpisode";
import { EpisodeFactory } from "../components/episode/episodeFactory";
import { GameState } from "./gameState";
import { EpisodeType, Episode } from ".";
import { BigBrotherFinale } from "../components/episode/bigBrotherFinale";
import { cast$ } from "../subjects/subjects";
import { GameOver } from "../components/episode/gameOver";

export function finalJurySize() {
    return jurors;
}

let jurors = 7;
const sub = cast$.subscribe({
    next: newCast => {
        let players = newCast.length;
        players = Math.round(players * 0.55);
        if (players % 2 === 0) {
            players--;
        }
        jurors = players;
    }
});

export function getFinalists() {
    return 2;
}

export class Season {
    private factory: EpisodeFactory;

    public constructor() {
        this.factory = new EpisodeFactory();
    }

    // In the future, this would all be customizable,
    // and not just all big brother episodes by default.

    public renderEpisode(gameState: GameState, type: EpisodeType): Episode {
        return this.factory.nextEpisode(gameState, type);
    }

    public whichEpisodeType(players: number) {
        if (players === 3) {
            return BigBrotherFinale;
        }
        if (players === 2) {
            return GameOver;
        }
        return BigBrotherVanilla;
    }
}
