import React from "react";
import styled from "styled-components";
import { EpisodeLog } from "../../../model/logging/episodelog";
import { CenteredBold, Centered, CenteredItallic } from "../../layout/centered";
import { GameState, getById } from "../../../model";
import { VoteType, WinnerVote, RunnerUpVote } from "../../../model/logging/voteType";
import { FullscreenButton } from "../../mainPage/fullscreenButton";
import { ColorTheme } from "../../../theme/theme";
import _ from "lodash";

export const EndgameTableCell = styled.td`
    padding: 0.1em 0.4em;
    border: 1px solid ${({ theme }: { theme: ColorTheme }) => theme.tableCellBorder};
`;

const EndgameTable = styled.table`
    border: 1px solid ${({ theme }: { theme: ColorTheme }) => theme.tableCellBorder};
    border-collapse: collapse;
`;

const Gray = styled(EndgameTableCell)`
    background-color: ${({ theme }: { theme: ColorTheme }) => theme.grayCell};
`;

export const SaveCell = styled(EndgameTableCell)`
    background-color: ${({ theme }: { theme: ColorTheme }) => theme.saveCell};
`;

const White = styled(EndgameTableCell)`
    background-color: ${({ theme }: { theme: ColorTheme }) => theme.lightGrayCell};
`;

const Evicted = styled(EndgameTableCell)`
    background-color: ${({ theme }: { theme: ColorTheme }) => theme.evictedCell};
`;

export const WinnerCell = styled(EndgameTableCell)`
    background-color: ${({ theme }: { theme: ColorTheme }) => theme.winnerCell};
`;

export const RunnerUpCell = styled(EndgameTableCell)`
    background-color: ${({ theme }: { theme: ColorTheme }) => theme.runnerUpCell};
`;

export const NomineeCell = styled(EndgameTableCell)`
    background-color: ${({ theme }: { theme: ColorTheme }) => theme.nomineeCell};
`;

export const HohCell = styled(EndgameTableCell)`
    background-color: ${({ theme }: { theme: ColorTheme }) => theme.hohCell};
`;

const BlackRow = styled.tr`
    height: 0.4em;
    background-color: #000000;
`;
let anotherKey = 0;
export function generateVotingTable(gameState: GameState): JSX.Element {
    const masterLog: EpisodeLog[][] = gameState.log;
    const houseguestCells: JSX.Element[][] = [];
    gameState.houseguests.forEach((hg, i) => {
        houseguestCells[hg.id] = [
            <Gray key={`hg-name---${i}`}>
                <CenteredBold noMargin={true}>{hg.name}</CenteredBold>
            </Gray>,
        ];
    });
    const evictionOrder: [number, number][] = [];
    const topRowCells: JSX.Element[] = [];
    const preVetoCells: JSX.Element[] = [];
    const vetoCells: JSX.Element[] = [];
    const postVetoCells: JSX.Element[] = [];
    const evictedCells: JSX.Element[] = [];
    const winnerCells: JSX.Element[] = [];
    masterLog.forEach((logs: EpisodeLog[] | undefined, i) => {
        // multiple entries (ie. a double eviction) will all share the same toprow
        generateTopRow(
            logs ? logs[0] : undefined,
            i,
            topRowCells,
            masterLog.length - 1,
            logs ? logs.length : -1 // -1 doesn't matter because its unread
        );
        const iterateLogs = logs ? logs : [undefined]; // this is incredibly dank
        iterateLogs.forEach((log: EpisodeLog | undefined) => {
            generatePreVetoRow(log, i, preVetoCells);
            generateVetoRow(log, i, vetoCells);
            generatePostVetoRow(log, i, postVetoCells);
            generateEvictedRow(log, i, evictedCells, winnerCells, gameState);
            if (!log) return;
            log.evicted.forEach((evicted) => evictionOrder.push([evicted, i]));

            if (log.runnerUp !== undefined) evictionOrder.push([log.runnerUp, i]);
            if (log.winner !== undefined) evictionOrder.push([log.winner, i]);
            // add each of the votes to the houseguest cells
            for (const [key, value] of Object.entries(log.votes)) {
                // typescript for .. in loops kinda suck so i need to do a sketchy type conversion
                const id: number = key as unknown as number;
                const vote: VoteType = value;
                houseguestCells[id].push(vote.render(gameState));
            }
            if (log.winner !== undefined && log.runnerUp !== undefined) {
                houseguestCells[log.winner].push(new WinnerVote().render(gameState));
                houseguestCells[log.runnerUp].push(new RunnerUpVote().render(gameState));
                evictedCells.push(
                    <RunnerUpCell key={"runnerUp"}>
                        <CenteredBold noMargin={true}>{getById(gameState, log.runnerUp).name}</CenteredBold>
                        <Centered noMargin={true}>
                            <small>Finalist</small>
                        </Centered>
                    </RunnerUpCell>
                );
                winnerCells.push(
                    <WinnerCell key={"winner"}>
                        <CenteredBold noMargin={true}>{getById(gameState, log.winner).name}</CenteredBold>
                        <Centered noMargin={true}>
                            <small>Winner</small>
                        </Centered>
                    </WinnerCell>
                );
            }
        });
    });
    preVetoCells.push(
        <White key={`preveto--finale`} rowSpan={3}>
            <CenteredItallic noMargin={true}>(none)</CenteredItallic>
        </White>
    );
    const winnerRow = <tr>{winnerCells}</tr>;
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
    let desiredLength = -1;
    evictionOrder.reverse().forEach(([id, week], i) => {
        if (i === 0) desiredLength = houseguestCells[id].length;
        if (i > 1) {
            const weekText = i === 2 ? "(Finale)" : `(Week ${week})`;
            const evicted = (
                <Evicted
                    colSpan={desiredLength - houseguestCells[id].length}
                    key={`evicted-week-${weekText}-${i}`}
                >
                    <CenteredItallic noMargin={true}>Evicted</CenteredItallic>
                    <CenteredItallic noMargin={true}>
                        <small>{weekText}</small>
                    </CenteredItallic>
                </Evicted>
            );
            if (!getById(gameState, id).isJury) {
                houseguestCells[id].push(evicted); // not jury, they dead
            } else {
                const tempList = houseguestCells[id].slice(0, -1);
                tempList.push(evicted);
                tempList.push(houseguestCells[id][houseguestCells[id].length - 1]);
                houseguestCells[id] = tempList;
            }
        }
        houseguestRows.push(<tr key={`hgrow--${id}--${anotherKey++}`}>{houseguestCells[id]}</tr>);
    });

    return (
        <div>
            <FullscreenButton />
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
                    {winnerRow}
                </tbody>
            </EndgameTable>
        </div>
    );
}

