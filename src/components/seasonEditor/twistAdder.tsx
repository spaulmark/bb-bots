import React from "react";
import { NumericInputStyle } from "../castingScreen/numericInput";
import { EpisodeType } from "../episode/episodes";
import { Label } from "./seasonEditorPage";

export function TwistAdder(props: { type: EpisodeType }): JSX.Element {
    const [twistCount, setTwistCount] = React.useState(0);
    return (
        <div className="column is-narrow">
            <div className="field has-addons has-addons-centered">
                <p
                    className="field-label is-normal control"
                    style={{ textAlign: "right", marginRight: "1em" }}
                >
                    <Label className="label">{props.type.name}</Label>
                </p>
                <p className="control">
                    <button
                        className="button is-danger"
                        disabled={twistCount === 0}
                        onClick={() => setTwistCount(twistCount - 1)}
                    >
                        -
                    </button>
                </p>
                <p className="control">
                    <NumericInputStyle className="input" readOnly value={`${twistCount}`} />
                </p>
                <p className="control">
                    <button className="button is-success" onClick={() => setTwistCount(twistCount + 1)}>
                        +
                    </button>
                </p>
            </div>
        </div>
    );
}
