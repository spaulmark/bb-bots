import React from "react";
import { HasText } from "../layout/text";
import { Noselect } from "../playerPortrait/setupPortrait";
import { SeasonEditorList } from "./seasonEditorList";

export function SeasonEditorPage(): JSX.Element {
    return (
        <div className="columns">
            <Noselect className="column is-one-quarter">
                <SeasonEditorList castSize={16} />
            </Noselect>
            <div className="column">
                <HasText>SeasonEditorList</HasText>
            </div>
        </div>
    );
}
