import { intersection, isWellDefined } from ".";
import { GameState, getById } from "../model";
import generateGraph from "./generateGraph";
import { difference } from "./utilities";

let cliques: number[][] = [];
export interface Graph {
    nodes: number[];
    neighbors: (v: number) => Set<number>;
}

// TODO: we want core [] then affiliates [[], []].

export interface Cliques {
    core: number[];
    affiliates: number[];
}

export function newCliquesLength(a: NewCliques): number {
    return a.core.length + (a.affiliates ? a.affiliates[0].length + a.affiliates[1].length : 0);
}

interface NewCliques {
    core: number[];
    affiliates?: [number[], number[]];
}

function newGenerateCliques(gameState: GameState): NewCliques[] {
    const g = generateGraph(gameState);
    cliques = [];
    bronKerbosch(new Set<number>([]), new Set(g.nodes), new Set<number>([]), g);
    cliques.forEach((clique) => clique.map((id) => getById(gameState, id)));
    cliques = cliques.sort((a, b) => b.length - a.length);
    // merge cliques that are similar *enough*
    // i think you do this by merging cliques with the most overlap [until when?]
    const result: NewCliques[] = [];
    // clique i, clique j, overlap size
    const mergeCandidates: [number, number, NewCliques][] = [];
    // generate overlap numbers for each clique (n^2)
    // if the overlap is significant enough, add it to the merge queue
    cliques.forEach((clq, i) => {
        const cliqueI = new Set(clq);
        // TODO: an optimization is possible to kill this for loop early.
        // when the coreSize large enough condition will be impossible.
        for (let j = i + 1; j < cliques.length; j++) {
            const cliqueJ = new Set(cliques[j]);
            const core = intersection(cliqueI, cliqueJ);
            const affiliatesI: Set<number> = difference(cliqueI, core);
            const affiliatesJ: Set<number> = difference(cliqueJ, core);
            // if coreSize is high enough, push to a list of cliques that could be merged
            if (core.size >= affiliatesI.size + affiliatesJ.size) {
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
        (a: [number, number, NewCliques], b: [number, number, NewCliques]) =>
            b[2].core.length - a[2].core.length
    );

    mergeCandidates.forEach((candidate: [number, number, NewCliques]) => {
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
    result.sort((a: NewCliques, b: NewCliques) => newCliquesLength(b) - newCliquesLength(a));

    // render with → and ←
    // ie. [affiliatesL] → [core] ← [affiliatesR]

    return result;
}

export function generateCliques(gameState: GameState): Cliques[] {
    const g = generateGraph(gameState);
    cliques = [];
    bronKerbosch(new Set<number>([]), new Set(g.nodes), new Set<number>([]), g);
    cliques.forEach((clique) => clique.map((id) => getById(gameState, id)));
    cliques = cliques.sort((a, b) => b.length - a.length);
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
    // sort cliques within the clique themselves
    result.forEach((clique) => {
        let clique_popularity: { [id: number]: number } = {};
        clique.core.sort((a, b) => {
            const popularity_a = isWellDefined(clique_popularity[a])
                ? clique_popularity[a]
                : _calculatePopularity(a, clique.core.concat(clique.affiliates), gameState);
            clique_popularity[a] = popularity_a;
            //
            const popularity_b = isWellDefined(clique_popularity[b])
                ? clique_popularity[b]
                : _calculatePopularity(b, clique.core.concat(clique.affiliates), gameState);
            clique_popularity[b] = popularity_b;
            return b - a;
        });
        clique_popularity = {};
    });
    return result;
}

function _calculatePopularity(hero: number, clique: number[], gameState: GameState) {
    let sum = 0;
    let count = 0;
    clique.forEach((houseguest) => {
        if (houseguest !== hero) {
            count++;
            sum += getById(gameState, hero).relationships[hero];
        }
    });
    return count === 0 ? 0 : sum / count;
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
