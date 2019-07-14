import { PlayerProfile } from "./playerProfile";
import { RelationshipMap } from "../utils";

interface HouseguestInit extends PlayerProfile {
    id: number;
    relationships: RelationshipMap;
}

export class Houseguest extends PlayerProfile {
    public isEvicted: boolean = false;
    public isJury: boolean = false;

    readonly id: number = 0;

    public nominations: number = 0;
    public hohWins: number = 0;
    public povWins: number = 0;

    // Popularity ranges from -1 to 1
    public popularity: number = 0;
    public deltaPopularity: number = 0;
    readonly relationships: RelationshipMap = {};
    readonly superiors: Set<number> = new Set<number>();

    public relationshipWith(villain: Houseguest): number {
        return this.relationships[villain.id];
    }

    public getFriendEnemyCount: () => { friends: number; enemies: number } = () => {
        throw new Error(`Failed to get friend / enemy count for houseguest ${this.id} (${this.name})`);
    };

    constructor(init: HouseguestInit) {
        super(init);
        Object.assign(this, init);
    }
}
