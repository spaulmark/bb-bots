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
import { angleBetween, average, rng, roundTwoDigits } from "../../utils";
import { pHeroWinsTheFinale } from "../../utils/ai/aiUtils";
import { classifyRelationship, RelationshipType as Relationship } from "../../utils/ai/classifyRelationship";
import { GameOver, generateGameOver } from "./gameOver";
import { EpisodeLog } from "../../model/logging/episodelog";
import { generateCliques } from "../../utils/generateCliques";
import { getRelationshipSummary, Targets } from "../../utils/ai/targets";
import { generateSafetyChain, SafetyChain } from "./safetyChain";
import _ from "lodash";

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

function populateSuperiors(houseguests: Houseguest[]) {
    for (let i = 0; i < houseguests.length; i++) {
        const hero = houseguests[i];
        for (let j = i + 1; j < houseguests.length; j++) {
            const villain = houseguests[j];
            const pHeroWins = pHeroWinsTheFinale({ hero, villain }, houseguests);
            hero.superiors[villain.id] = pHeroWins;
            villain.superiors[hero.id] = 1 - pHeroWins;
        }
    }
}

function updatePowerRankings(houseguests: Houseguest[]) {
    houseguests.forEach((hg) => {
        let superiors: { [id: number]: number } = { ...hg.superiors };
        const nonEvictedHouseguests: Set<number> = new Set<number>(houseguests.map((h) => h.id));
        superiors = _.filter(superiors, (_, id) => nonEvictedHouseguests.has(parseInt(id)));
        hg.powerRanking = average(Object.values(superiors));
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
            if (type === Relationship.Friend) {
                friends++;
            } else if (type === Relationship.Enemy) {
                enemies++;
            }
        });
        hero.friends = friends;
        hero.enemies = enemies;
        houseguests.forEach((villain) => {
            if (hero.id === villain.id) return;
            targets.addTarget(getRelationshipSummary(hero, villain), gameState);
        });
        hero.targets = targets.getTargets();
        hero.targets.forEach((target) => {
            getById(gameState, target).targetingMe++;
        });
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
            case SafetyChain:
                return generateSafetyChain(finalState);
            case GameOver:
                return generateGameOver(finalState);
            default:
                throw new Error("Unsupported Episode Type");
        }
    }
}
