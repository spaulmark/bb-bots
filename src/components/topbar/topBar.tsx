import React from "react";
import { mainContentStream$ } from "../mainPage/mainContentArea";
import { CastingScreen } from "../setupScreen/castingScreen";
import "./topBar.scss";
import { getCast } from "../mainPage/mainPageController";

export class Topbar extends React.Component {
  public render() {
    return (
      <div className="level box is-mobile" style={{ marginTop: 30 }}>
        <div className="level-item">
          <a
            className="topbar-link"
            onClick={() => {
              mainContentStream$.next(<CastingScreen cast={getCast()} />);
            }}
          >
            Edit Cast
          </a>
        </div>
        <div className="level-item">
          <a
            className="topbar-link"
            onClick={() => {
              mainContentStream$.next(<CastingScreen cast={getCast()} />);
            }}
          >
            Edit Season
          </a>
        </div>
      </div>
    );
  }
}
