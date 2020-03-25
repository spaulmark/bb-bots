import React from "react";
import { GameState, getById } from "../gameState";
import { CenteredItallic, Centered } from "../../components/layout/centered";
import { EndgameTableCell, WinnerCell, RunnerUpCell } from "../../components/episode/scenes/votingTable";

let voteKey = 0;

function getKey(): string {
    return `${voteKey++}-- vote key`;
}

export interface VoteType {
    id: number;
    render: (state: GameState) => JSX.Element;
}

export class NormalVote implements VoteType {
    id: number;
    render = (state: GameState) => (
        <EndgameTableCell key={getKey()}>
            <Centered noMargin={true}>{getById(state, this.id).name}</Centered>
        </EndgameTableCell>
    );
    constructor(id: number) {
        this.id = id;
    }
}

export class WinnerVote implements VoteType {
    id: number = 1; // unused
    render = (state: GameState) => (
        <WinnerCell>
            <Centered noMargin={true}>Winner</Centered>
        </WinnerCell>
    );
}

export class RunnerUpVote implements VoteType {
    id: number = 1; // unused
    render = (state: GameState) => (
        <RunnerUpCell>
            <Centered noMargin={true}>Finalist</Centered>
        </RunnerUpCell>
    );
}

export class NomineeVote implements VoteType {
    id: number = -1;
    evicted: boolean;
    render = (state: GameState) => (
        <EndgameTableCell key={getKey()} style={{ backgroundColor: "#959FFD" }}>
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
            <EndgameTableCell key={getKey()} style={{ backgroundColor: "#CCFFCC" }}>
                {this.id == -1 ? this.hohText : this.hohVote(state)}
            </EndgameTableCell>
        );
    };
    constructor(id?: number) {
        this.id = id === undefined ? -1 : id;
    }
}
