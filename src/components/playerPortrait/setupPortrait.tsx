import React from "react";

interface SetupPortraitProps {
    name: string;
    imageUrl: string;
    onDelete: () => void;
    onChange: (arg0: Event) => void;
}

interface SetupPortraitState {
    name: string;
}

export class SetupPortrait extends React.Component<SetupPortraitProps, SetupPortraitState> {
    // TODO: When you click on the text, you can edit the text.

    public constructor(props: SetupPortraitProps) {
        super(props);
        this.state = { name: props.name };
    }

    public componentWillReceiveProps(props: SetupPortraitProps) {
        this.setState({ name: props.name });
    }

    public render() {
        return (
            <div className={`edit-portrait`}>
                <div style={{ textAlign: "center" }}>
                    <div className="x-button noselect" onDoubleClick={() => this.props.onDelete()}>
                        ✘
                    </div>
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
            </div>
        );
    }
}
