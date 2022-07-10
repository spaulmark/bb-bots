import React from "react";
import { getTribe, Tribe } from "../../model/tribe";
import { ChangableTeam, TeamAdderProps, TeamsAdder } from "./teamsAdder";

// TODO: push to twist$ when a team is added
// remove a specific twist by id when a twist is removed by id

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
    private getOnChangeName(id: number, tribeId: number): (name: string) => void {
        return ((name: string) => {
            const newState = this.state;
            newState.items[id].Teams[tribeId].name = name;
            this.setState(newState);
        }).bind(this);
    }
    private getOnChangeColor(id: number, tribeId: number): (name: string) => void {
        return ((color: string) => {
            const newState = this.state;
            newState.items[id].Teams[tribeId].color = color;
            this.setState(newState);
        }).bind(this);
    }

    public render(): JSX.Element {
        const items = this.state.items;

        return (
            <div>
                {Object.values(items).map((item, i) => (
                    <TeamsAdder {...item} key={i} />
                ))}
                <button
                    className="button is-primary"
                    onClick={() => {
                        const newItems = { ...items };
                        const id = this.state.id;
                        const tribe1: Tribe = getTribe("Team 1", "#ff0000");
                        const tribe2: Tribe = getTribe("Team 2", "#0000ff");
                        const Teams: { [id: number]: ChangableTeam } = {};
                        for (let tribe of [tribe1, tribe2]) {
                            const tribeId = tribe.tribeId;
                            Teams[tribeId] = {
                                ...tribe,
                                onChangeName: this.getOnChangeName(id, tribeId),
                                onChangeColor: this.getOnChangeColor(id, tribeId),
                            };
                        }

                        newItems[id] = {
                            id,
                            endsWhen: "2",
                            onChangeNumber: ((n: string) => {
                                const newState = { ...this.state };
                                newState.items[id].endsWhen = n;
                                this.setState(newState);
                            }).bind(this),
                            Teams,
                            addTeam: () => {
                                const newState = { ...this.state };
                                const newTeam = getTribe("New Team", "#ff0000");
                                const tribeId = newTeam.tribeId;
                                newState.items[id].Teams[tribeId] = {
                                    ...newTeam,
                                    onChangeName: this.getOnChangeName(id, tribeId),
                                    onChangeColor: this.getOnChangeColor(id, tribeId),
                                };
                                newState.id = id + 1;
                                this.setState(newState);
                            },
                        };
                        this.setState({
                            items: newItems,
                            id: id + 1,
                        });
                    }}
                >
                    Add Teams Twist
                </button>
            </div>
        );
    }
}
