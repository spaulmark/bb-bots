export class PlayerProfile {
    readonly name: string = "";
    readonly imageURL: string = "";
    readonly evictedImageURL: string = "BW";
    constructor(init: PlayerProfile) {
        if (!init) {
            return;
        }
        Object.assign(this, init);
    }
}
