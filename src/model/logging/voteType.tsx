import React from "react";

export interface VoteType {
    text: string;
    render: () => JSX.Element;
}

export class NormalVote implements VoteType {
    text: string;
    render = () => <td>{this.text}</td>;
    constructor(text: string) {
        this.text = text;
    }
}

export class NomineeVote implements VoteType {
    text: string;
    render = () => (
        <td style={{ backgroundColor: "#959FFD" }}>
            <i>{this.text}</i>
        </td>
    );
    constructor() {
        this.text = "Nominated";
    }
}
export class HoHVote implements VoteType {
    text: string = "This value is unused";
    renderedText: JSX.Element;
    render = () => <td style={{ backgroundColor: "#CCFFCC" }}>{this.renderedText}</td>;
    constructor(text?: string) {
        this.renderedText = text ? <p>text</p> : <i>Head of Household</i>;
    }
}

// Winner: #73FB76

// Runner-up: #D1E8EF

// Evicted: #FA8072

// Border: #D9D9D9
