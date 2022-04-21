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
    generate: generateGameOver,
};

export function generateGameOver(gameState: GameState): Episode {
    const title = "Game Over";
    const scenes: Scene[] = [];
    const content = generateVotingTable(gameState);
    gameState.houseguests.forEach((hg) => {
        evictHouseguest(gameState, hg.id);
    });
    return new Episode({ gameState, content, title, scenes, type: GameOver });
}
