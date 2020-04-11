import React from "react";
import styled from "styled-components";

interface SetupPortraitProps {
    name: string;
    imageUrl: string;
    onDelete: () => void;
    onChange: (arg0: Event) => void;
}

interface SetupPortraitState {
    name: string;
}

const EditPortrait = styled.div`
    padding: 5px;
    margin: 5px;
    border: 1px solid grey;
    color: black;
    border-radius: 5px;
    font-weight: 600;
    max-width: 7rem;
    word-wrap: break-word;
`;

const Noselect = styled.div`
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

const XButton = styled(Noselect)`
    color: #df4040;

    :active {
        color: #ff7133;
        background-color: #ffd8c7;
    }
    :hover {
        color: red;
        background-color: #ffe1ea;
    }
`;

export class SetupPortrait extends React.Component<SetupPortraitProps, SetupPortraitState> {
    // TODO: When you click on the text, you can edit the text.

    public constructor(props: SetupPortraitProps) {
        super(props);
        this.state = { name: props.name };
    }

    public UNSAFE_componentWillReceiveProps(props: SetupPortraitProps) {
        this.setState({ name: props.name });
    }

    public render() {
        return (
            <EditPortrait>
                <div style={{ textAlign: "center" }}>
                    <XButton className="x-button" onDoubleClick={() => this.props.onDelete()}>
                        ✘
                    </XButton>
                    <img src={this.props.imageUrl} style={{ width: 100, height: 100 }} />
                    <br />
                    <input
                        className="memory-wall-portrait"
                        contentEditable={true}
                        onChange={() => this.props.onChange}
                        spellCheck={false}
                        value={this.state.name}
                    />
                </div>
            </EditPortrait>
        );
    }
}
