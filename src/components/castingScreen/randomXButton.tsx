import React, { useState } from "react";
import { NumericInput } from "./numericInput";

interface RandomButtonProps {
    random: (n: number) => void;
}

export function RandomButton(props: RandomButtonProps): JSX.Element {
    const [number, setNumber] = useState("16");
    return (
        <div className="field has-addons" style={{ display: "flex" }}>
            <div className="control">
                <button
                    disabled={number === ""}
                    className="button is-primary"
                    onClick={() => props.random(parseInt(number))}
                >
                    Random
                </button>
            </div>
            <div className="control">
                <NumericInput value={number} onChange={setNumber} />
            </div>
        </div>
    );
}
