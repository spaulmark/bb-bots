import { Houseguest } from "./houseguest";
import { PlayerProfile } from "./playerProfile";
import _ from "lodash";
import { newRelationshipMap, rng } from "../utils";
import { finalJurySize, getFinalists } from "./season";

// TODO: might want to make houseguests a dictionary. {id: houseguest}
export function getById(gameState: GameState, id: number): Houseguest {
    const result = gameState.houseguests.find(hg => hg.id === id);
    if (!result) {
        throw new Error(`Failed to find houseguest with id ${id}`);
    }
    return result;
}

export function exclude(inclusions: Houseguest[], exclusions: Houseguest[]) {
    const excludedIds = exclusions.map(hg => hg.id);
    return inclusions.filter(hg => !excludedIds.includes(hg.id) && !hg.isEvicted);
}

export function randomPlayer(inclusions: Houseguest[], exclusions: Houseguest[] = []): Houseguest {
    if (inclusions.length === 0) {
        throw new Error("Tried to get a random player from a list of 0 players.");
    }
    const options = exclude(inclusions, exclusions);
    const choice = rng().randomInt(0, options.length - 1);

    return options[choice];
}

export function nonEvictedHouseguests(gameState: GameState) {
    return gameState.houseguests.filter(hg => !hg.isEvicted);
}
export function getJurors(gameState: GameState) {
    return gameState.houseguests.filter(hg => hg.isJury);
}

export function inJury(gameState: GameState): Boolean {
    return gameState.remainingPlayers - getFinalists() <= finalJurySize();
}

export function calculatePopularity(hero: Houseguest, house: Houseguest[]) {
    let sum = 0;
    let count = 0;
    const targetId = hero.id;
    house.forEach(houseguest => {
        if (houseguest.id !== targetId) {
            count++;
            sum += houseguest.relationships[targetId];
        }
    });
    return count === 0 ? 0 : sum / count;
}

export class GameState {
    // Current state of the game after a phase.

    readonly houseguests: Houseguest[] = [];
    readonly remainingPlayers: number = 0;
    readonly phase: number = 0;
    readonly previousHOH?: Houseguest;

    public constructor(init: PlayerProfile[] | GameState) {
        if (!(init instanceof Array)) {
            Object.assign(this, init);
        } else {
            const profiles = init as PlayerProfile[];
            this.remainingPlayers = profiles.length;
            let id = -1;
            profiles.forEach(profile => {
                this.houseguests.push(
                    new Houseguest({
                        ...profile,
                        id: ++id,
                        relationships: newRelationshipMap(profiles.length, id)
                    })
                );
            });
        }
    }
}

export class MutableGameState {
    public houseguests: Houseguest[] = [];
    public remainingPlayers: number = 0;
    public phase: number = 0;
    public previousHOH?: Houseguest;

    public constructor(init: GameState | MutableGameState) {
        const copy = _.cloneDeep(init);
        Object.assign(this, copy);
    }
}
