import React, { useState } from "react";
import styled from "styled-components";
import { finalJurySize, validateJurySize } from "../../model/season";
import { cast$ } from "../../subjects/subjects";
import { NumericInput } from "../castingScreen/numericInput";
import { Centered } from "../layout/centered";
import { HasText } from "../layout/text";
import { Noselect } from "../playerPortrait/setupPortrait";
import { Tooltip } from "../tooltip/tooltip";
import { SeasonEditorList } from "./seasonEditorList";

const Subheader = styled.h3`
    text-align: center;
    color: #fff;
`;

export function SeasonEditorPage(): JSX.Element {
    const [jurySize, setJurySize] = useState(finalJurySize().toString());
    const validJurySize = validateJurySize(parseInt(jurySize));
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
                <HasText>
                    <Centered>[Twists go here]</Centered>
                    <Centered style={validJurySize ? {} : { color: "#fb8a8a" }}>
                        Change Jury Size:
                        <NumericInput
                            value={jurySize}
                            onChange={setJurySize}
                            style={
                                validJurySize
                                    ? { marginLeft: "1em" }
                                    : {
                                          marginLeft: "1em",
                                          border: "2px solid #fb8a8a",
                                          borderRadius: "3px",
                                      }
                            }
                        />
                    </Centered>
                </HasText>
            </div>
            <div className="column is-narrow" style={{ padding: 40 }}>
                <button className="button is-success" style={{ float: "right" }} onClick={() => {}}>
                    Submit
                </button>
            </div>
        </div>
    );
}
