export interface RelationshipMap {
  [id: number]: number;
}

export function newRelationshipMap(
  size: number,
  exclude: number
): RelationshipMap {
  const result: RelationshipMap = {};
  for (let i = 0; i < size; i++) {
    if (i !== exclude) result[i] = 0;
  }
  return result;
}
