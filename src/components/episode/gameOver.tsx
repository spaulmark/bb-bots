import { Episode, InitEpisode, EpisodeType } from "./episodes";
import { Scene } from "./scene";
import { GameState } from "../../model";
import { evictHouseguest } from "./bigBrotherEpisode";
import { generateVotingTable } from "./scenes/votingTable";

export const GameOver: EpisodeType = {
    canPlayWith: (n: number) => n === 1,
    eliminates: 1
};

export function generateGameOver(gameState: GameState): GameOverEpisode {
    const title = "Game Over";
    const scenes: Scene[] = [];
    const content = generateVotingTable(gameState);
    gameState.houseguests.forEach(hg => {
        evictHouseguest(gameState, hg.id);
    });
    return new GameOverEpisode({ gameState, content, title, scenes, type: GameOver });
}

export class GameOverEpisode extends Episode {
    readonly title: string;
    readonly scenes: Scene[];
    readonly content: JSX.Element;
    readonly gameState: GameState;

    public constructor(init: InitEpisode) {
        super(init);
        this.title = init.title;
        this.scenes = init.scenes;
        this.content = init.content;
        this.gameState = init.gameState;
    }
}
