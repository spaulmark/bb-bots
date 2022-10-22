import { Houseguest, GameState, nonEvictedHouseguests, getById } from "../model";

import { classifyRelationship, RelationshipType } from "./ai/classifyRelationship";

import _ from "lodash";
import { Graph } from "./generateCliques";

class EdgeMap {
    public data: { [id: number]: Set<number> } = {};
    public add(key: number, value: number) {
        if (!this.data[key]) {
            this.data[key] = new Set<number>([value]);
        } else {
            this.data[key].add(value);
        }
    }
}

function generateEdge(
    hero: Houseguest,
    villain: Houseguest,
    relationship: number
): [number[] | null, number] {
    const relationshipType = classifyRelationship(hero.popularity, villain.popularity, relationship);
    if (relationshipType === RelationshipType.Friend) {
        return [[hero.id, villain.id], 1];
    }
    // no edge for non-mutual friends
    return [null, 0];
}

export default function generateGraph(gameState: GameState): Graph {
    // this algorithm assumes every relationship is mutual,
    // and will need a face lift if we get non-mutual relationships.
    const players = nonEvictedHouseguests(gameState);
    const nodes: number[] = [];
    const edges: EdgeMap = new EdgeMap();
    players.forEach((player) => {
        _.forEach(player.relationships, (relationship, stringId) => {
            const villainId = parseInt(stringId);
            const edge = generateEdge(player, getById(gameState, villainId), relationship)[0];
            if (villainId > player.id) {
                if (edge) {
                    edges.add(player.id, villainId);
                    edges.add(villainId, player.id);
                }
            }
        });
        // nodes[player.id] = friendCount; // for pivot later on, thats why friendcount is there unused
        nodes.push(player.id);
    });
    return { nodes, neighbors: (v: number) => edges.data[v] || new Set([]) };
}
