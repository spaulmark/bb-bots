import React from "react";
import styled from "styled-components";
import { EpisodeLog } from "../../../model/logging/episodelog";
import { CenteredBold, Centered, CenteredItallic } from "../../layout/centered";
import { GameState } from "../../../model";
import { VoteType } from "../../../model/logging/voteType";

export const EndgameTableCell = styled.td`
    padding: 0.2em 0.4em;
    border: 1px solid #a2a9b1;
`;

const EndgameTable = styled.table`
    border: 1px solid #a2a9b1;
    border-collapse: collapse;
`;

const Gray = styled(EndgameTableCell)`
    background-color: #eaecf0;
`;

const White = styled(EndgameTableCell)`
    background-color: #f8f9fa;
`;

const Evicted = styled(EndgameTableCell)`
    background-color: #fa8072;
`;

// TODO: add a pseudo fullscreen thing for viewing the voting table

// FIXME: a bug exists where if the runner-up wins final HoH, then his HoH
// doesn't get displayed on the voting table.
export function generateVotingTable(gameState: GameState): JSX.Element {
    const masterLog: EpisodeLog[] = gameState.log;
    const houseguestCells: JSX.Element[][] = [];
    gameState.houseguests.forEach((hg, i) => {
        houseguestCells[hg.id] = [
            <Gray key={`hg-name---${i}`}>
                <CenteredBold noMargin={true}>{hg.name}</CenteredBold>
            </Gray>
        ];
    });

    const evictionOrder: number[] = [];
    const topRowCells: JSX.Element[] = [];
    const preVetoCells: JSX.Element[] = [];
    const vetoCells: JSX.Element[] = [];
    const postVetoCells: JSX.Element[] = [];
    masterLog.forEach((log, i) => {
        generateTopRow(log, i, topRowCells, masterLog.length - 1);
        generatePreVetoRow(log, i, preVetoCells);
        generateVetoRow(log, i, vetoCells);
        generatePostVetoRow(log, i, postVetoCells);
        if (!log) return;
        evictionOrder.push(log.evicted);
        if (log.runnerUp) evictionOrder.push(log.runnerUp);
        if (log.winner) evictionOrder.push(log.winner);
        // add each of the votes to the houseguest cells
        for (const [key, value] of Object.entries(log.votes)) {
            // typescript for .. in loops kinda suck so i need to do a sketchy type conversion
            const id: number = (key as unknown) as number;
            const vote: VoteType = value;
            houseguestCells[id].push(vote.render(gameState));
        }
    });
    const topRow = <tr>{topRowCells}</tr>;
    const preVetoRow = <tr>{preVetoCells}</tr>;
    const vetoRow = <tr>{vetoCells}</tr>;
    const postVetoRow = <tr>{postVetoCells}</tr>;
    const houseguestRows: JSX.Element[] = [];
    let evictionColSpan = -1;
    const weeks = evictionOrder.length;
    evictionOrder.reverse().forEach((id, i) => {
        // TODO: the person who doesn't win final HoH but gets brought to F2
        // needs to have a nominated tag put in their place.
        if (evictionColSpan > 0)
            houseguestCells[id].push(
                <Evicted colSpan={evictionColSpan}>
                    <CenteredItallic noMargin={true}>Evicted</CenteredItallic>
                    <CenteredItallic noMargin={true}>
                        <small>(Week {weeks - i})</small>
                    </CenteredItallic>
                </Evicted>
            );
        houseguestRows.push(<tr key={`hgrow--${id}`}>{houseguestCells[id]}</tr>);
        evictionColSpan++;
    });

    return (
        <div>
            Yo this table is WIP and kinda goes off the side of the screen but trust me it will be cool once i
            finish it
            <EndgameTable>
                <tbody>
                    {topRow}
                    {preVetoRow}
                    {vetoRow}
                    {postVetoRow}
                    {houseguestRows}
                </tbody>
            </EndgameTable>
        </div>
    );
}

function generatePostVetoRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[]) {
    if (!log) {
        cells.push(
            <Gray key={i}>
                <CenteredBold noMargin={true}>
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
            <Centered noMargin={true}>
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
                <CenteredBold noMargin={true}>Veto Winner</CenteredBold>
            </Gray>
        );
        return;
    }
    if (log.vetoWinner === undefined) return;

    cells.push(
        <White key={i}>
            <Centered noMargin={true}>{log.vetoWinner}</Centered>
        </White>
    );
}

function generatePreVetoRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[]) {
    if (!log) {
        cells.push(
            <Gray key={i}>
                <CenteredBold noMargin={true}>
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
                <CenteredItallic noMargin={true}>(none)</CenteredItallic>
            </White>
        );
        return;
    }
    cells.push(
        <White key={i}>
            <Centered noMargin={true}>
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
                <CenteredBold noMargin={true}>Finale</CenteredBold>
            </Gray>
        );
        return;
    }
    cells.push(
        <Gray key={i}>
            <CenteredBold noMargin={true}>Week {i}</CenteredBold>
        </Gray>
    );
}
