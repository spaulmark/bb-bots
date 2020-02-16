import "./bulma.scss";
import React from "react";
import { Sidebar } from "../sidebar/sidebar";
import { Topbar } from "../topbar/topBar";
import { MainContentArea } from "./mainContentArea";
import { MainPageController } from "./mainPageController";
import styled from "styled-components";

interface MainPageProps {
    controller: MainPageController;
}

const MainPageWrapper = styled.div`
    margin: auto;
    max-width: 1380px;
    overflow: hidden;
`;

export class MainPage extends React.Component<MainPageProps, any> {
    public constructor(props: MainPageProps) {
        super(props);
        props.controller.inject(this);
    }

    public render() {
        return (
            <MainPageWrapper>
                <Topbar />
                <div className="columns">
                    <div className="column is-narrow">
                        <Sidebar />
                    </div>
                    <div className="column">
                        <MainContentArea />
                    </div>
                </div>
            </MainPageWrapper>
        );
    }
}
