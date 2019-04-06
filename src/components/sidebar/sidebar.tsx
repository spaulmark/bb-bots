import React from "react";

export class Sidebar extends React.Component {
  // sidebar needs a controller. the controller needs to be able to take in updates to the available episodes.

  public render() {
    return (
      <div className="box">
        <b>Episode 1</b>
        <br />
        HoH Competition <br />
        Nomination Ceremony
        <br /> Veto Competition
        <br /> Veto Ceremony
        <br /> Live Eviction
      </div>
    );
  }
}
