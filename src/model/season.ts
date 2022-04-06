import { BigBrotherVanilla } from "../components/episode/bigBrotherEpisode";
import { EpisodeFactory } from "../components/episode/episodeFactory";
import { GameState } from "./gameState";
import { Episode } from ".";
import { BigBrotherFinale } from "../components/episode/bigBrotherFinale";
import { cast$ } from "../subjects/subjects";
import { GameOver } from "../components/episode/gameOver";
import { SafetyChain } from "../components/episode/safetyChain";
import { DoubleEviction } from "../components/episode/doubleEvictionEpisode";

export function finalJurySize() {
    return jurors;
}

// 7 is not a magic number: it is just an arbitrary value which is always overwritten by cast$ before it is read.
let jurors = 7;

const sub = cast$.subscribe({
    next: (newCast) => {
        let players = newCast.length;
        players = Math.round(players * 0.55);
        if (players % 2 === 0) {
            players--;
        }
        jurors = players;
    },
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

    public renderEpisode(gameState: GameState): Episode {
        return this.factory.nextEpisode(gameState, this.whichEpisodeType(gameState.remainingPlayers));
    }

    // TODO: this function needs to get injected or something
    public whichEpisodeType(players: number) {
        if (players === 3) {
            return BigBrotherFinale;
        }
        if (players === 2) {
            return GameOver;
        }
        if (players === 16) {
            return DoubleEviction;
        }

        // TODO: make safety chain into a big brother canada safety chain
        ///// commented out lines make every 4th episode a safety chain

        // if (players % 4 !== 1) {
        return BigBrotherVanilla;
        // }
        // return SafetyChain;
    }
}
