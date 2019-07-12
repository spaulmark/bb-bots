export class PlayerProfile {
    readonly name: string = "";
    readonly imageURL: string = "";
    constructor(init: PlayerProfile) {
        if (!init) {
            return;
        }
        Object.assign(this, init);
    }
}
