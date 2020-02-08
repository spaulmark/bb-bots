import React from "react";
import { GameState, getById } from "../gameState";
import { CenteredItallic, Centered } from "../../components/layout/centered";
import { EndgameTableCell } from "../../components/episode/scenes/votingTable";

// TODO: VOTE TYPES NEED KEYS

export interface VoteType {
    id: number;
    render: (state: GameState) => JSX.Element;
}

// TODO: the margins used on the p is causing serious problems. we must remedy this.

export class NormalVote implements VoteType {
    id: number;
    render = (state: GameState) => (
        <EndgameTableCell>
            <Centered noMargin={true}>{getById(state, this.id).name}</Centered>
        </EndgameTableCell>
    );
    constructor(id: number) {
        this.id = id;
    }
}

export class NomineeVote implements VoteType {
    id: number = -1;
    evicted: boolean;
    render = (state: GameState) => (
        <EndgameTableCell style={{ backgroundColor: "#959FFD" }}>
            <CenteredItallic noMargin={true}>Nominated</CenteredItallic>
        </EndgameTableCell>
    );
    constructor(evicted: boolean) {
        this.evicted = evicted;
    }
}

export class HoHVote implements VoteType {
    id: number;

    get hohText(): JSX.Element {
        return (
            <CenteredItallic noMargin={true}>
                Head of
                <br />
                Household
            </CenteredItallic>
        );
    }

    private hohVote(state: GameState): JSX.Element {
        return <CenteredItallic noMargin={true}>{getById(state, this.id).name}</CenteredItallic>;
    }

    render = (state: GameState) => {
        return (
            <EndgameTableCell style={{ backgroundColor: "#CCFFCC" }}>
                {this.id == -1 ? this.hohText : this.hohVote(state)}
            </EndgameTableCell>
        );
    };
    constructor(id?: number) {
        this.id = id === undefined ? -1 : id;
    }
}

// Winner: #73FB76

// Runner-up: #D1E8EF

// Border: #D9D9D9
