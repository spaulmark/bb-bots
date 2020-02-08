import React from "react";

interface TextProps {
    noMargin?: boolean;
    children?: any;
}

export function Centered(props: TextProps): JSX.Element {
    if (props.noMargin) return <div style={{ textAlign: "center" }}>{props.children}</div>;
    return <p style={{ textAlign: "center" }}>{props.children} </p>;
}

export function CenteredBold(props: TextProps): JSX.Element {
    return (
        <Centered>
            <b>{props.children} </b>
        </Centered>
    );
}

export function CenteredItallic(props: TextProps): JSX.Element {
    return (
        <Centered>
            <i>{props.children} </i>
        </Centered>
    );
}
