import React from "react";
import styled from "styled-components";

interface NumericInputProps {
    value: string;
    onChange: (newValue: string) => void;
    style?: any;
    className?: string;
    placeholder?: string;
}

export const NumericInputStyle = styled.input`
    width: 3em;
    marginleft: 5px;
`;

export function NumericInput(props: NumericInputProps) {
    const style = props.style || {};
    return (
        <NumericInputStyle
            type="text"
            className={`input${props.className ? ` ${props.className}` : ""}`}
            style={style}
            value={props.value}
            placeholder={props.placeholder || ""}
            onChange={(event) => {
                const value = event.target.value;
                if (/^\d*$/g.test(value)) {
                    props.onChange(value);
                }
            }}
        />
    );
}
