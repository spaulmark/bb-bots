import React, { Component } from "react";
import { MainPage } from "./components/mainPage/mainPage";
import { BigBrotherController } from "./components/mainPage/bigBrotherController";

class App extends Component {
  render() {
    return <MainPage controller={new BigBrotherController()} />;
  }
}

export default App;
