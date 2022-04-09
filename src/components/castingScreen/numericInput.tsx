import React from "react";
import styled from "styled-components";

interface NumericInputProps {
    value: string;
    onChange: (newValue: string) => void;
    style?: any;
}

const NumericInputStyled = styled.input`
    width: 3em;
    marginleft: 5px;
`;

export function NumericInput(props: NumericInputProps) {
    const style = props.style || {};
    return (
        <NumericInputStyled
            type="text"
            className="input"
            style={style}
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
