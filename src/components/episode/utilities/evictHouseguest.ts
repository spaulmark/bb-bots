import _ from "lodash";
import {
    Houseguest,
    GameState,
    nonEvictedHouseguests,
    calculatePopularity,
    getById,
    getJurors,
    inJury,
    MutableGameState,
    getNonevictedSplitMembers,
} from "../../../model";
import { getFinalists } from "../../../model/season";
import { average, roundTwoDigits } from "../../../utils";
import { pHeroWinsTheFinale } from "../../../utils/ai/aiUtils";
import { classifyRelationship, RelationshipType } from "../../../utils/ai/classifyRelationship";
import { generateHitList } from "../../../utils/ai/hitList";
import { generateCliques } from "../../../utils/generateCliques";

export function evictHouseguest(gameState: MutableGameState, id: number): GameState {
    const evictee = getById(gameState, id);
    if (gameState.currentLog) gameState.currentLog.evicted.push(evictee.id);
    evictee.isEvicted = true;
    if (gameState.remainingPlayers - getFinalists() <= gameState.finalJurySize()) {
        evictee.isJury = true;
    }
    gameState.nonEvictedHouseguests.delete(evictee.id);
    gameState.remainingPlayers--;
    refreshHgStats(gameState, gameState.split);
    return gameState;
}

export function refreshHgStats(
    gameState: MutableGameState,
    split: { members: Set<number> }[],
    updateDelta: boolean = false
) {
    // second condition looks weird, but getting rid of it breaks things.
    if (inJury(gameState) && getJurors(gameState).length === 0) {
        populateSuperiors(nonEvictedHouseguests(gameState));
    }
    if (inJury(gameState)) {
        updatePowerRankings(nonEvictedHouseguests(gameState));
    }
    const splits =
        split.length > 0
            ? split
            : [{ members: new Set<number>(nonEvictedHouseguests(gameState).map((hg) => hg.id)) }];
    splits.forEach((split) => {
        const hgs = getNonevictedSplitMembers(split, gameState);
        updatePopularity(hgs, updateDelta);
        updateFriendCounts(hgs, gameState);
    });
    gameState.cliques = generateCliques(gameState);
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

function updatePopularity(houseguests: Houseguest[], updateDelta: boolean = false) {
    houseguests.forEach((hg) => {
        hg.targetingMe = 0;
        const result = calculatePopularity(hg, houseguests);
        if (updateDelta)
            hg.deltaPopularity = (roundTwoDigits(result) - roundTwoDigits(hg.previousPopularity)) / 100;
        hg.popularity = result;
    });
}

function updateFriendCounts(houseguests: Houseguest[], gameState: GameState) {
    houseguests.forEach((hero: Houseguest) => {
        let friends = 0;
        let enemies = 0;
        houseguests.forEach((villain) => {
            if (hero.id === villain.id) return;
            const type = classifyRelationship(
                hero.popularity,
                villain.popularity,
                hero.relationshipWith(villain)
            );
            if (type === RelationshipType.Friend) {
                friends++;
            } else if (type === RelationshipType.Enemy) {
                enemies++;
            }
        });
        hero.friends = friends;
        hero.enemies = enemies;
        const hitList = generateHitList(hero, gameState);
        hero.hitList = hitList;
        const hgSet = new Set(houseguests.map((hg) => hg.id));
        const hitListbySplit = hero.hitList.filter((entry) => hgSet.has(entry.id));
        const targets = [];
        hitListbySplit[0] && targets.push(hitListbySplit[0].id);
        hitListbySplit[1] && targets.push(hitListbySplit[1].id);
        targets.forEach((target) => {
            getById(gameState, target).targetingMe++;
        });
    });
}
