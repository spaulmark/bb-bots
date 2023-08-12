import { BigBrotherVanilla } from "../components/episode/bigBrotherEpisode";
import { GameState } from "./gameState";
import { Episode, EpisodeType, nextEpisode } from ".";
import { BigBrotherFinale } from "../components/episode/bigBrotherFinale";
import { GameOver } from "../components/episode/gameOver";

export function getFinalists() {
    return 2;
}

export interface EpisodeLibrary {
    [id: number]: EpisodeType;
}

export class Season {
    private episodeLibrary: EpisodeLibrary = {};

    public constructor(episodeLibrary?: EpisodeLibrary) {
        if (episodeLibrary) this.episodeLibrary = episodeLibrary;
    }

    public renderEpisode(gameState: GameState): Episode {
        return nextEpisode(gameState, this.whichEpisodeType(gameState.remainingPlayers, gameState.phase));
    }

    public whichEpisodeType(players: number, phase: number) {
        if (this.episodeLibrary[phase]) {
            return this.episodeLibrary[phase];
        }
        // FIXME: will need to change for F3s and alternate endgames
        if (players === 3) {
            return BigBrotherFinale;
        }
        if (players === 2) {
            return GameOver;
        }
        return BigBrotherVanilla;
    }
}
