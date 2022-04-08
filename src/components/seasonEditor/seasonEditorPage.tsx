import React from "react";
import { cast$ } from "../../subjects/subjects";
import { HasText } from "../layout/text";
import { Noselect } from "../playerPortrait/setupPortrait";
import { SeasonEditorList } from "./seasonEditorList";

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
                <HasText>[2] double evictions</HasText>
                <HasText>Custom jury size goes here</HasText>
            </div>
        </div>
    );
}
