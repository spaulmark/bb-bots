import { PlayerProfile } from "./playerProfile";
import { RelationshipMap } from "../utils";
import { Tribe } from "./tribe";
import { HitListEntry } from "../utils/ai/hitList";

interface HouseguestInit extends PlayerProfile {
    id: number;
    relationships: RelationshipMap;
}

export class Houseguest extends PlayerProfile {
    public isEvicted: boolean = false;
    public isJury: boolean = false;
    public tribe?: Tribe;
    readonly id: number = 0;

    public nominations: number = 0;
    public hohWins: number = 0;
    public povWins: number = 0;

    // Popularity ranges from -1 to 1
    public compatibility: [number, number, number] = [0, 0, 0];
    public popularity: number = 0;
    public deltaPopularity: number = 0;
    public previousPopularity: number = 0;
    readonly relationships: RelationshipMap = {};

    public hitList: HitListEntry[] = [];

    // power rankings range from 0 to 1
    public powerRanking: number = 0;
    readonly superiors: { [id: number]: number } = {}; // { id : pHeroWins }

    public relationshipWith(villain: Houseguest): number {
        return this.relationships[villain.id];
    }
    public friends = 0;
    public enemies = 0;
    public targetingMe = 0;

    constructor(init: HouseguestInit) {
        super(init);
        Object.assign(this, init);
    }
}
