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
    render = (state: GameState) => (
        <td style={{ backgroundColor: "#959FFD" }}>
            <i>Nominated</i>
        </td>
    );
}

export class HoHVote implements VoteType {
    id: number;
    render = (state: GameState) => {
        if (this.id == -1) {
            return (
                <td style={{ backgroundColor: "#CCFFCC" }}>
                    <i>Head of Household</i>
                </td>
            );
        } else {
            return (
                <td style={{ backgroundColor: "#CCFFCC" }}>
                    <i>{getById(state, this.id).name}</i>
                </td>
            );
        }
    };
    constructor(id?: number) {
        this.id = id === undefined ? -1 : id;
    }
}

// Winner: #73FB76

// Runner-up: #D1E8EF

// Evicted: #FA8072

// Border: #D9D9D9
