import { intersection } from ".";
import { GameState, getById } from "../model";
import generateGraph from "./generateGraph";
import { difference } from "./utilities";

let cliques: number[][] = [];
export interface Graph {
    nodes: number[];
    neighbors: (v: number) => Set<number>;
}

export interface Cliques {
    core: number[];
    affiliates: number[];
}

export function generateCliques(gameState: GameState): Cliques[] {
    const g = generateGraph(gameState);
    cliques = [];
    bronKerbosch(new Set<number>([]), new Set(g.nodes), new Set<number>([]), g);
    cliques.forEach((clique) => clique.map((id) => getById(gameState, id)));
    cliques = cliques
        .filter((clique) => {
            // let result: boolean = false;
            // if (clique.length <= 2) {
            //     const newClique = new Set<number>(clique);
            //     // true iff there is a new player
            //     result = new Set([...newClique].filter((x) => !seenPlayers.has(x))).size > 0;
            // } else {
            //     result = true;
            // }
            // if (result) {
            //     seenPlayers = new Set<number>([...seenPlayers, ...allPlayers]);
            // }
            return true;
        })
        .sort((a, b) => b.length - a.length);
    // merge cliques that have a difference of only one person
    const result: Cliques[] = [];
    const blacklist: Set<number> = new Set<number>();
    cliques.forEach((clq, i) => {
        if (blacklist.has(i)) return;
        if (clq.length === 1) {
            result.push({ core: clq, affiliates: [] });
            return;
        }
        const cliqueI = new Set(clq);
        let cliquePushed: boolean = false;
        for (let j = i + 1; j < cliques.length && cliques[j].length === clq.length; j++) {
            const cliqueJ = new Set(cliques[j]);
            const core: Set<number> = intersection(cliqueI, cliqueJ);
            if (core.size === cliqueI.size - 1) {
                const affiliates: number[] = Array.from(difference(cliqueJ, core));
                // TODO: make it so that it choses strategically who to include as the in/out groups
                // ie. it chooses between clique I and clique J, whoever is closer to the core.
                result.push({ core: clq, affiliates });
                cliquePushed = true;
                blacklist.add(j);
            }
        }
        if (!cliquePushed) {
            result.push({ core: clq, affiliates: [] });
        }
    });
    // Merge duplicate alliances together
    result.forEach((clq, i) => {
        for (let j = i + 1; j < result.length; j++) {
            if (i === j) return;
            if (JSON.stringify(clq.core) === JSON.stringify(result[j].core)) {
                result[j].affiliates = result[j].affiliates.concat(clq.affiliates);
                result.splice(i, 1);
                j--;
            }
        }
    });
    // sort result (again...)
    result.sort((a, b) => b.affiliates.length + b.core.length - (a.affiliates.length + a.core.length));
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
