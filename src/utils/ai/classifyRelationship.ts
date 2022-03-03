export enum RelationshipType {
    Friend = "FRIEND",
    Queen = "QUEEN",
    Pawn = "PAWN",
    Enemy = "ENEMY",
}
export enum TwoWayRelationshipType {
    Friend = "FRIEND",
    PawnQueen = "PAWN/QUEEN",
    Enemy = "ENEMY",
}

export const RelationshipTypeToSymbol = { FRIEND: "♥", ENEMY: "💔", PAWN: "PAWN", QUEEN: "QUEEN" };

export function classifyRelationship(
    heroPopularity: number,
    villainPopularity: number,
    relationship: number
): RelationshipType {
    const benefitsHero = relationship > heroPopularity;
    const benefitsVillain = relationship > villainPopularity;
    if (benefitsHero && benefitsVillain) {
        return RelationshipType.Friend;
    } else if (benefitsHero && !benefitsVillain) {
        return RelationshipType.Pawn;
    } else if (!benefitsHero && benefitsVillain) {
        return RelationshipType.Queen;
    }
    return RelationshipType.Enemy;
}

export function classifyTwoWayRelationship(
    heroPopularity: number,
    villainPopularity: number,
    relationship: number
): TwoWayRelationshipType {
    const benefitsHero = relationship > heroPopularity;
    const benefitsVillain = relationship > villainPopularity;
    if (benefitsHero && benefitsVillain) {
        return TwoWayRelationshipType.Friend;
    } else if (!benefitsHero && !benefitsVillain) {
        return TwoWayRelationshipType.Enemy;
    }
    return TwoWayRelationshipType.PawnQueen;
}
