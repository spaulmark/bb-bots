import React, { useState } from "react";

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

interface NumericInputProps {
    value: string;
    onChange: (newValue: string) => void;
}

function NumericInput(props: NumericInputProps) {
    return (
        <input
            className="input"
            type="text"
            style={{ width: "3em", marginLeft: 5 }}
            value={props.value}
            onChange={(event) => {
                const value = event.target.value;
                if (/^\d*$/g.test(value)) {
                    props.onChange(value);
                }
            }}
        />
    );
}
