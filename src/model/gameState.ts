import { Houseguest } from "./houseguest";
import { PlayerProfile } from "./playerProfile";
import _ from "lodash";
import { newRelationshipMap, rng } from "../utils";
import { finalJurySize, getFinalists } from "./season";
import { EpisodeLog } from "./logging/episodelog";

export function getById(gameState: GameState, id: number): Houseguest {
    return gameState.houseguestCache[id];
}

export function exclude(inclusions: Houseguest[], exclusions: Houseguest[]) {
    const excludedIds = exclusions.map((hg) => hg.id);
    return inclusions.filter((hg) => !excludedIds.includes(hg.id) && !hg.isEvicted);
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
    return gameState.houseguests.filter((hg) => !hg.isEvicted);
}
export function getJurors(gameState: GameState): Houseguest[] {
    return gameState.houseguests.filter((hg) => hg.isJury);
}

export function inJury(gameState: GameState): Boolean {
    return gameState.remainingPlayers - getFinalists() <= finalJurySize();
}

export function calculatePopularity(hero: Houseguest, house: Houseguest[]) {
    let sum = 0;
    let count = 0;
    const targetId = hero.id;
    house.forEach((houseguest) => {
        if (houseguest.id !== targetId) {
            count++;
            sum += houseguest.relationships[targetId];
        }
    });
    return count === 0 ? 0 : sum / count;
}

export class GameState {
    // Current state of the game after a phase.

    readonly houseguestCache: { [id: number]: Houseguest } = {};
    readonly houseguests: Houseguest[] = [];
    readonly remainingPlayers: number = 0;
    readonly phase: number = 0;
    readonly previousHOH?: Houseguest;
    readonly log: EpisodeLog[] = [];
    readonly cliques: number[][] = [];
    get currentLog() {
        return this.log[this.phase];
    }

    public constructor(init: PlayerProfile[] | GameState) {
        if (!(init instanceof Array)) {
            Object.assign(this, init);
        } else {
            const profiles = init as PlayerProfile[];
            this.remainingPlayers = profiles.length;
            profiles.forEach((profile, i) => {
                const hg: Houseguest = new Houseguest({
                    ...profile,
                    id: i,
                    relationships: newRelationshipMap(profiles.length, i),
                });
                this.houseguestCache[i] = hg;
                this.houseguests.push(hg);
            });
        }
    }
}

export class MutableGameState {
    public houseguests: Houseguest[] = [];
    public houseguestCache: { [id: number]: Houseguest } = {};
    public remainingPlayers: number = 0;
    public phase: number = 0;
    public previousHOH?: Houseguest;
    public cliques: number[][] = [];
    public log: EpisodeLog[] = [];
    get currentLog() {
        return this.log[this.phase];
    }

    public constructor(init: GameState | MutableGameState) {
        const copy = _.cloneDeep(init);
        Object.assign(this, copy);
    }
}
