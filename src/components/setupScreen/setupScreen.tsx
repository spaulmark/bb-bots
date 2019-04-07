import React from "react";
import FileDrop from "react-file-drop";

interface SetupScreenState {
  files: FileList | null;
}

let imageId = 0;

export class SetupScreen extends React.Component<any, SetupScreenState> {
  constructor(props: any) {
    super(props);
    this.state = {
      files: null
    };
  }
  // on submit, this needs to use rx-js to submit a list of player profiles back to the main page.

  private getFiles() {
    const rows = [];
    const files = this.state.files;

    if (!files) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      if (files[i].type.match(/image\/*/)) {
        rows.push(<img key={++imageId} src={URL.createObjectURL(files[i])} />);
      }
    }
    return rows;
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
