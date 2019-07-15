import { RelationshipMap } from "../../utils";

export interface SelectedPlayerData {
    id: number;
    popularity: number; // TODO:  this is EXTREMELY bad. we are pushing a static object to something that NEEDS TO dynamically change
    relationships: RelationshipMap; // this is bad and i dont know HOW TO FIX IT
    isEvicted: boolean;
    superiors?: Set<number>;
}
