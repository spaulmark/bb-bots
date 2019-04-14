import React from "react";
import FileDrop from "react-file-drop";
import { PlayerProfile } from "../../model";
import { SetupPortrait } from "../playerPortrait/setupPortrait";
import { ImportLinks } from "./importLinks";
import { updateCast } from "../mainPage/mainPageController";
import { mainContentStream$ } from "../mainPage/mainContentArea";
import { PregameScreen } from "../pregameScreen/pregameScreen";

interface SetupScreenState {
  players: PlayerProfile[];
}

interface SetupScreenProps {
  cast?: PlayerProfile[];
}

export class SetupScreen extends React.Component<
  SetupScreenProps,
  SetupScreenState
> {
  constructor(props: SetupScreenProps) {
    super(props);
    this.state = { players: props.cast || [] };
  }

  private handleChange(i: number) {
    return (event: any) => {
      const newName = event.target.value.replace(/\r?\n|\r/g, "");
      const newState = { ...this.state };
      newState.players[i] = new PlayerProfile({
        imageURL: newState.players[i].imageURL,
        name: newName,
        evictedImageURL: newState.players[i].evictedImageURL
      });
      this.setState(newState);
    };
  }

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
          onChange={this.handleChange(i)}
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

  private appendProfiles = (profiles: PlayerProfile[]) => {
    const newState = { ...this.state };
    profiles.forEach(profile => newState.players.push(profile));
    this.setState(newState);
  };

  private submit = () => {
    updateCast(this.state.players);
    mainContentStream$.next(<PregameScreen cast={this.state.players} />);
  };

  public render() {
    return (
      <FileDrop onDrop={this.handleDrop}>
        <div className="level">
          <ImportLinks onSubmit={this.appendProfiles} />
          <div className="level-item">
            <button
              className="button is-danger"
              onClick={() => this.setState({ players: [] })}
            >
              Delete all
            </button>
          </div>
          <div className="level-item">
            <button
              className="button is-primary"
              disabled={this.state.players.length === 0}
              onClick={this.submit}
            >
              Submit
            </button>
          </div>
        </div>
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
