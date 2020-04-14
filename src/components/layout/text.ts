import styled from "styled-components";
import { ColorTheme } from "../../theme/theme";

export const HasText = styled.div`
    color: ${({ theme }: { theme: ColorTheme }) => theme.text};
`;

export const Input = styled.input`
    color: ${({ theme }: { theme: ColorTheme }) => theme.text};
`;
