export interface Tribe {
    color: string;
    name: string;
}

let tribeId = 0;

export function getNewTribeId() {
    return tribeId++;
}
