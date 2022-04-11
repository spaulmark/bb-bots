import React, { useState } from "react";
import styled from "styled-components";
import { defaultJurySize, GameState, validateJurySize } from "../../model/gameState";
import { cast$, mainContentStream$, newEpisode } from "../../subjects/subjects";
import { NumericInput, NumericInputStyle } from "../castingScreen/numericInput";
import { DoubleEviction } from "../episode/doubleEvictionEpisode";
import { EpisodeType } from "../episode/episodes";
import { PregameEpisode } from "../episode/pregameEpisode";
import { HasText } from "../layout/text";
import { selectPlayer } from "../playerPortrait/selectedPortrait";
import { Noselect } from "../playerPortrait/setupPortrait";
import { PregameScreen } from "../pregameScreen/pregameScreen";
import { SeasonEditorList } from "./seasonEditorList";
import { TwistAdder } from "./twistAdder";

const Subheader = styled.h3`
    text-align: center;
    color: #fff;
`;

export const Label = styled.label`
    color: #fff;
`;

const twists: EpisodeType[] = [DoubleEviction];

const submit = async (jury: number): Promise<void> => {
    // TODO: generate episode library and pass it to the sidebar via a subject

    // reset stuff and start a new game
    mainContentStream$.next(<PregameScreen cast={cast$.value} />);
    selectPlayer(null);
    // vscode says the awaits are unnessecary here,
    // but if you remove them then bad things happen
    await newEpisode(null);
    await newEpisode(new PregameEpisode(new GameState({ players: cast$.value, jury })));
};

export function SeasonEditorPage(): JSX.Element {
    const castLength = cast$.value.length;
    const [jurySize, setJurySize] = useState(`${defaultJurySize(castLength)}`);
    const validJurySize = validateJurySize(parseInt(jurySize), castLength);
    const [doubleEvictions, setDEs] = useState(0);
    return (
        <div className="columns">
            <div className="column is-one-quarter">
                <HasText>
                    <h3 style={{ textAlign: "center" }}>Season Overview</h3>
                </HasText>
                <hr />
                <Noselect>
                    <SeasonEditorList castSize={castLength} />
                </Noselect>
            </div>
            <div className="column" style={{ padding: 20 }}>
                <Subheader>Add Twists</Subheader>
                <hr />
                <div className="columns is-multiline is-centered">
                    {twists.map((type) => (
                        <TwistAdder type={type} key={type.name} />
                    ))}
                </div>
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
            <div className="column is-narrow" style={{ padding: 40 }}>
                <button
                    className="button is-success"
                    style={{ float: "right" }}
                    onClick={() => {
                        submit(parseInt(jurySize));
                    }}
                    disabled={!validJurySize}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
