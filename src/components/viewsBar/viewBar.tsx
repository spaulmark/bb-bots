import React from "react";
import { popularityMode, powerMode } from "../../model/portraitDisplayMode";
import { ViewBarTag } from "./viewBarTag";
import { Box } from "../layout/box";
import styled from "styled-components";
import { ColorTheme } from "../../theme/theme";

const ViewsBox = styled(Box)`
    background: ${({ theme }: { theme: ColorTheme }) => theme.overlay};
`;

export function ViewsBar() {
    return (
        <ViewsBox className="level is-mobile" key="viewsbar">
            <ViewBarTag mode={popularityMode} text={"Relationships"}></ViewBarTag>
            <ViewBarTag mode={powerMode} text={"Power Rankings"}></ViewBarTag>
            {/* <ViewBarTag mode={powerMode} disabled={true} text={"Cliques [Coming Soon™]"}></ViewBarTag> */}
        </ViewsBox>
    );
}
