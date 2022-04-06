import { GameState, MutableGameState } from "../../model/gameState";
import { Episode, Houseguest } from "../../model";
import { EpisodeType } from "./episodes";
import { BigBrotherVanilla, generateBbVanilla } from "./bigBrotherEpisode";
import { BigBrotherFinale, generateBbFinale } from "./bigBrotherFinale";
import { angleBetween, rng } from "../../utils";
import { GameOver, generateGameOver } from "./gameOver";
import { EpisodeLog } from "../../model/logging/episodelog";
import { generateCliques } from "../../utils/generateCliques";
import { generateSafetyChain, SafetyChain } from "./safetyChain";
import _ from "lodash";
import { DoubleEviction, generateDoubleEviction } from "./doubleEvictionEpisode";
import { refreshHgStats } from "./utilities/evictHouseguest";

export function canDisplayCliques(newState: GameState): boolean {
    return newState.remainingPlayers <= 30;
}

function firstImpressions(houseguests: Houseguest[]) {
    const sin = Math.sin;
    const cos = Math.cos;
    houseguests.forEach((hg) => {
        // generate random spherical co-ordinates on the unit sphere
        const u = rng().randomFloat();
        const v = Math.abs(rng().randomFloat());
        const θ = 2 * Math.PI * u;
        const φ = Math.acos(2 * v - 1);
        // convert spherical co-ords to cartesian co-ords
        hg.compatibility = [sin(θ) * cos(φ), sin(θ) * sin(φ), cos(θ)];
    });
    for (let i = 0; i < houseguests.length; i++) {
        const iMap = houseguests[i].relationships;
        for (let j = i + 1; j < houseguests.length; j++) {
            // creates a bunch of mutual relationships based on points on a sphere
            const jMap = houseguests[j].relationships;
            const impression =
                1 - (2 * angleBetween(houseguests[i].compatibility, houseguests[j].compatibility)) / Math.PI;
            jMap[i] = impression;
            iMap[j] = impression;
        }
    }
}

export class EpisodeFactory {
    public nextEpisode(gameState: GameState, episodeType: EpisodeType): Episode {
        let newState = new MutableGameState(gameState);
        if (gameState.phase === 0) {
            firstImpressions(newState.houseguests);
        }
        newState.phase++;
        newState.resetLogIndex();
        if (gameState.remainingPlayers > 2) {
            newState.log[newState.phase] = [new EpisodeLog()];
        }
        refreshHgStats(newState);

        if (canDisplayCliques(newState)) newState.cliques = generateCliques(newState);
        const finalState = new GameState(newState);
        if (!episodeType.canPlayWith(finalState.remainingPlayers))
            throw new Error(
                `Episode type ${episodeType.name} not playable with ${finalState.remainingPlayers} players`
            );
        switch (episodeType) {
            case BigBrotherVanilla:
                return generateBbVanilla(finalState);
            case BigBrotherFinale:
                return generateBbFinale(finalState);
            case SafetyChain:
                return generateSafetyChain(finalState);
            case GameOver:
                return generateGameOver(finalState);
            case DoubleEviction:
                return generateDoubleEviction(finalState);
            default:
                throw new Error("Unsupported Episode Type");
        }
    }
}
