import React from "react";

interface SetupPortraitProps {
  name: string;
  imageUrl: string;
  onDelete: () => void;
}

export class SetupPortrait extends React.Component<SetupPortraitProps, any> {
  // TODO: When you click on the text, you can edit the text.

  public render() {
    return (
      <div key={this.props.name} className={`edit-portrait`}>
        <div style={{ textAlign: "center" }}>
          <div className="x-button" onClick={() => this.props.onDelete()}>
            ✘
          </div>
          <img src={this.props.imageUrl} style={{ width: 100, height: 100 }} />
          <br />
          {this.props.name}
        </div>
      </div>
    );
  }
}
