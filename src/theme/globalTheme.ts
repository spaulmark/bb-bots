import { createGlobalStyle } from "styled-components";
import { ColorTheme } from "./theme";

export const GlobalStyles = createGlobalStyle`
  *,
  *::after,
  *::before {
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }: { theme: ColorTheme }) => theme.bg};
    color: ${({ theme }: { theme: ColorTheme }) => theme.text};
       transition: all 0.25s linear;
  }`;