function generateEvictedRow(
    log: EpisodeLog | undefined,
    i: number,
    cells: JSX.Element[],
    winnerCells: JSX.Element[],
    gameState: GameState
) {
    if (!log) {
        cells.push(
            <Gray key={`evicted${i}--${anotherKey++}`} rowSpan={2}>
                <CenteredBold noMargin={true}>Evicted</CenteredBold>
            </Gray>
        );
        return;
    }
    const saveOrEvict =
        log.soleVoter !== undefined ? "evict" : (log.votingTo && log.votingTo.toLowerCase()) || "evict";

    const rowSpan = log.evicted.length === 1 ? 2 : 1;
    log.evicted.forEach((evicted, i) => {
        const voteTextLine1 =
            log.soleVoter !== undefined
                ? `${log.soleVoter}'s choice`
                : `${
                      log.votingTo === "Save"
                          ? Object.values(log.votes).filter((vote) => vote.id === evicted).length
                          : log.votesInMajority
                  } of ${log.outOf} votes`;

        const content = (
            <Evicted key={`evicted${i}--${anotherKey++}`} rowSpan={rowSpan}>
                <Centered noMargin={true}>
                    <b>{getById(gameState, evicted).name}</b>
                    <br />
                    <small>
                        {voteTextLine1} <br />
                        to {saveOrEvict}
                    </small>
                </Centered>
            </Evicted>
        );
        if (i === 0) cells.push(content);
        else winnerCells.push(content);
    });
}

function generatePostVetoRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[]) {
    if (!log) {
        cells.push(
            <Gray key={`postVeto--${i}-${anotherKey++}`}>
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
        <White key={`preveto--${i}-${anotherKey++}`}>
            <Centered noMargin={true}>
                {interleave(
                    log.nominationsPostVeto as any,
                    (key) => (
                        <br key={`preveto--br--${i}-${key++}`} />
                    ),
                    anotherKey
                )}
            </Centered>
        </White>
    );
}

function generateVetoRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[]) {
    if (!log) {
        cells.push(
            <Gray key={`veto--${i}-${anotherKey++}`}>
                <CenteredBold noMargin={true}>Veto Winner</CenteredBold>
            </Gray>
        );
        return;
    }
    if (log.vetoWinner === undefined) return;

    cells.push(
        <White key={`veto--${i}-${anotherKey++}`}>
            <Centered noMargin={true}>{log.vetoWinner}</Centered>
        </White>
    );
}

// javascript is my passion
function interleave<T>(arr: T[], thing: (key: number) => T, key: number): T[] {
    return ([] as T[]).concat(...arr.map((n: T) => [n, thing(key++)])).slice(0, -1);
}

function generatePreVetoRow(log: EpisodeLog | undefined, i: number, cells: JSX.Element[]) {
    if (!log) {
        cells.push(
            <Gray key={`preveto--${i}-${anotherKey++}`}>
                <CenteredBold noMargin={true}>
                    Nominations
                    <br />
                    <small>(pre-veto)</small>
                </CenteredBold>
            </Gray>
        );
        return;
    }
    if (log.nominationsPreVeto.length === 0 || log.vetoWinner === undefined) {
        cells.push(
            <White key={`preveto--${i}-${anotherKey++}`} rowSpan={2}>
                <CenteredItallic noMargin={true}>(none)</CenteredItallic>
            </White>
        );
        return;
    }
    cells.push(
        <White key={`preveto--${i}-${anotherKey++}`}>
            <Centered noMargin={true}>
                {interleave(
                    log.nominationsPreVeto as any,
                    (key) => (
                        <br key={`preveto--br--${i}-${key++}`} />
                    ),
                    anotherKey
                )}
            </Centered>
        </White>
    );
}

function generateTopRow(
    log: EpisodeLog | undefined,
    i: number,
    cells: JSX.Element[],
    max: number,
    colspan: number
) {
    if (!log) {
        cells.push(<Gray key={`toprow--${i}`} />);
        return;
    }
    if (i === max) {
        cells.push(
            <Gray key={`toprow--${i}`} colSpan={2}>
                <CenteredBold noMargin={true}>Finale</CenteredBold>
            </Gray>
        );
        return;
    }
    cells.push(
        <Gray key={`toprow--${i}`} colSpan={colspan}>
            <CenteredBold noMargin={true}>Week {i}</CenteredBold>
        </Gray>
    );
}
