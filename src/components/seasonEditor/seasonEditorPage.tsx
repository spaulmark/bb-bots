import React, { useState } from "react";
import styled from "styled-components";
import { defaultJurySize, validateJurySize } from "../../model/gameState";
import { cast$ } from "../../subjects/subjects";
import { NumericInput } from "../castingScreen/numericInput";
import { Centered } from "../layout/centered";
import { HasText } from "../layout/text";
import { Noselect } from "../playerPortrait/setupPortrait";
import { SeasonEditorList } from "./seasonEditorList";

const Subheader = styled.h3`
    text-align: center;
    color: #fff;
`;

export function SeasonEditorPage(): JSX.Element {
    const [jurySize, setJurySize] = useState(`${defaultJurySize(cast$.value.length)}`);
    const validJurySize = validateJurySize(parseInt(jurySize), cast$.value.length);
    const numericInputStyle: any = { marginLeft: "1em" };
    if (!validJurySize) {
        numericInputStyle["border"] = "2px solid #fb8a8a";
        numericInputStyle["border-radius"] = "3px";
    }
    return (
        <div className="columns">
            <div className="column is-one-quarter">
                <HasText>
                    <h3 style={{ textAlign: "center" }}>Season Overview</h3>
                </HasText>
                <hr />
                <Noselect>
                    <SeasonEditorList castSize={cast$.value.length} />
                </Noselect>
            </div>
            <div className="column">
                <Subheader>Add Twists</Subheader>
                <hr />
                <HasText style={{ position: "relative" }}>
                    <Centered>[Twists go here]</Centered>
                    <Centered style={validJurySize ? {} : { color: "#fb8a8a" }}>
                        Change Jury Size:
                        <NumericInput value={jurySize} onChange={setJurySize} style={numericInputStyle} />
                    </Centered>
                </HasText>
            </div>
            <div className="column is-narrow" style={{ padding: 40 }}>
                <button
                    className="button is-success"
                    style={{ float: "right" }}
                    onClick={() => {
                        // TODO: inject jurors somehow when setting up
                        // manualOverrideJurors(parseInt(jurySize));
                        // TODO: inject the custom season
                        // TODO: terrifying intial setup stuff
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
