import React from "react";
import {
  PortraitProps,
  PortraitState,
  backgroundColor
} from "./houseguestPortraitController";
import { Subscription } from "rxjs";
import {
  selectedPlayer$,
  SelectedPlayerData,
  selectPlayer
} from "./selectedPortrait";
import { isNullOrUndefined } from "util";

export class HouseguestPortrait extends React.Component<
  PortraitProps,
  PortraitState
> {
  private sub: Subscription | null = null;

  public constructor(props: PortraitProps) {
    super(props);
    this.state = { popularity: this.props.popularity };
  }

  public componentDidMount() {
    if (isNullOrUndefined(this.props.id)) {
      return;
    }
    this.sub = selectedPlayer$.subscribe({
      next: (data: SelectedPlayerData | null) => {
        if (!data) {
          this.setState({ popularity: this.props.popularity });
        } else {
          data = data as SelectedPlayerData;
          if (data.id !== this.props.id) {
            this.setState({ popularity: data.relationships[this.props.id!] });
          } else {
            this.setState({ popularity: 2 });
          }
        }
      }
    });
  }

  public componentWillUnmount() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }

  private onClick(): void {
    if (isNullOrUndefined(this.props.id) || !this.props.relationships) {
      return;
    }
    const data = { id: this.props.id, relationships: this.props.relationships };
    selectPlayer(data);
  }

  public render() {
    const props = this.props;
    const evictedImageURL =
      props.evictedImageURL === "BW" ? props.imageURL : props.evictedImageURL;
    const imageSrc = props.isEvicted ? evictedImageURL : props.imageURL;
    const imageClass = getImageClass(props);
    let subtitle: any[] = [];
    if (props.generateSubtitle) {
      subtitle = props.generateSubtitle(this.props, this.state);
    }
    let className = "";
    if (props.isJury) {
      className = "jury";
    } else if (props.isEvicted) {
      className = "evicted";
    }
    return (
      <div
        onClick={() => this.onClick()}
        style={{
          backgroundColor: backgroundColor(props, this.state.popularity)
        }}
        className={`memory-wall-portrait ${className}`}
      >
        <img
          className={imageClass}
          src={imageSrc}
          style={{ width: 100, height: 100 }}
        />
        <br />
        {props.name}
        <br />
        {!!props.generateSubtitle && (
          <small className="portrait-history">{subtitle}</small>
        )}
      </div>
    );
  }
}

function getImageClass(props: PortraitProps) {
  let imageClass =
    props.isEvicted && props.evictedImageURL === "BW" ? "grayscale" : "";
  imageClass = props.isJury ? "sepia" : imageClass;
  return imageClass;
}
