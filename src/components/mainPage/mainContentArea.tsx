import React from "react";
import { mainContentStream$ } from "../../subjects/subjects";

export class MainContentArea extends React.Component<{}, { content: any }> {
    // a simple class that displays whatever it gets fed through the main content stream.

    private contentStream: any;

    public constructor(props: any) {
        super(props);
        this.state = { content: null };
    }

    public componentDidMount() {
        this.contentStream = mainContentStream$.subscribe(content => {
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

    // TODO: get rid of CSS and find a fix where the overflow keeps getting hidden.
    public render() {
        return <div className="box">{this.state.content}</div>;
    }
}
