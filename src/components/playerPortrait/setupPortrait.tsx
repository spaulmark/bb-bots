import React from "react";
import styled from "styled-components";
import { selectedColor } from "./houseguestPortraitController";

const EditPortrait = styled.div`
    padding: 5px;
    margin: 5px;
    border: 1px solid #9d9d9d;
    background-color: #9d9d9d;
    color: black;
    border-radius: 5px;
    font-weight: 600;
    width: 7rem;
    word-wrap: break-word;
`;

export const unselectable = `   -webkit-touch-callout: none;
-webkit-user-select: none;
-khtml-user-select: none;
-moz-user-select: none;
-ms-user-select: none;
user-select: none;`;

export const Noselect = styled.div`
    ${unselectable}
`;

const XButton = styled(Noselect)`
    color: #300808;
    width: 50%;

    :active {
        color: #ff7133;
        background-color: #ffd8c7;
    }
    :hover {
        color: red;
        background-color: #ffe1ea;
    }
`;

const EditButton = styled(Noselect)`
    color: #300808;
    width: 50%;

    :active {
        color: #ff7133;
        background-color: #ffd8c7;
    }
    :hover {
        color: orange;
        background-color: #fff6e1;
    }
`;

interface SetupPortraitProps {
    name: string;
    imageUrl: string;
    onDelete: () => void;
    onRename: () => void;
    onClick: () => void;
    selected: boolean;
}

interface SetupPortraitState {
    name: string;
}

export class SetupPortrait extends React.Component<SetupPortraitProps, SetupPortraitState> {
    public constructor(props: SetupPortraitProps) {
        super(props);
        this.state = { name: props.name };
    }

    public UNSAFE_componentWillReceiveProps(props: SetupPortraitProps) {
        this.setState({ name: props.name });
    }

    public render() {
        const style = this.props.selected ? { backgroundColor: selectedColor.toHex() } : {};
        return (
            <EditPortrait onClick={() => this.props.onClick()} style={style}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ maxHeight: 20, display: "flex" }}>
                        <XButton
                            onDoubleClick={() => this.props.onDelete()}
                            onClick={(event) => event.stopPropagation()}
                        >
                            ✘
                        </XButton>
                        <EditButton
                            onClick={(event) => {
                                event.stopPropagation();
                                this.props.onRename();
                            }}
                        >
                            ✎
                        </EditButton>
                    </div>
                    <img src={this.props.imageUrl} style={{ width: 100, height: 100 }} />
                    <br />
                    <p>{this.state.name}</p>
                </div>
            </EditPortrait>
        );
    }
}
