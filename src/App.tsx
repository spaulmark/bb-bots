import React, { Component } from "react";
import { MainPage } from "./components/mainPage/mainPage";
import { MainPageController } from "./components/mainPage/mainPageController";

class App extends Component {
    render() {
        return <MainPage controller={new MainPageController()} />;
    }
}

export default App;
