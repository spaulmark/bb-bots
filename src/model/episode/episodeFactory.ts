import {
    GameState,
    MutableGameState,
    calculatePopularity,
    nonEvictedHouseguests,
    inJury,
    getJurors
} from "../gameState";
import { Episode, Houseguest } from "..";
import { EpisodeType } from "./episodes";
import { BigBrotherVanilla, BigBrotherVanillaEpisode } from "./bigBrotherEpisode";
import { BigBrotherFinale, BigBrotherFinaleEpisode } from "./bigBrotherFinale";
import { rng, roundTwoDigits } from "../../utils";
import { doesHeroWinTheFinale as heroWinsTheFinale } from "../../utils/ai/aiUtils";

function firstImpressions(houseguests: Houseguest[]) {
    for (let i = 0; i < houseguests.length; i++) {
        const iMap = houseguests[i].relationships;
        for (let j = i + 1; j < houseguests.length; j++) {
            // creates a bunch of 100% random mutual relationships
            const jMap = houseguests[j].relationships;
            const impression = rng().randomFloat();
            jMap[i] = impression;
            iMap[j] = impression;
        }
    }
}

function generatePowerRankings(houseguests: Houseguest[]) {
    for (let i = 0; i < houseguests.length; i++) {
        const hero = houseguests[i];
        for (let j = i + 1; j < houseguests.length; j++) {
            const villain = houseguests[j];
            if (heroWinsTheFinale({ hero, villain }, houseguests)) {
                villain.superiors.add(hero.id);
            } else {
                hero.superiors.add(villain.id);
            }
        }
    }
}

function updatePopularity(gameState: GameState) {
    const houseguests = nonEvictedHouseguests(gameState);
    houseguests.forEach(hg => {
        const result = calculatePopularity(hg, nonEvictedHouseguests(gameState));
        hg.deltaPopularity = (roundTwoDigits(result) - roundTwoDigits(hg.popularity)) / 100;
        hg.popularity = result;
    });
}

export class EpisodeFactory {
    public nextEpisode(gameState: GameState, episodeType: EpisodeType): Episode {
        let newState = new MutableGameState(gameState);
        if (gameState.phase === 0) {
            firstImpressions(newState.houseguests);
        }
        // If jury starts this episode, populate superior/inferior data. In the future, every jury ep. (dynamic rels)
        if (inJury(gameState) && getJurors(gameState).length === 0) {
            generatePowerRankings(nonEvictedHouseguests(newState));
        }
        updatePopularity(newState);
        const finalState = new GameState(newState);
        switch (episodeType) {
            case BigBrotherVanilla:
                return new BigBrotherVanillaEpisode(finalState);
            case BigBrotherFinale:
                return new BigBrotherFinaleEpisode(finalState);
            default:
                throw new Error("Unsupported Episode Type");
        }
    }
}
