import React from "react";
import { TeamAdderProps, TeamsAdder } from "./teamsAdder";

// TODO: subscribe to twist$ and see when a twist is added -- if its teams you add one, else subtract one
// keep track of id, it goes up and down.

interface TeamsAdderListState {
    items: { [id: number]: TeamAdderProps };
    id: number;
}

export class TeamsAdderList extends React.Component<{}, TeamsAdderListState> {
    public constructor(props: {}) {
        super(props);
        this.state = { items: {}, id: 1 };
        // TODO: maybe a global variable that binds to this state or something and a subject idk idk idk idk!
    }
    public render(): JSX.Element {
        const items = this.state.items;

        return (
            <div>
                {Object.values(items).map((item) => (
                    <TeamsAdder {...item} />
                ))}
                <button
                    className="button is-primary"
                    onClick={() => {
                        const newItems = { ...items };
                        newItems[this.state.id] = {
                            id: this.state.id,
                            Teams: [
                                { name: "Team 1", color: "#000000" },
                                { name: "Team 2", color: "#ffffff" },
                            ],
                        };
                        this.setState({
                            items: newItems,
                            id: this.state.id + 1,
                        });
                    }}
                >
                    Add teams
                </button>
            </div>
        );
    }
}
