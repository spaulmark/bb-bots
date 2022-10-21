import React, { useState } from "react";
import styled from "styled-components";
import { defaultJurySize, GameState, validateJurySize } from "../../model/gameState";
import { cast$, getCast, newEpisode, pushToMainContentStream, season$ } from "../../subjects/subjects";
import { NumericInput } from "../castingScreen/numericInput";
import { BattleOfTheBlock } from "../episode/botbEpisode";
import { BoomerangVetoEpisode } from "../episode/boomerangVetoEpisode";
import { CoHoH } from "../episode/coHoHEpisode";
import { DiamondVetoEpisode } from "../episode/diamondVetoEpisode";
import { DoubleEviction } from "../episode/doubleEvictionEpisode";
import { EpisodeType } from "../episode/episodes";
import { ForcedVetoEpisode } from "../episode/forcedVetoEpisode";
import { InstantEviction } from "../episode/instantEvictionEpisode";
import { NoVeto } from "../episode/noVetoEpisode";
import { PregameEpisode } from "../episode/pregameEpisode";
import { TripleEvictionCad } from "../episode/tripleEvictionEpisodeCad";
import { HasText } from "../layout/text";
import { selectPlayer } from "../playerPortrait/selectedPortrait";
import { Noselect } from "../playerPortrait/setupPortrait";
import { PregameScreen } from "../pregameScreen/pregameScreen";
import { Screens } from "../topbar/topBar";
import { SeasonEditorList, _items } from "./seasonEditorList";
import { getEpisodeLibrary } from "./getEpisodeLibrary";
import { TwistAdder } from "./twistAdder";
import { SafetyChain } from "../episode/safetyChain";
import { getTeamsListContents, TeamsAdderList } from "./teamsAdderList";
import { Tribe } from "../../model/tribe";

const Subheader = styled.h3`
    text-align: center;
    color: #fff;
`;

export const Label = styled.label`
    color: #fff;
`;

const twists: EpisodeType[] = [
    DoubleEviction,
    TripleEvictionCad,
    SafetyChain,
    InstantEviction,
    NoVeto,
    DiamondVetoEpisode,
    ForcedVetoEpisode,
    BoomerangVetoEpisode,
    CoHoH,
    BattleOfTheBlock,
];

let lastJurySize = defaultJurySize(16);

export function getLastJurySize(): number {
    return lastJurySize;
}

function getInitialTribes(): Tribe[] {
    const items = _items;
    const teamListContents = getTeamsListContents();

    let tribes: Tribe[] = [];
    for (const item of items) {
        // if item is a tribe start episode, add it to most recent tribe episode //
        if (item.episode.teamsLookupId !== undefined) {
            // it is a tribe episode //
            tribes = Object.values(teamListContents[item.episode.teamsLookupId!].Teams);
        } else {
            // if the non-teams episode is NOT pseudo, we must break //
            if (!item.episode.pseudo) {
                break;
            }
        }
    }
    return tribes;
}

const submit = async (jury: number): Promise<void> => {
    lastJurySize = jury;

    const initialTribes = getInitialTribes();
    const cast = cast$.getValue();
    cast$.next({ ...cast, options: { initialTribes } });

    season$.next(getEpisodeLibrary());

    // reset stuff and start a new game
    pushToMainContentStream(<PregameScreen cast={getCast()} />, Screens.Ingame);
    selectPlayer(null);
    // vscode says the awaits are unnessecary here,
    // but if you remove them then bad things happen
    await newEpisode(null);
    await newEpisode(new PregameEpisode(new GameState({ players: getCast(), jury })));
};

export function SeasonEditorPage(): JSX.Element {
    const castLength = getCast().length;
    const [jurySize, setJurySize] = useState(`${defaultJurySize(castLength)}`);
    const validJurySize = validateJurySize(parseInt(jurySize), castLength);
    const [areTwistsValid, setTwistsValid] = useState(true);
    return (
        <div className="columns">
            <div className="column is-one-quarter">
                <HasText>
                    <h3 style={{ textAlign: "center" }}>Season Overview</h3>
                </HasText>
                <hr />
                <Noselect>
                    <SeasonEditorList setTwistsValid={setTwistsValid} castSize={castLength} />
                </Noselect>
            </div>
            <div className="column" style={{ padding: 20 }}>
                <Subheader>Add Twists</Subheader>
                <div className="columns is-multiline is-centered">
                    {twists.map((type) => (
                        <TwistAdder type={type} key={`${type.name}${type.emoji}`} />
                    ))}
                    <div
                        className="column is-4"
                        style={{
                            border: "1px solid #808080",
                            borderRadius: "4px",
                            backgroundColor: "#444346",
                            margin: "10px",
                        }}
                    >
                        <HasText className="field is-horizontal centered">
                            <div className="field-label is-normal">
                                <Label className="label" style={validJurySize ? {} : { color: "#fb8a8a" }}>
                                    Jury Size:
                                </Label>
                            </div>
                            <div className="field-body">
                                <div className="field">
                                    <div className="control">
                                        <NumericInput
                                            className={validJurySize ? undefined : "is-danger"}
                                            value={jurySize}
                                            onChange={setJurySize}
                                            placeholder={`${defaultJurySize(castLength)}`}
                                        />
                                    </div>
                                    <p className="help" style={validJurySize ? {} : { color: "#fb8a8a" }}>
                                        {validJurySize
                                            ? `(Jury starts at F${parseInt(jurySize) + 2})`
                                            : `Jury must be an odd number < ${castLength - 2}`}
                                    </p>
                                </div>
                            </div>
                        </HasText>
                    </div>
                </div>
                <Subheader>🎌 Add Teams</Subheader>
                <TeamsAdderList />
            </div>
            <div className="column is-narrow" style={{ paddingTop: 20, paddingRight: 20 }}>
                <button
                    className="button is-success"
                    style={{ float: "right" }}
                    onClick={() => {
                        submit(parseInt(jurySize));
                    }}
                    disabled={!validJurySize || !areTwistsValid}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
