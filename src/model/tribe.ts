export interface Tribe {
    color: string;
    name: string;
    tribeId: number;
}

let tribeId = 0;

export function getTribe(name: string, color: string): Tribe {
    return {
        color: color,
        name: name,
        tribeId: tribeId++,
    };
}
