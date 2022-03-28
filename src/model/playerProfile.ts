interface InitPlayerProfile {
    readonly name: string;
    readonly imageURL: string;
}

export class PlayerProfile {
    public name: string = "";
    readonly imageURL: string = "";
    public castingScreenId?: number | undefined = 0;
    constructor(init: InitPlayerProfile) {
        if (!init) {
            return;
        }
        Object.assign(this, init);
    }
}
