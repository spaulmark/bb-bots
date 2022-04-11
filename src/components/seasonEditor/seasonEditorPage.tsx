import React, { useState } from "react";
import styled from "styled-components";
import { defaultJurySize, GameState, validateJurySize } from "../../model/gameState";
import { cast$, mainContentStream$, newEpisode } from "../../subjects/subjects";
import { NumericInput } from "../castingScreen/numericInput";
import { PregameEpisode } from "../episode/pregameEpisode";
import { Centered } from "../layout/centered";
import { HasText } from "../layout/text";
import { selectPlayer } from "../playerPortrait/selectedPortrait";
import { Noselect } from "../playerPortrait/setupPortrait";
import { PregameScreen } from "../pregameScreen/pregameScreen";
import { SeasonEditorList } from "./seasonEditorList";

const Subheader = styled.h3`
    text-align: center;
    color: #fff;
`;

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
    const numericInputStyle: any = { marginLeft: "1em" };
    if (!validJurySize) {
        numericInputStyle["border"] = "2px solid #fb8a8a";
        numericInputStyle["borderRadius"] = "3px";
    }
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
            <div className="column">
                <Subheader>Add Twists</Subheader>
                <hr />
                <HasText>
                    <Centered>[Twists go here]</Centered>
                    <Centered style={validJurySize ? {} : { color: "#fb8a8a" }}>
                        Change Jury Size:
                        <NumericInput value={jurySize} onChange={setJurySize} style={numericInputStyle} />
                        <br />
                        <small>{validJurySize ? `(Jury starts at F${parseInt(jurySize) + 2})` : ""}</small>
                    </Centered>
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
