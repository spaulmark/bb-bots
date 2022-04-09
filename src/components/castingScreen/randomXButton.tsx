import React, { useState } from "react";
import { NumericInput } from "./numericInput";

interface RandomButtonProps {
    random: (n: number) => void;
}

export function RandomButton(props: RandomButtonProps): JSX.Element {
    const [number, setNumber] = useState("16");
    return (
        <div style={{ display: "flex" }}>
            <button
                disabled={number === ""}
                className="button is-primary"
                onClick={() => props.random(parseInt(number))}
            >
                Random
            </button>
            <NumericInput value={number} onChange={setNumber} />
        </div>
    );
}
