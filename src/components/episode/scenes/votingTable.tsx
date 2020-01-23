import React from "react";
import styled from "styled-components";
import { EpisodeLog } from "../../../model/logging/episodelog";
import { CenteredBold, Centered, CenteredItallic } from "../../layout/centered";
import { GameState } from "../../../model";

const Gray = styled.td`
    background-color: #eaecf0;
`;

const White = styled.td`
    background-color: #f8f9fa;
`;
// TODO: add a pseudo fullscreen thing for viewing the voting table
export function generateVotingTable(gameState: GameState): JSX.Element {
    const masterLog: EpisodeLog[] = gameState.log;
    const houseguestRows: JSX.Element[] = [];

    gameState.houseguests.forEach((hg, i) => {
        // make a row for them
        houseguestRows[hg.id] = (
            <Gray key={i}>
                <CenteredBold>{hg.name}</CenteredBold>
            </Gray>
        );
    });

    const topRowCells: JSX.Element[] = [];
    const preVetoCells: JSX.Element[] = [];
    const vetoCells: JSX.Element[] = [];
    const postVetoCells: JSX.Element[] = [];
    masterLog.forEach((log, i) => {
        generateTopRow(log, i, topRowCells, masterLog.length - 1);
        generatePreVetoRow(log, i, preVetoCells);
        generateVetoRow(log, i, vetoCells);
        generatePostVetoRow(log, i, postVetoCells);
        // ok so basically we're going to have a list of lists
        // houseguestRows = [0: [vote, vote, X], 1: [vote, X], ... ]
        // then we're going to find all the guys who got evicted and put their last thing as EVICTED
        // the guy who got evicted on finale night is special because his nominated thing needs to be replaced with EVICTED
        // maybe a good idea to do this in the final eviction episode.
    });
    const topRow = <tr>{topRowCells}</tr>;
    const preVetoRow = <tr>{preVetoCells}</tr>;
    const vetoRow = <tr>{vetoCells}</tr>;
    const postVetoRow = <tr>{postVetoCells}</tr>;
    return (
        <div>
            <table>
                <tbody>
                    {topRow}
                    {preVetoRow}
                    {vetoRow}
                    {postVetoRow}
                    {/* Houseguest rows go here. They need to be wrapped by key'd <tr> tags */}
                </tbody>
            </table>
        </div>
    );
}

function generatePostVetoRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[]) {
    if (!log) {
        cells.push(
            <Gray key={i}>
                <CenteredBold>
                    Nominations
                    <br />
                    <small>(post-veto)</small>
                </CenteredBold>
            </Gray>
        );
        return;
    }
    cells.push(
        <White key={i}>
            <Centered>
                {log.nominationsPostVeto[0]}
                <br /> {log.nominationsPostVeto[1]}
            </Centered>
        </White>
    );
}

function generateVetoRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[]) {
    if (!log) {
        cells.push(
            <Gray key={i}>
                <CenteredBold>Veto Winner</CenteredBold>
            </Gray>
        );
        return;
    }
    if (log.vetoWinner === undefined) return;

    cells.push(
        <White key={i}>
            <Centered>{log.vetoWinner}</Centered>
        </White>
    );
}

function generatePreVetoRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[]) {
    if (!log) {
        cells.push(
            <Gray key={i}>
                <CenteredBold>
                    Nominations
                    <br />
                    <small>(pre-veto)</small>
                </CenteredBold>
            </Gray>
        );
        return;
    }
    if (log.nominationsPreVeto.length === 0) {
        cells.push(
            <White key={i} rowSpan={2}>
                <CenteredItallic>(none)</CenteredItallic>
            </White>
        );
        return;
    }
    cells.push(
        <White key={i}>
            <Centered>
                {log.nominationsPreVeto[0]}
                <br /> {log.nominationsPreVeto[1]}
            </Centered>
        </White>
    );
}

function generateTopRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[], max: number) {
    if (!log) {
        cells.push(<Gray key={i} />);
        return;
    }
    if (i === max) {
        cells.push(
            <Gray key={i}>
                <CenteredBold>Finale</CenteredBold>
            </Gray>
        );
        return;
    }
    cells.push(
        <Gray key={i}>
            <CenteredBold>Week {i}</CenteredBold>
        </Gray>
    );
}
