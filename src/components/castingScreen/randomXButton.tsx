import React, { useState } from "react";
import { Tooltip } from "../tooltip/tooltip";
import { NumericInput } from "./numericInput";

interface RandomButtonProps {
    random: (n: number) => void;
}

export function RandomButton(props: RandomButtonProps): JSX.Element {
    const [number, setNumber] = useState("16");
    return (
        <div className="field has-addons" style={{ display: "flex" }}>
            <div className="control">
                <Tooltip text={"Selected cast members will always be chosen."}>
                    <button
                        disabled={number === ""}
                        className="button is-primary"
                        onClick={() => props.random(parseInt(number))}
                    >
                        Random
                    </button>
                </Tooltip>
            </div>
            <div className="control">
                <NumericInput value={number} onChange={setNumber} />
            </div>
        </div>
    );
}
