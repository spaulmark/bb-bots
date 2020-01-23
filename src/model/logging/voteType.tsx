import React from "react";
import { GameState, getById } from "../gameState";

export interface VoteType {
    id: number;
    render: (state: GameState) => JSX.Element;
}

export class NormalVote implements VoteType {
    id: number;
    render = (state: GameState) => <td>{getById(state, this.id).name}</td>;
    constructor(id: number) {
        this.id = id;
    }
}

export class NomineeVote implements VoteType {
    id: number = -1;
    evicted: boolean;
    render = (state: GameState) => (
        <td style={{ backgroundColor: "#959FFD" }}>
            <i>Nominated</i>
        </td>
    );
    constructor(evicted: boolean) {
        this.evicted = evicted;
    }
}

export class HoHVote implements VoteType {
    id: number;
    render = (state: GameState) => {
        return (
            <td style={{ backgroundColor: "#CCFFCC" }}>
                <i>{this.id == -1 ? "Head of Household" : getById(state, this.id).name}</i>
            </td>
        );
    };
    constructor(id?: number) {
        this.id = id === undefined ? -1 : id;
    }
}

export class EvictedVote implements VoteType {
    id: number;
    render = (state: GameState) => {
        return (
            <td style={{ backgroundColor: "#FA8072" }}>
                Evicted
                <br />
                <small>Week {this.id}</small>
            </td>
        );
    };
    constructor(week: number) {
        this.id = week;
    }
}

// Winner: #73FB76

// Runner-up: #D1E8EF

// Border: #D9D9D9
