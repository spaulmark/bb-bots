import React from "react";
import { GameState, getById } from "../gameState";
import { CenteredItallic, Centered } from "../../components/layout/centered";
import {
    EndgameTableCell,
    WinnerCell,
    RunnerUpCell,
    NomineeCell,
    HohCell,
    SaveCell,
    PoVCell,
    NotEligibleCell,
    PaddedCell,
    HatchedCell,
} from "../../components/votingTable/votingTable";

let voteKey = 0;

function getKey(): string {
    return `${voteKey++}-- vote key`;
}

export interface VoteType {
    id: number;
    render: (state: GameState) => JSX.Element;
}

export class SaveVote implements VoteType {
    id: number;
    text: string = "";
    render = (state: GameState) => (
        <SaveCell key={getKey()}>
            <Centered noMargin={true}>{this.text ? this.text : getById(state, this.id).name}</Centered>
        </SaveCell>
    );
    constructor(id: number, text?: string) {
        this.id = id;
        text !== undefined && (this.text = text);
    }
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

export class BlankVote implements VoteType {
    id: number = 0; // unused
    render = (_: GameState) => (
        <HatchedCell key={getKey()}>
            <Centered noMargin={true} />
        </HatchedCell>
    );
}

export class WinnerVote implements VoteType {
    id: number = 1; // unused
    render = (state: GameState) => (
        <WinnerCell key={"winner---"}>
            <Centered noMargin={true}>Winner</Centered>
        </WinnerCell>
    );
}

export class RunnerUpVote implements VoteType {
    id: number = 1; // unused
    render = (state: GameState) => (
        <RunnerUpCell key={"runnerUp---"}>
            <Centered noMargin={true}>Finalist</Centered>
        </RunnerUpCell>
    );
}

export class NomineeVote implements VoteType {
    id: number = -1;
    evicted: boolean;
    render = (state: GameState) => (
        <NomineeCell key={getKey()}>
            <CenteredItallic noMargin={true}>Nominated</CenteredItallic>
        </NomineeCell>
    );
    constructor(evicted: boolean) {
        this.evicted = evicted;
    }
}

export class PoVvote implements VoteType {
    id: number;
    render = (state: GameState) => {
        return (
            <PoVCell key={getKey()}>
                <CenteredItallic noMargin={true}>{getById(state, this.id).name}</CenteredItallic>
            </PoVCell>
        );
    };
    constructor(id: number) {
        this.id = id;
    }
}

export class GrayVote implements VoteType {
    id: number = -1;
    text: string = "";
    render = (state: GameState) => {
        return (
            <NotEligibleCell key={getKey()}>
                <CenteredItallic noMargin={true}>{this.text} </CenteredItallic>
            </NotEligibleCell>
        );
    };
    constructor(text?: string) {
        this.text = text || "";
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
        return <HohCell key={getKey()}>{this.id === -1 ? this.hohText : this.hohVote(state)}</HohCell>;
    };
    constructor(id?: number) {
        this.id = id === undefined ? -1 : id;
    }
}

export class TeamVote implements VoteType {
    public id: number = -1;
    private color: string;
    render = (_: GameState): JSX.Element => {
        return <EndgameTableCell key={getKey()} style={{ backgroundColor: this.color }} />;
    };
    constructor(color: string) {
        this.color = color;
    }
}

export class EndTeamVote implements VoteType {
    public id: number = -1;
    private color: string;
    render = (_: GameState): JSX.Element => {
        return (
            <PaddedCell key={getKey()} style={{ backgroundColor: this.color }}>
                🏁
            </PaddedCell>
        );
    };
    constructor(color: string) {
        this.color = color;
    }
}
