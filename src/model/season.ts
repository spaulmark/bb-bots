import { BigBrotherVanilla } from "../components/episode/bigBrotherEpisode";
import { GameState } from "./gameState";
import { Episode, EpisodeType, nextEpisode } from ".";
import { BigBrotherFinale } from "../components/episode/bigBrotherFinale";
import { GameOver } from "../components/episode/gameOver";

export function getFinalists() {
    return 2;
}

interface EpisodeLibrary {
    [id: number]: EpisodeType;
}

export class Season {
    private episodeLibrary: EpisodeLibrary = {};

    public constructor(episodeLibrary?: EpisodeLibrary) {
        if (episodeLibrary) this.episodeLibrary = episodeLibrary;
    }

    public renderEpisode(gameState: GameState): Episode {
        return nextEpisode(gameState, this.whichEpisodeType(gameState.remainingPlayers));
    }

    // TODO: this class should have jury size in it (or should it?)
    public whichEpisodeType(players: number) {
        if (players === 3) {
            return BigBrotherFinale;
        }
        if (players === 2) {
            return GameOver;
        }
        if (this.episodeLibrary[players]) {
            return this.episodeLibrary[players];
        }
        return BigBrotherVanilla;
    }
}
