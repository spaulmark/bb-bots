import React from "react";
import FileDrop from "react-file-drop";
import { HouseguestPortrait } from "../memoryWall";

interface SetupScreenState {
  files: FileList | null;
}

export class SetupScreen extends React.Component<any, SetupScreenState> {
  constructor(props: any) {
    super(props);
    this.state = {
      files: null
    };
  }
  // TODO: on submit, this needs to use rx-js to submit a list of player profiles back to the main page.
  // obviously, subscribing to this stream and getting a notification from it resets the season.

  private getFiles() {
    const rows = [];
    const files = this.state.files;

    if (!files) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.match(/image\/*/)) {
        rows.push(
          <HouseguestPortrait
            name={file.name.substr(0, file.name.lastIndexOf(".")) || file.name}
            imageURL={URL.createObjectURL(file)}
            evictedImageURL="BW"
            key={i.toString()}
          />
        );
      }
    }
    return (
      <div className="columns is-gapless is-mobile is-multiline is-centered">
        {rows}
      </div>
    );
  }

  public render() {
    return (
      <FileDrop onDrop={this.handleDrop}>
        Drop some files here!
        {this.getFiles()}
      </FileDrop>
    );
  }

  private handleDrop = (files: FileList | null, event: React.DragEvent) => {
    this.setState({ files });
  };
}
