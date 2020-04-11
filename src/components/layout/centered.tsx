import React from "react";
import styled from "styled-components";
import { ColorTheme } from "../../theme/theme";

interface TextProps {
    noMargin?: boolean;
    children?: any;
}

const NoMargin = styled.div`
    text-align: center;
    color: ${({ theme }: { theme: ColorTheme }) => theme.text};
`;
const Center = styled.p`
    text-align: center;
    color: ${({ theme }: { theme: ColorTheme }) => theme.text};
`;

export function Centered(props: TextProps): JSX.Element {
    if (props.noMargin) return <NoMargin>{props.children}</NoMargin>;
    return <Center>{props.children} </Center>;
}

export function CenteredBold(props: TextProps): JSX.Element {
    return (
        <Centered noMargin={props.noMargin}>
            <b>{props.children} </b>
        </Centered>
    );
}

export function CenteredItallic(props: TextProps): JSX.Element {
    return (
        <Centered noMargin={props.noMargin}>
            <i>{props.children} </i>
        </Centered>
    );
}
