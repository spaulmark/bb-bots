import styled from "styled-components";
import React from "react";
import { mainContentStream$ } from "../../subjects/subjects";
import { Box } from "../layout/box";

const MainContentAreaWrapper = styled(Box)`
    overflow-x: auto;
`;

export class MainContentArea extends React.Component<{}, { content: any }> {
    // a simple class that displays whatever it gets fed through the main content stream.

    private contentStream: any;

    public constructor(props: any) {
        super(props);
        this.state = { content: null };
    }

    public componentDidMount() {
        this.contentStream = mainContentStream$.subscribe((content) => {
            this.setState({ content });
        });
    }

    public componentDidUpdate(prevProps: never, prevState: any) {
        if (prevState.content !== this.state.content) {
            window.scrollTo(0, 0);
        }
    }

    public componentWillUnmount() {
        this.contentStream.unsubscribe();
    }

    public render() {
        return <MainContentAreaWrapper>{this.state.content}</MainContentAreaWrapper>;
    }
}
