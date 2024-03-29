import React from "react";
import { GameState, getSplitMembers } from "../../model";
import { weekStartTab$ } from "../../subjects/subjects";
import { Subscription } from "rxjs";
import { MemoryWall } from "../memoryWall";
import { AllianceList, HelpLink } from "./allianceList";

interface WeekStartWrapperProps {
    gameState: GameState;
}

interface WeekStartWrapperState {
    tab: number;
}

export class WeekStartWrapper extends React.Component<WeekStartWrapperProps, WeekStartWrapperState> {
    private subs: Subscription[] = [];
    constructor(props: Readonly<WeekStartWrapperProps>) {
        super(props);
        this.state = { tab: weekStartTab$.value };
    }
    componentDidMount() {
        this.subs.push(weekStartTab$.subscribe((tab) => this.setState({ tab })));
    }
    componentWillUnmount() {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    render() {
        const helpText1 =
            this.props.gameState.phase === 1 ? (
                <div key="helptext1" style={{ marginTop: 20 }}>
                    <b>Try clicking on players to view their relationships.</b> <br />
                </div>
            ) : null;
        const helptext2 =
            this.props.gameState.phase === 2 ? (
                <div key="helptext1" style={{ marginTop: 20 }}>
                    <HelpLink
                        key="helptext2"
                        href="https://github.com/spaulmark/bb-bots/blob/master/README.md#understanding-relationships"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        What do the 🛇 ✘ ♥ 💔 🎯 symbols mean?
                    </HelpLink>
                </div>
            ) : null;
        if (this.state.tab === 0) {
            const splits =
                this.props.gameState.split.length === 0
                    ? [{ houseguests: this.props.gameState.houseguests }]
                    : this.props.gameState.split.map((split) => {
                          return {
                              splitName: split.name,
                              houseguests: getSplitMembers(split, this.props.gameState),
                          };
                      });

            return [<MemoryWall key="memorywall" splits={splits} />, helpText1, helptext2];
        }
        return <AllianceList gameState={this.props.gameState} />;
    }
}
