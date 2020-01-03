import React from "react";
import styled from "styled-components";

const ShadowBox = styled.div`
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    border-radius: 6px;
    margin-left: 3px;
    margin-right: 3px;
`;

export function DividerBox(props: any): JSX.Element {
    return <ShadowBox className={props.className}>{props.children}</ShadowBox>;
}
