import { GameState, MutableGameState, nonEvictedHouseguests } from "../../model/gameState";
import { Episode, Houseguest } from "../../model";
import { EpisodeType } from "./episodes";
import { angleBetween, rng } from "../../utils";
import { EpisodeLog } from "../../model/logging/episodelog";
import { generateCliques } from "../../utils/generateCliques";
import { refreshHgStats } from "./utilities/evictHouseguest";
import { cast$ } from "../../subjects/subjects";

export function canDisplayCliques(newState: GameState): boolean {
    return newState.remainingPlayers <= 30;
}

export function firstImpressionsMap(hgs: number): { [id: number]: { [id: number]: number } } {
    const sin = Math.sin;
    const cos = Math.cos;
    const compatibilityMap: { [id: number]: [number, number, number] } = {};
    const map: { [id: number]: { [id: number]: number } } = {};

    for (let i = 0; i < hgs; i++) {
        map[i] = {};
        // generate random spherical co-ordinates on the unit sphere
        const u = rng().randomFloat();
        const v = Math.abs(rng().randomFloat());
        const θ = 2 * Math.PI * u;
        const φ = Math.acos(2 * v - 1);
        // convert spherical co-ords to cartesian co-ords
        compatibilityMap[i] = [sin(θ) * cos(φ), sin(θ) * sin(φ), cos(θ)];
    }

    for (let i = 0; i < hgs; i++) {
        for (let j = i + 1; j < hgs; j++) {
            // creates a bunch of mutual relationships based on points on a sphere
            const impression = 1 - (2 * angleBetween(compatibilityMap[i], compatibilityMap[j])) / Math.PI;
            map[i][j] = impression;
            map[j][i] = impression;
        }
    }
    return map;
}

function firstImpressions(houseguests: Houseguest[]) {
    const map = cast$.value.options?.relationships || firstImpressionsMap(houseguests.length);
    for (let i = 0; i < houseguests.length; i++) {
        for (let j = i + 1; j < houseguests.length; j++) {
            houseguests[i].relationships[houseguests[j].id] = map[i][j];
            houseguests[j].relationships[houseguests[i].id] = map[i][j];
        }
    }
}

export function nextEpisode(gameState: GameState, episodeType: EpisodeType): Episode {
    let newState = new MutableGameState(gameState);
    if (gameState.phase === 0) {
        firstImpressions(newState.houseguests);
    }
    !episodeType.pseudo && newState.phase++;
    !episodeType.pseudo && newState.resetLogIndex();
    if (gameState.remainingPlayers > 2 && !episodeType.pseudo) {
        newState.log[newState.phase] = [new EpisodeLog()];
    }
    refreshHgStats(newState, true);
    nonEvictedHouseguests(newState).forEach((hg) => {
        hg.previousPopularity = hg.popularity;
    });
    if (canDisplayCliques(newState)) newState.cliques = generateCliques(newState);
    const finalState = new GameState(newState);
    if (!episodeType.canPlayWith(finalState.remainingPlayers))
        throw new Error(
            `Episode type ${episodeType.name} not playable with ${finalState.remainingPlayers} players`
        );
    return episodeType.generate(finalState);
}
