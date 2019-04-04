export interface RelationshipMap {
  [id: number]: number;
}

export function newRelationshipMap(size: number): RelationshipMap {
  let id = 0;
  const result: RelationshipMap = {};
  for (let i = 0; i < size; i++) {
    result[i] = 0;
  }
  return result;
}
