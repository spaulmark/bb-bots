import React from "react";
import { GameState, getById } from "../gameState";

export interface VoteType {
    id: number;
    color: string;
}

export class NormalVote implements VoteType {
    id: number;
    color = "";
    constructor(id: number) {
        this.id = id;
    }
}

export class NomineeVote implements VoteType {
    id: number = -1;
    color = "#959FFD";
    constructor(id: number) {
        this.id = id;
    }
}

export class HoHVote implements VoteType {
    id: number;
    color: string = "#CCFFCC";
    constructor(id?: number) {
        this.id = id ? id : -1;
    }
}

// Winner: #73FB76

// Runner-up: #D1E8EF

// Evicted: #FA8072

// Border: #D9D9D9
