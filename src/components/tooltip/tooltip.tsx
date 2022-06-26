import React from "react";
import Popover from "react-tiny-popover";
import styled from "styled-components";
import { unselectable } from "../playerPortrait/setupPortrait";

const common = `
${unselectable}
padding: 3px 8px;
color: #fff;
text-align: center;
background-color: #000;
border-radius: 4px;`;

const Text = styled.p`
    max-width: 200px;
    ${common}
`;
const WideText = styled.p`
    max-width: 800px;
    ${common}
`;
interface TooltipProps {
    text: string;
    children: any;
    wide?: boolean;
}

interface ToolTipState {
    visible: boolean;
}

export class Tooltip extends React.Component<TooltipProps, ToolTipState> {
    constructor(props: TooltipProps) {
        super(props);
        this.state = { visible: false };
    }

    public render() {
        const Txt = this.props.wide ? WideText : Text;
        return (
            <Popover
                position={["top", "bottom"]}
                isOpen={this.state.visible}
                content={<Txt>{this.props.text}</Txt>}
            >
                <div
                    onMouseEnter={() => this.setState({ visible: true })}
                    onMouseLeave={() => this.setState({ visible: false })}
                >
                    {this.props.children}
                </div>
            </Popover>
        );
    }
}
