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

const submit = async (): Promise<void> => {
    mainContentStream$.next(<PregameScreen cast={cast$.value} />);
    selectPlayer(null);
    // vscode says the awaits are unnessecary here,
    await newEpisode(null);
    // but if you remove them then bad things happen
    await newEpisode(new PregameEpisode(new GameState(cast$.value)));
};

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
                        submit();
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
