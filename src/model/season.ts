import { BigBrotherVanilla } from "../components/episode/bigBrotherEpisode";
import { EpisodeFactory } from "../components/episode/episodeFactory";
import { GameState } from "./gameState";
import { Episode } from ".";
import { BigBrotherFinale } from "../components/episode/bigBrotherFinale";
import { cast$ } from "../subjects/subjects";
import { GameOver } from "../components/episode/gameOver";

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

    // TODO: I think the way to do this would be to have season asnycronously generate all episodes here,
    // and then store them in an array,
    // and then when sidebar calls renderEpisode, I can just pluck them from a pre-calculated array.
    // The problem being that if it's not there, it's just not there.

    // then maybe renderEpisode needs to become async?
    // wait
    // maybe as i generate them
    /// obviously i generate episode 1 first
    // then i have a hanging async function that is like "get episode 2"
    // and it literally just is an awaiting or something? idk

    // like if its array of async () => episode
    // then if there is NO episode
    // and the generator is still generating episode 2, then

    //maybe it uses subjects or something

    public renderEpisode(gameState: GameState): Episode {
        return this.factory.nextEpisode(gameState, this.whichEpisodeType(gameState.remainingPlayers));
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
