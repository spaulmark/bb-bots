import React from "react";
import { PlayerProfile } from "../../model";

interface ImportLinksProps {
  onSubmit: (profiles: PlayerProfile[]) => void;
  className?: string;
}

export class ImportLinks extends React.Component<ImportLinksProps, any> {
  public constructor(props: ImportLinksProps) {
    super(props);
    this.state = { text: "" };
  }

  private onSubmit() {
    const lines = this.state.text.split(/\r?\n/);
    // for each line, try to split into a space for the name
    const profiles: PlayerProfile[] = [];
    lines.forEach((line: string) => {
      const temp = line.split("/").pop();
      let name = temp
        ? temp
            .split("#")[0]
            .split("?")[0]
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]/g, " ")
        : null;

      const spaceName = line.substr(0, line.indexOf(" "));
      if (spaceName) {
        name = line.substr(line.indexOf(" ") + 1);
      }
      if (name) {
        profiles.push({
          name,
          imageURL: line,
          evictedImageURL: "BW"
        });
      }
    });
    this.props.onSubmit(profiles);
    this.setState({ text: "" });
  }

  public render() {
    return (
      <div className={this.props.className}>
        <textarea
          className="textarea"
          onChange={event => {
            this.setState({ text: event.target.value });
          }}
          value={this.state.text}
        />
        <button onClick={() => this.onSubmit()}>Import links</button>
      </div>
    );
  }
}
