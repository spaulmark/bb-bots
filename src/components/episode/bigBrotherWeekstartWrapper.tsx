import React from "react";
import { GameState } from "../../model";
import { weekStartTab$ } from "../../subjects/subjects";
import { Subscription } from "rxjs";
import { MemoryWall } from "../memoryWall";
import { AllianceList } from "./allianceList";

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
        if (this.state.tab === 0) {
            return <MemoryWall houseguests={this.props.gameState.houseguests} />;
        }
        return <AllianceList gameState={this.props.gameState} />;
    }
}
