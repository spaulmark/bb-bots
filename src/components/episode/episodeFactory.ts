import {
    GameState,
    MutableGameState,
    calculatePopularity,
    nonEvictedHouseguests,
    inJury,
    getJurors,
    getById,
} from "../../model/gameState";
import { Episode, Houseguest } from "../../model";
import { EpisodeType } from "./episodes";
import { BigBrotherVanilla, generateBbVanilla } from "./bigBrotherEpisode";
import { BigBrotherFinale, generateBbFinale } from "./bigBrotherFinale";
import { rng, roundTwoDigits } from "../../utils";
import { pHeroWinsTheFinale } from "../../utils/ai/aiUtils";
import { classifyRelationship, RelationshipType as Relationship } from "../../utils/ai/classifyRelationship";
import { PowerRanking } from "../../model/powerRanking";
import { GameOver, generateGameOver } from "./gameOver";
import { EpisodeLog } from "../../model/logging/episodelog";
import { generateCliques } from "../../utils/graphTest";
import { getRelationshipSummary, Targets } from "../../utils/ai/targets";

export function canDisplayCliques(newState: GameState): boolean {
    return newState.remainingPlayers <= 30;
}

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

function populateSuperiors(houseguests: Houseguest[]) {
    for (let i = 0; i < houseguests.length; i++) {
        const hero = houseguests[i];
        for (let j = i + 1; j < houseguests.length; j++) {
            const villain = houseguests[j];
            if (pHeroWinsTheFinale({ hero, villain }, houseguests) > 0.5) {
                villain.superiors.add(hero.id);
            } else {
                hero.superiors.add(villain.id);
            }
        }
    }
}

function updatePowerRankings(houseguests: Houseguest[]) {
    houseguests.forEach((hg) => {
        hg.powerRanking = new PowerRanking(
            houseguests.length - 1 - hg.superiors.size,
            houseguests.length - 1
        );
    });
}

function updatePopularity(gameState: GameState) {
    const houseguests = nonEvictedHouseguests(gameState);
    houseguests.forEach((hg) => {
        hg.targetingMe = 0;
        const result = calculatePopularity(hg, nonEvictedHouseguests(gameState));
        hg.deltaPopularity = (roundTwoDigits(result) - roundTwoDigits(hg.popularity)) / 100;
        hg.popularity = result;
    });
}

function updateFriendCounts(gameState: GameState) {
    const houseguests = nonEvictedHouseguests(gameState);
    houseguests.forEach((hero: Houseguest) => {
        let targets = new Targets(hero);
        let friends = 0;
        let enemies = 0;
        houseguests.forEach((villain) => {
            if (hero.id === villain.id) return;
            const type = classifyRelationship(
                hero.popularity,
                villain.popularity,
                hero.relationshipWith(villain)
            );
            targets.addTarget(getRelationshipSummary(hero, villain), gameState);
            if (type === Relationship.Friend) {
                friends++;
            } else if (type === Relationship.Enemy) {
                enemies++;
            }
        });
        hero.targets = targets.getTargets();
        getById(gameState, hero.targets[0]).targetingMe++;
        getById(gameState, hero.targets[1]).targetingMe++;
        hero.friends = friends;
        hero.enemies = enemies;
    });
}

export class EpisodeFactory {
    public nextEpisode(gameState: GameState, episodeType: EpisodeType): Episode {
        let newState = new MutableGameState(gameState);
        if (gameState.phase === 0) {
            firstImpressions(newState.houseguests);
        }
        newState.phase++;
        if (gameState.remainingPlayers > 2) {
            newState.log[newState.phase] = new EpisodeLog();
        }
        // If jury starts this episode, populate superior/inferior data. In the future, every jury ep. (dynamic rels)
        if (inJury(gameState) && getJurors(gameState).length === 0) {
            populateSuperiors(nonEvictedHouseguests(newState));
        }
        if (inJury(gameState)) {
            updatePowerRankings(nonEvictedHouseguests(newState));
        }
        updatePopularity(newState);
        gameState.remainingPlayers > 2 && updateFriendCounts(newState);
        if (canDisplayCliques(newState)) newState.cliques = generateCliques(newState);
        const finalState = new GameState(newState);
        switch (episodeType) {
            case BigBrotherVanilla:
                return generateBbVanilla(finalState);
            case BigBrotherFinale:
                return generateBbFinale(finalState);
            case GameOver:
                return generateGameOver(finalState);
            default:
                throw new Error("Unsupported Episode Type");
        }
    }
}
