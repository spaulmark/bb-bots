import { Houseguest } from "../model";
import { rng } from "./BbRandomGenerator";

export function castEvictionVote(
  hero: Houseguest,
  nominees: Houseguest[]
): number {
  // Cast a random vote and return the index of the eviction target.
  return rng().randomInt(0, nominees.length - 1);
}
