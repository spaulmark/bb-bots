import "./mainPage.scss";
import React from "react";
import { Sidebar } from "../sidebar/sidebar";
import { Topbar } from "../topbar/topBar";
import { MainContentArea } from "./mainContentArea";
import { MainPageController } from "./mainPageController";

interface MainPageProps {
  controller: MainPageController;
}

export class MainPage extends React.Component<MainPageProps, any> {
  public constructor(props: MainPageProps) {
    super(props);
    props.controller.inject(this);
  }

  public componentWillUnmount() {
    this.props.controller.destroy();
  }

  public render() {
    return (
      <div className="main-page">
        <Topbar />
        <div className="columns">
          <div className="column is-narrow">
            <Sidebar />
          </div>
          <div className="column">
            <MainContentArea />
          </div>
        </div>
      </div>
    );
  }
}
