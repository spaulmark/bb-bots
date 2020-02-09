import React from "react";
import styled from "styled-components";
import { EpisodeLog } from "../../../model/logging/episodelog";
import { CenteredBold, Centered, CenteredItallic } from "../../layout/centered";
import { GameState, getById } from "../../../model";
import { VoteType } from "../../../model/logging/voteType";
import { max } from "../../../utils";

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

const BlackRow = styled.tr`
    height: 0.4em;
    background-color: #000000;
`;

// TODO: add a pseudo fullscreen thing for viewing the voting table

// FIXME: when someone makes it through the whole game without getting a "Head of Household" cell or an "Evicted (week X)" cell
// then thier row is too skinny.

// FIXME: a bug exists where if the runner-up wins final HoH, then his HoH
// doesn't get displayed on the voting table.

// Also he just straight up doesn't appear on the voting table, which is cool.

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
    const evictedCells: JSX.Element[] = [];
    masterLog.forEach((log, i) => {
        generateTopRow(log, i, topRowCells, masterLog.length - 1);
        generatePreVetoRow(log, i, preVetoCells);
        generateVetoRow(log, i, vetoCells);
        generatePostVetoRow(log, i, postVetoCells);
        generateEvictedRow(log, i, evictedCells, gameState);
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
    const blackRow = (
        <BlackRow>
            <td colSpan={gameState.houseguests.length} />
        </BlackRow>
    );
    const houseguestRows: JSX.Element[] = [];
    const evictedRow = <tr>{evictedCells}</tr>;
    let evictionColSpan = -1;
    const weeks = evictionOrder.length;
    evictionOrder.reverse().forEach((id, i) => {
        // TODO: the person who doesn't win final HoH but gets brought to F2
        // needs to have a nominated tag put in their place.
        if (evictionColSpan > 0)
            houseguestCells[id].push(
                <Evicted colSpan={evictionColSpan} key={`evicted-week-${weeks - i}`}>
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
            Yo this table is WIP and kinda goes off the side of the screen but trust me it will be extremely
            cool once i finish it
            <EndgameTable>
                <tbody>
                    {topRow}
                    {preVetoRow}
                    {vetoRow}
                    {postVetoRow}
                    {blackRow}
                    {houseguestRows}
                    {blackRow}
                    {evictedRow}
                </tbody>
            </EndgameTable>
        </div>
    );
}

function generateEvictedRow(
    log: EpisodeLog | undefined,
    i: number,
    cells: JSX.Element[],
    gameState: GameState
) {
    if (!log) {
        cells.push(
            <Gray key={i}>
                <CenteredBold noMargin={true}>Evicted</CenteredBold>
            </Gray>
        );
        return;
    }

    const voteTextLine1 =
        log.soleVoter !== undefined
            ? `${log.soleVoter}'s choice`
            : `${log.votesInMajority} of ${log.outOf} votes`;

    cells.push(
        <Evicted key={i}>
            <Centered noMargin={true}>
                <b>{getById(gameState, log.evicted).name}</b>
                <br />
                <small>
                    {voteTextLine1} <br />
                    to evict
                </small>
            </Centered>
        </Evicted>
    );
}

function generatePostVetoRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[]) {
    if (!log) {
        cells.push(
            <Gray key={`postVeto--${i}`}>
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
        <White key={`postVeto--${i}`}>
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
            <Gray key={`veto--${i}`}>
                <CenteredBold noMargin={true}>Veto Winner</CenteredBold>
            </Gray>
        );
        return;
    }
    if (log.vetoWinner === undefined) return;

    cells.push(
        <White key={`veto--${i}`}>
            <Centered noMargin={true}>{log.vetoWinner}</Centered>
        </White>
    );
}

function generatePreVetoRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[]) {
    if (!log) {
        cells.push(
            <Gray key={`preveto--${i}`}>
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
            <White key={`preveto--${i}`} rowSpan={2}>
                <CenteredItallic noMargin={true}>(none)</CenteredItallic>
            </White>
        );
        return;
    }
    cells.push(
        <White key={`preveto--${i}`}>
            <Centered noMargin={true}>
                {log.nominationsPreVeto[0]}
                <br /> {log.nominationsPreVeto[1]}
            </Centered>
        </White>
    );
}

function generateTopRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[], max: number) {
    if (!log) {
        cells.push(<Gray key={`toprow--${i}`} />);
        return;
    }
    if (i === max) {
        cells.push(
            <Gray key={`toprow--${i}`}>
                <CenteredBold noMargin={true}>Finale</CenteredBold>
            </Gray>
        );
        return;
    }
    cells.push(
        <Gray key={`toprow--${i}`}>
            <CenteredBold noMargin={true}>Week {i}</CenteredBold>
        </Gray>
    );
}
