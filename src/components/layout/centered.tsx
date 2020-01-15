import React from "react";

export function Centered(props: any): JSX.Element {
    return <p style={{ textAlign: "center" }}>{props.children} </p>;
}

export function CenteredBold(props: any): JSX.Element {
    return (
        <Centered>
            <b>{props.children} </b>
        </Centered>
    );
}
