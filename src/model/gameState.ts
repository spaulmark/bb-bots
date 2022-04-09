import { Houseguest } from "./houseguest";
import { PlayerProfile } from "./playerProfile";
import _ from "lodash";
import { newRelationshipMap, rng } from "../utils";
import { getFinalists } from "./season";
import { EpisodeLog } from "./logging/episodelog";
import { Cliques } from "../utils/generateCliques";

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

export function nonEvictedHouseguests(gameState: GameState): Houseguest[] {
    return [...gameState.nonEvictedHouseguests.entries()].map(([_, id]) => getById(gameState, id));
}
export function getJurors(gameState: GameState): Houseguest[] {
    return gameState.houseguests.filter((hg) => hg.isJury);
}

export function inJury(gameState: GameState): Boolean {
    return gameState.remainingPlayers - getFinalists() <= gameState.finalJurySize();
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

export function defaultJurySize(castSize: number): number {
    castSize = Math.round(castSize * 0.55);
    if (castSize % 2 === 0) {
        castSize--;
    }
    return castSize;
}

export function validateJurySize(j: number, castSize: number): boolean {
    return j >= 1 && j % 2 === 1 && castSize - 2 > j;
}

class _GameState {
    private jurors: number = 0;
    readonly houseguests: Houseguest[] = [];

    public finalJurySize() {
        return this.jurors;
    }
    set jurySize(j: number) {
        if (!validateJurySize(j, this.houseguests.length)) {
            return;
        }
        this.jurors = j;
    }
}

export class GameState extends _GameState {
    // State of the game after a phase.

    readonly houseguestCache: { [id: number]: Houseguest } = {};
    readonly nonEvictedHouseguests: Set<number> = new Set<number>();
    readonly remainingPlayers: number = 0;
    readonly phase: number = 0;
    readonly previousHOH?: Houseguest;
    readonly log: EpisodeLog[][] = [];
    readonly cliques: Cliques[] = [];

    public __logindex__: number = 0;
    get currentLog(): EpisodeLog {
        if (!this.log[this.phase]) return new EpisodeLog(); // an unused episode log, kind of like /dev/null
        return this.log[this.phase][this.__logindex__];
    }
    public incrementLogIndex() {
        this.__logindex__++;
        this.log[this.phase].push(new EpisodeLog());
    }
    public resetLogIndex() {
        this.__logindex__ = 0;
    }

    public constructor(init: PlayerProfile[] | GameState) {
        super();
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
                this.nonEvictedHouseguests.add(i);
                this.houseguestCache[i] = hg;
                this.houseguests.push(hg);
            });
        }
        if (!this.finalJurySize()) {
            this.jurySize = defaultJurySize(this.houseguests.length);
        }
    }
}

export class MutableGameState extends _GameState {
    public houseguestCache: { [id: number]: Houseguest } = {};
    readonly nonEvictedHouseguests: Set<number> = new Set<number>();
    public remainingPlayers: number = 0;
    public phase: number = 0;
    public previousHOH?: Houseguest;
    public cliques: Cliques[] = [];
    public log: EpisodeLog[][] = [];

    public __logindex__: number = 0;
    get currentLog(): EpisodeLog {
        if (!this.log[this.phase]) return new EpisodeLog();
        return this.log[this.phase][this.__logindex__];
    }
    public incrementLogIndex() {
        this.__logindex__++;
        this.log[this.phase].push(new EpisodeLog());
    }
    public resetLogIndex() {
        this.__logindex__ = 0;
    }

    public constructor(init: GameState | MutableGameState) {
        super();
        const copy = _.cloneDeep(init);
        Object.assign(this, copy);
    }
}
