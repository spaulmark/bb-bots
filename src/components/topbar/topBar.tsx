import React from "react";
import { mainContentStream$ } from "../mainPage/mainContentArea";
import { SetupScreen } from "../setupScreen/setupScreen";
import "./topBar.scss";

export class Topbar extends React.Component {
  public render() {
    return (
      <div className="box level" style={{ marginTop: 30 }}>
        <div
          className="level-item topbar-link"
          onClick={() => {
            mainContentStream$.next(<SetupScreen />);
          }}
        >
          Edit Cast
        </div>
      </div>
    );
  }
}
