export enum RelationshipType {
    Friend = "FRIEND",
    Queen = "QUEEN",
    Pawn = "PAWN",
    Enemy = "ENEMY"
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
