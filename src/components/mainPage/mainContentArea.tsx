import React from "react";
import { BehaviorSubject } from "rxjs";

export const mainContentStream$ = new BehaviorSubject(<div />);

export class MainContentArea extends React.Component<any, any> {
  // just a class that displays whatever it gets fed through the stream.

  private contentStream: any;

  public constructor(props: any) {
    super(props);
    this.state = { content: null };
  }

  public componentWillMount() {
    this.contentStream = mainContentStream$.subscribe(content => {
      this.setState({ content });
    });
  }

  public componentWillUnmount() {
    this.contentStream.unsubscribe();
  }

  public render() {
    return <div className="box">{this.state.content}</div>;
  }
}
