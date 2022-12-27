import { GameState, MutableGameState, nonEvictedHouseguests } from "../../model/gameState";
import { Episode, Houseguest } from "../../model";
import { EpisodeType, Split } from "./episodes";
import { angleBetween, rng } from "../../utils";
import { EpisodeLog } from "../../model/logging/episodelog";
import { generateCliques } from "../../utils/generateCliques";
import { refreshHgStats } from "./utilities/evictHouseguest";
import { cast$ } from "../../subjects/subjects";
import { RelationshipType, classifyRelationshipHgs } from "../../utils/ai/classifyRelationship";
import { computeEnemyCentrality, computeNonfriendCentrality } from "../../utils/ai/targets";

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

export function nextEpisode(oldState: GameState, episodeType: EpisodeType): Episode {
    let newState = new MutableGameState(oldState);
    if (oldState.phase === 0) {
        firstImpressions(newState.houseguests);
        if (cast$.value.options?.currentTribes) {
            const tribes = cast$.value.options.currentTribes;
            newState.houseguests.forEach((hg) => {
                hg.tribe = tribes[hg.id];
            });
        }
    }
    !episodeType.pseudo && newState.phase++;
    !episodeType.pseudo && newState.resetLogIndex();
    if (oldState.remainingPlayers > 2 && !episodeType.pseudo) {
        newState.log[newState.phase] = [new EpisodeLog()];
    }
    !episodeType.pseudo && (newState.currentLog.weekEmoji = episodeType.emoji || "");
    const split: Split[] = episodeType.splitFunction ? episodeType.splitFunction(newState) : [];
    newState.split = split;
    refreshHgStats(newState, split, true);
    nonEvictedHouseguests(newState).forEach((hg) => {
        hg.previousPopularity = hg.popularity;
    });
    newState.cliques = generateCliques(newState);
    const finalState = new GameState(newState);
    nonEvictedHouseguests(finalState).forEach((hg) => {
        console.log(hg.name, generateHitList(hg, finalState));
    });
    if (!episodeType.canPlayWith(finalState.remainingPlayers))
        throw new Error(
            `Episode type ${episodeType.name} not playable with ${finalState.remainingPlayers} players`
        );
    return episodeType.generate(finalState);
}

// TODO: move tihs somewhere else

function generateHitList(hero: Houseguest, gameState: GameState) {
    const list: [number, number, string][] = [];
    const s = (a: any, b: any) => a[1] - b[1];

    // now do High / MoR
    if (hero.friends === hero.enemies) return generateHitList_high_MoR(list, hero, gameState).sort(s);
    if (hero.friends < hero.enemies) return generateHitList_high_underdog(list, hero, gameState).sort(s);
    return generateHitList_high_statusquo(list, hero, gameState).sort(s);
}

function generateHitList_high_underdog(
    hitList: [number, number, string][],
    hero: Houseguest,
    gameState: GameState
) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        if (classifyRelationshipHgs(hero, villian) !== RelationshipType.Friend) {
            pushEnemyCentrailty(hitList, villian, hero, gameState, computeNonfriendCentrality);
        } else {
            pushRelationship(hitList, villian, hero);
        }
    }
    return hitList;
}

// enemies are sorted by centrailty, non-enemies are normal
function generateHitList_high_MoR(
    hitList: [number, number, string][],
    hero: Houseguest,
    gameState: GameState
) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        if (classifyRelationshipHgs(hero, villian) === RelationshipType.Enemy) {
            pushEnemyCentrailty(hitList, villian, hero, gameState, computeEnemyCentrality);
        } else {
            pushRelationship(hitList, villian, hero);
        }
    }
    return hitList;
}

function generateHitList_high_statusquo(
    hitList: [number, number, string][],
    hero: Houseguest,
    gameState: GameState
) {
    for (const villian of nonEvictedHouseguests(gameState)) {
        if (hero.id === villian.id) continue;
        pushRelationship(hitList, villian, hero);
    }
    return hitList;
}

function pushEnemyCentrailty(
    hitList: [number, number, string][],
    villian: Houseguest,
    hero: Houseguest,
    gameState: GameState,
    compareFcn: (gameState: GameState, hero: Houseguest, villian: Houseguest) => number
) {
    const enemyCap = hero.popularity;
    // we flip it to make it negative, since its something we as hero dislike
    const centrailty = -compareFcn(gameState, hero, villian);
    // do a linear transform on centrailty to have it be from -1 to enemyCap instead of from -1 to 1 /
    const centrailtyTransformed = linear_transform(centrailty, -1, 1, -1, enemyCap);
    hitList.push([villian.id, centrailtyTransformed, villian.name]);
}

function linear_transform(
    x: number,
    input_start: number,
    input_end: number,
    output_start: number,
    output_end: number
) {
    return ((x - input_start) / (input_end - input_start)) * (output_end - output_start) + output_start;
}

function pushRelationship(hitList: [number, number, string][], villian: Houseguest, hero: Houseguest) {
    hitList.push([villian.id, hero.relationshipWith(villian), villian.name]);
}
