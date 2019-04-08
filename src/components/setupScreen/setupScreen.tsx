import React from "react";
import FileDrop from "react-file-drop";
import { PlayerProfile } from "../../model";
import { SetupPortrait } from "../playerPortrait/setupPortrait";

interface SetupScreenState {
  players: PlayerProfile[];
}

export class SetupScreen extends React.Component<any, SetupScreenState> {
  constructor(props: any) {
    super(props);
    this.state = {
      players: []
    };
  }
  // TODO: on submit, this needs to use rx-js to submit a list of player profiles back to the main page.
  // obviously, subscribing to this stream and getting a notification from it resets the season.
  // it should probably be injected with this stream to submit back to.

  private deleteMethod(i: number) {
    return () => {
      const newState = { ...this.state };
      newState.players.splice(i, 1);
      this.setState(newState);
    };
  }

  private getFiles() {
    const players = this.state.players;

    if (!players) {
      return;
    }

    const rows: JSX.Element[] = [];
    let i = 0;
    players.forEach(player =>
      rows.push(
        <SetupPortrait
          name={player.name}
          imageUrl={player.imageURL}
          onDelete={this.deleteMethod(i)}
          key={(++i).toString()}
        />
      )
    );

    return (
      <div className="columns is-gapless is-mobile is-multiline is-centered">
        {rows}
      </div>
    );
  }

  public render() {
    return (
      <FileDrop onDrop={this.handleDrop}>
        ~ Drop images ~{this.getFiles()}
      </FileDrop>
    );
  }

  private handleDrop = (files: FileList | null, event: React.DragEvent) => {
    const newState = { ...this.state };

    if (!files) {
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const rows = [];

      if (file.type.match(/image\/*/)) {
        newState.players.push(
          new PlayerProfile({
            name: file.name.substr(0, file.name.lastIndexOf(".")) || file.name,
            imageURL: URL.createObjectURL(file),
            evictedImageURL: "BW"
          })
        );
      }
    }
    this.setState(newState);
  };
}
