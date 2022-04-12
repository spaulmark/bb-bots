import React from "react";
import { Subject, Subscription } from "rxjs";
import { NumericInputStyle } from "../castingScreen/numericInput";
import { EpisodeType } from "../episode/episodes";
import { twistCapacity$ } from "./seasonEditorList";
import { Label } from "./seasonEditorPage";

export const twist$ = new Subject<{ type: EpisodeType; add: boolean }>();

interface TwistAdderProps {
    type: EpisodeType;
}

export class TwistAdder extends React.Component<
    TwistAdderProps,
    { twistCount: number; twistCapacity: number }
> {
    private subs: Subscription[];

    public constructor(props: TwistAdderProps) {
        super(props);
        this.state = { twistCount: 0, twistCapacity: twistCapacity$.value };
        this.subs = [];
    }

    public componentDidMount(): void {
        this.subs.push(twistCapacity$.subscribe((twistCapacity) => this.setState({ twistCapacity })));
    }

    public componentWillUnmount(): void {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    public render(): JSX.Element {
        const twistCount = this.state.twistCount;
        return (
            <div className="column is-narrow">
                <div className="field has-addons has-addons-centered">
                    <p
                        className="field-label is-normal control"
                        style={{ textAlign: "right", marginRight: "1em" }}
                    >
                        <Label className="label">{this.props.type.name}</Label>
                    </p>
                    <p className="control">
                        <button
                            className="button is-danger"
                            disabled={twistCount === 0}
                            onClick={() => {
                                twist$.next({ type: this.props.type, add: false });
                                this.setState({ twistCount: twistCount - 1 });
                            }}
                        >
                            -
                        </button>
                    </p>
                    <p className="control">
                        <NumericInputStyle className="input" readOnly value={`${twistCount}`} />
                    </p>
                    <p className="control">
                        <button
                            className="button is-success"
                            onClick={() => {
                                twist$.next({ type: this.props.type, add: true });
                                this.setState({ twistCount: twistCount + 1 });
                            }}
                            disabled={this.state.twistCapacity < this.props.type.eliminates}
                        >
                            +
                        </button>
                    </p>
                </div>
            </div>
        );
    }
}
