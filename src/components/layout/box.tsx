import React from "react";
import styled from "styled-components";
import { ColorTheme } from "../../theme/theme";

const ShadowBox = styled.div`
    box-shadow: ${({ theme }: { theme: ColorTheme }) =>
        theme.name === "light" ? "0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1)" : ""};
    border-radius: 6px;
    margin-left: 3px;
    margin-right: 3px;
    background: ${({ theme }: { theme: ColorTheme }) => theme.overlay};
`;

const StyledBox = styled.div`
    margin-left: 3px;
    margin-right: 3px;
    margin-bottom: 3px;
    background: ${({ theme }: { theme: ColorTheme }) => theme.bodyArea};
`;

export function DividerBox(props: any): JSX.Element {
    return <ShadowBox className={props.className || ""}>{props.children}</ShadowBox>;
}

export function Box(props: any): JSX.Element {
    return (
        <StyledBox style={props.style} className={`box ${props.className || ""}`}>
            {props.children}
        </StyledBox>
    );
}
