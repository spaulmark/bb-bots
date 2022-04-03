import React from "react";
import { GameState } from "../../model";
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
                <div key="helptext1" style={{ marginTop: 10 }}>
                    <b>Try clicking on houseguests to view their relationships.</b> <br />
                </div>
            ) : null;
        const helptext2 =
            this.props.gameState.phase === 2 ? (
                <HelpLink
                    key="helptext2"
                    href="https://github.com/spaulmark/bb-bots/blob/master/README.md#understanding-relationships"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    What do the 🛇 ✘ ♥ 💔 🎯 symbols mean?
                </HelpLink>
            ) : null;
        if (this.state.tab === 0) {
            return [
                <MemoryWall key="memorywall" houseguests={this.props.gameState.houseguests} />,
                helpText1,
                helptext2,
            ];
        }
        return <AllianceList gameState={this.props.gameState} />;
    }
}
