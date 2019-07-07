import { GameState, getById } from "../model";
import generateGraph from "./generateGraph";

let result: number[][] = [];
export interface Graph {
    nodes: number[];
    neighbors: (v: number) => Set<number>;
}

export function generateCliques(gameState: GameState): number[][] {
    const g = generateGraph(gameState);
    result = [];
    bronKerbosch(new Set<number>([]), new Set(g.nodes), new Set<number>([]), g);
    result.forEach(clique => clique.map(id => getById(gameState, id)));
    return result;
}

function bronKerbosch(r: Set<number>, p: Set<number>, x: Set<number>, g: Graph) {
    if (p.size === 0 && x.size === 0) {
        const values = Array.from(r.values());
        result.push(values);
        return;
    }
    Array.from(p.keys()).forEach(v => {
        const rPrime = new Set(r.values()).add(v);
        const pPrime = new Set([...p].filter(node => g.neighbors(v).has(node)));
        const xPrime = new Set([...x].filter(node => g.neighbors(v).has(node)));
        bronKerbosch(rPrime, pPrime, xPrime, g);
        p.delete(v);
        x.add(v);
    });
}
