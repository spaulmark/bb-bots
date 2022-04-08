import React from "react";
import styled from "styled-components";
import { cast$ } from "../../subjects/subjects";
import { Centered } from "../layout/centered";
import { HasText } from "../layout/text";
import { Noselect } from "../playerPortrait/setupPortrait";
import { SeasonEditorList } from "./seasonEditorList";

const Subheader = styled.h3`
    text-align: center;
    color: #fff;
`;

export function SeasonEditorPage(): JSX.Element {
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
                <HasText>
                    <Centered>[Twists go here]</Centered>
                    <Centered>Edit Jury Size</Centered>
                </HasText>
            </div>
        </div>
    );
}
