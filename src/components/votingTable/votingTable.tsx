import React from "react";
import styled from "styled-components";
import { EpisodeLog } from "../../model/logging/episodelog";
import { CenteredBold, Centered, CenteredItallic } from "../layout/centered";
import { GameState, getById } from "../../model";
import { VoteType, WinnerVote, RunnerUpVote } from "../../model/logging/voteType";
import { FullscreenButton } from "../mainPage/fullscreenButton";
import { ColorTheme } from "../../theme/theme";
import _ from "lodash";

export const PaddedCell = styled.td`
    padding: 0.1em 0.4em;
`;

export const EndgameTableCell = styled(PaddedCell)`
    border: 1px solid ${({ theme }: { theme: ColorTheme }) => theme.tableCellBorder};
`;

const EndgameTable = styled.table`
    border: 1px solid ${({ theme }: { theme: ColorTheme }) => theme.tableCellBorder};
    border-collapse: collapse;
`;

const GrayCell = styled(EndgameTableCell)`
    background-color: ${({ theme }: { theme: ColorTheme }) => theme.grayCell};
`;

export const SaveCell = styled(EndgameTableCell)`
    background-color: ${({ theme }: { theme: ColorTheme }) => theme.saveCell};
`;

export const NotEligibleCell = styled(EndgameTableCell)`
    background-color: #7d7d7d;
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
export const PoVCell = styled(EndgameTableCell)`
    background-color: #78773f;
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
            <GrayCell key={`hg-name---${i}`}>
                <CenteredBold noMargin={true}>{hg.name}</CenteredBold>
            </GrayCell>,
        ];
    });
    const evictionOrder: [number, number][] = [];
    const topRowCells: JSX.Element[] = [];
    const preVetoCells: JSX.Element[] = [];
    const vetoCells: JSX.Element[] = [];
    const postVetoCells: JSX.Element[] = [];
    const evictedCells: JSX.Element[] = [];
    const winnerCells: JSX.Element[] = [];
    masterLog.forEach((logs: EpisodeLog[] | undefined, week) => {
        // multiple entries (ie. a double eviction) will all share the same toprow
        generateTopRow(
            logs ? logs[0] : undefined,
            week,
            topRowCells,
            masterLog.length - 1,
            logs ? logs.length : -1 // -1 doesn't matter because its unread
        );
        const iterateLogs = logs ? logs : [undefined]; // this is incredibly dank
        let pseudoCount = 0;
        iterateLogs.forEach((log: EpisodeLog | undefined) => {
            // either no log (table headers) or a nonpseudo log
            if (!log || !log.pseudo) {
                generatePreVetoRow(log, week, preVetoCells, pseudoCount);
                generateVetoRow(log, week, vetoCells, pseudoCount);
                generatePostVetoRow(log, week, postVetoCells, pseudoCount);
                generateEvictedRow(log, week, evictedCells, winnerCells, gameState, pseudoCount);
            }
            if (!log) return;
            log.evicted.forEach((evicted) => evictionOrder.push([evicted, week]));

            if (log.runnerUp !== undefined) evictionOrder.push([log.runnerUp, week]);
            if (log.winner !== undefined) evictionOrder.push([log.winner, week]);
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
            if (log.pseudo) {
                pseudoCount++;
            } else {
                pseudoCount = 0;
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
    // hey if it works it works
    const blackRow = (
        <BlackRow>
            <td colSpan={Number.MAX_SAFE_INTEGER} />
        </BlackRow>
    );
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
    week: number,
    cells: JSX.Element[],
    winnerCells: JSX.Element[],
    gameState: GameState,
    pseudoCount: number
) {
    if (!log) {
        cells.push(
            <GrayCell key={`evicted${week}--${anotherKey++}`} rowSpan={2}>
                <CenteredBold noMargin={true}>Evicted</CenteredBold>
            </GrayCell>
        );
        return;
    }
    if (log.pseudo) return; // no evicted row for a pseudoepisode

    const saveOrEvict =
        log.soleVoter !== undefined ? "evict" : (log.votingTo && log.votingTo.toLowerCase()) || "evict";

    const colspan = 1 + pseudoCount;
    // for stuff like safety chain
    if (log.customEvicted.length > 0) {
        const names = log.customEvicted.map((hg) => [
            <b key={`ev-name-${anotherKey++}`}>{getById(gameState, hg).name}</b>,
            <br key={`ev-name-${anotherKey++}`} />,
        ]);

        const content = (
            <NotEligibleCell key={`evicted${week}--${anotherKey++}`} rowSpan={2} colSpan={colspan}>
                <Centered noMargin={true}>
                    {names}
                    <small>{log.customEvictedText}</small>
                </Centered>
            </NotEligibleCell>
        );
        cells.push(content);

        return;
    }

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
            <Evicted key={`evicted${i}--${anotherKey++}`} rowSpan={rowSpan} colSpan={colspan}>
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

function generatePostVetoRow(
    log: EpisodeLog | undefined,
    week: number,
    cells: JSX.Element[],
    pseudoCount: number
) {
    const colspan = 1 + pseudoCount;
    if (!log) {
        cells.push(
            <GrayCell key={`postVeto--${week}-${anotherKey++}`} colSpan={colspan}>
                <CenteredBold noMargin={true}>
                    Nominations
                    <br />
                    <small>(post-veto)</small>
                </CenteredBold>
            </GrayCell>
        );
        return;
    }
    if (log.nominationsPostVeto.length === 0) return;
    cells.push(
        <White key={`preveto--${week}-${anotherKey++}`} colSpan={colspan}>
            <Centered noMargin={true}>
                {interleave(
                    log.nominationsPostVeto as any,
                    (key) => (
                        <br key={`preveto--br--${week}-${key++}`} />
                    ),
                    anotherKey
                )}
            </Centered>
        </White>
    );
}

function generateVetoRow(
    log: EpisodeLog | undefined,
    week: number,
    cells: JSX.Element[],
    pseudoCount: number
) {
    const colspan = 1 + pseudoCount;

    if (!log) {
        cells.push(
            <GrayCell key={`veto--${week}-${anotherKey++}`} colSpan={colspan}>
                <CenteredBold noMargin={true}>Veto Winner</CenteredBold>
            </GrayCell>
        );
        return;
    }
    if (log.vetoWinner === undefined) return;

    cells.push(
        <White key={`veto--${week}-${anotherKey++}`} colSpan={colspan}>
            <Centered noMargin={true}>
                {log.vetoWinner} {log.vetoEmoji || ""}
            </Centered>
        </White>
    );
}

// javascript is my passion
function interleave<T>(arr: T[], thing: (key: number) => T, key: number): T[] {
    return ([] as T[]).concat(...arr.map((n: T) => [n, thing(key++)])).slice(0, -1);
}

function generatePreVetoRow(
    log: EpisodeLog | undefined,
    week: number,
    cells: JSX.Element[],
    pseudoCount: number
) {
    if (!log) {
        cells.push(
            <GrayCell key={`preveto--${week}-${anotherKey++}`}>
                <CenteredBold noMargin={true}>
                    Nominations
                    <br />
                    <small>(pre-veto)</small>
                </CenteredBold>
            </GrayCell>
        );
        return;
    }
    const noNomsPreVeto = log.nominationsPreVeto.length === 0;
    const noVetoWinner = log.vetoWinner === undefined;
    const noNomsPostveto = log.nominationsPostVeto.length === 0;
    const colspan = 1 + pseudoCount;

    if (noNomsPreVeto && noVetoWinner && noNomsPostveto) {
        cells.push(
            <White key={`preveto--${week}-${anotherKey++}`} rowSpan={3} colSpan={colspan}>
                <CenteredItallic noMargin={true}>(none)</CenteredItallic>
            </White>
        );
        return;
    }
    if (noNomsPreVeto || noVetoWinner) {
        cells.push(
            <White key={`preveto--${week}-${anotherKey++}`} rowSpan={2} colSpan={colspan}>
                <CenteredItallic noMargin={true}>(none)</CenteredItallic>
            </White>
        );
        return;
    }
    cells.push(
        <White key={`preveto--${week}-${anotherKey++}`} colSpan={colspan}>
            <Centered noMargin={true}>
                {interleave(
                    [
                        ...log.nominationsPreVeto,
                        ...log.strikethroughNominees.map((txt) => <del>{txt}</del>),
                    ] as any,
                    (key) => (
                        <br key={`preveto--br--${week}-${key++}`} />
                    ),
                    anotherKey
                )}
            </Centered>
        </White>
    );
}

function generateTopRow(
    log: EpisodeLog | undefined,
    week: number,
    cells: JSX.Element[],
    max: number,
    colspan: number
) {
    if (!log) {
        cells.push(<GrayCell key={`toprow--${week}`} />);
        return;
    }
    if (week === max) {
        cells.push(
            <GrayCell key={`toprow--${week}`} colSpan={2}>
                <CenteredBold noMargin={true}>Finale</CenteredBold>
            </GrayCell>
        );
        return;
    }
    cells.push(
        <GrayCell key={`toprow--${week}`} colSpan={colspan}>
            <CenteredBold noMargin={true}>Week {week}</CenteredBold>
        </GrayCell>
    );
}
