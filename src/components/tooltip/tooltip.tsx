import React from "react";
import Popover from "react-tiny-popover";
import styled from "styled-components";

const Text = styled.p`
    max-width: 200px;
    padding: 3px 8px;
    color: #fff;
    text-align: center;
    background-color: #000;
    border-radius: 4px;
`;

interface TooltipProps {
    text: string;
    children: any;
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
        return (
            <Popover isOpen={this.state.visible} content={<Text>{this.props.text}</Text>}>
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
