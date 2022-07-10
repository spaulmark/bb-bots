import React from "react";
import { getTribe, Tribe } from "../../model/tribe";
import { ChangableTeam, TeamAdderProps, TeamsAdder } from "./teamsAdder";
import { twist$ } from "./twistAdder";

// TODO: remove a specific teams twist by id when a twist is removed by id

interface TeamsAdderListState {
    items: { [id: number]: TeamAdderProps };
    id: number;
}

let _teams: { [id: number]: TeamAdderProps } = {};

export function getTeamsListContents(): { [id: number]: TeamAdderProps } {
    return { ..._teams };
}

export class TeamsAdderList extends React.Component<{}, TeamsAdderListState> {
    public constructor(props: {}) {
        super(props);
        _teams = {};
        this.state = { items: {}, id: 1 };
    }

    public componentDidUpdate(): void {
        _teams = { ...this.state.items };
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
    private getOnDelete(id: number, tribeId: number): () => void {
        return (() => {
            const newState = this.state;
            delete newState.items[id].Teams[tribeId];
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
                        const tribe1: Tribe = getTribe("", "#ff0000"); // TODO: random colors
                        const tribe2: Tribe = getTribe("", "#0000ff");
                        const Teams: { [id: number]: ChangableTeam } = {};
                        for (let tribe of [tribe1, tribe2]) {
                            const tribeId = tribe.tribeId;
                            Teams[tribeId] = {
                                ...tribe,
                                onChangeName: this.getOnChangeName(id, tribeId),
                                onChangeColor: this.getOnChangeColor(id, tribeId),
                                removeTeam: this.getOnDelete(id, tribeId),
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
                                const newTeam = getTribe("", "#ff0000");
                                const tribeId = newTeam.tribeId;
                                newState.items[id].Teams[tribeId] = {
                                    ...newTeam,
                                    onChangeName: this.getOnChangeName(id, tribeId),
                                    onChangeColor: this.getOnChangeColor(id, tribeId),
                                    removeTeam: this.getOnDelete(id, tribeId),
                                };
                                newState.id = id + 1;
                                this.setState(newState);
                            },
                        };
                        twist$.next({
                            add: true,
                            type: {
                                canPlayWith: (n: number) => n > 3,
                                eliminates: 0,
                                pseudo: true,
                                teamsLookupId: id,
                                name: `Team Phase ${id}`,
                                emoji: "🎌",
                                generate: (_) => {
                                    throw "UNREACHABLE";
                                },
                            },
                        });
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
