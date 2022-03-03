import { intersection, isWellDefined } from ".";
import { GameState, getById } from "../model";
import generateGraph from "./generateGraph";
import { difference } from "./utilities";

let cliques: number[][] = [];
export interface Graph {
    nodes: number[];
    neighbors: (v: number) => Set<number>;
}

export function newCliquesLength(a: Cliques): number {
    return a.core.length + (a.affiliates ? a.affiliates[0].length + a.affiliates[1].length : 0);
}

export interface Cliques {
    core: number[];
    affiliates?: [number[], number[]];
}

export function generateCliques(gameState: GameState): Cliques[] {
    const g = generateGraph(gameState);
    cliques = [];
    bronKerbosch(new Set<number>([]), new Set(g.nodes), new Set<number>([]), g);
    cliques.forEach((clique) => clique.map((id) => getById(gameState, id)));
    cliques = cliques.sort((a, b) => b.length - a.length);
    const result: Cliques[] = [];
    // ids of clique i, clique j, & overlap size
    const mergeCandidates: [number, number, Cliques][] = [];
    // generate overlap numbers for each clique (n^2)
    cliques.forEach((clq, i) => {
        const cliqueI = new Set(clq);
        for (let j = i + 1; j < cliques.length; j++) {
            const cliqueJ = new Set(cliques[j]);
            const core = intersection(cliqueI, cliqueJ);
            const affiliatesI: Set<number> = difference(cliqueI, core);
            const affiliatesJ: Set<number> = difference(cliqueJ, core);
            if (core.size > 0) {
                mergeCandidates.push([
                    i,
                    j,
                    {
                        core: Array.from(core),
                        affiliates: [Array.from(affiliatesI), Array.from(affiliatesJ)],
                    },
                ]);
            }
        }
    });
    // cliques that already have been merged get blacklisted
    const blacklist: Set<number> = new Set<number>();

    // merge cliques with highest overlap numbers until only unnacceptable overlap remains
    // for example maybe if the size of both left and right affiliates is greater than the core
    mergeCandidates.sort(
        (a: [number, number, Cliques], b: [number, number, Cliques]) => b[2].core.length - a[2].core.length
    );

    mergeCandidates.forEach((candidate: [number, number, Cliques]) => {
        const i = candidate[0];
        const j = candidate[1];
        if (blacklist.has(i) || blacklist.has(j)) return;
        blacklist.add(i);
        blacklist.add(j);
        result.push(candidate[2]);
    });
    // add non merged cliques
    cliques.forEach((clique, i) => {
        if (blacklist.has(i)) return;
        result.push({ core: clique });
    });

    // then sort and return result
    result.sort((a: Cliques, b: Cliques) => newCliquesLength(b) - newCliquesLength(a));

    return result;
}

function bronKerbosch(r: Set<number>, p: Set<number>, x: Set<number>, g: Graph) {
    if (p.size === 0 && x.size === 0) {
        const values = Array.from(r.values());
        cliques.push(values);
        return;
    }
    Array.from(p.keys()).forEach((v) => {
        const rPrime = new Set(r.values()).add(v);
        const pPrime = new Set([...p].filter((node) => g.neighbors(v).has(node)));
        const xPrime = new Set([...x].filter((node) => g.neighbors(v).has(node)));
        bronKerbosch(rPrime, pPrime, xPrime, g);
        p.delete(v);
        x.add(v);
    });
}
