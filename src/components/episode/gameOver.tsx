import { Episode, InitEpisode, EpisodeType } from "./episodes";
import { Scene } from "./scene";
import { GameState } from "../../model";
import { generateVotingTable } from "./scenes/votingTable";
import { evictHouseguest } from "./utilities/evictHouseguest";

export const GameOver: EpisodeType = {
    canPlayWith: (_: number) => true,
    eliminates: 1,
    arrowsEnabled: false,
    hasViewsbar: false,
    name: "Game Over",
};

export function generateGameOver(gameState: GameState): GameOverEpisode {
    const title = "Game Over";
    const scenes: Scene[] = [];
    const content = generateVotingTable(gameState);
    gameState.houseguests.forEach((hg) => {
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
