import React from "react";
import { getRandomColor, invertColor } from "../../model/color";
import { getTribe, Tribe } from "../../model/tribe";
import { EpisodeType } from "../episode/episodes";
import { ChangableTeam, TeamAdderProps, TeamsAdder } from "./teamsAdder";
import { twist$ } from "./twistAdder";

interface TeamsAdderListState {
    items: { [id: number]: TeamAdderProps };
    id: number;
}

interface DumpedState {
    items: {
        [id: number]: {
            id: number;
            Teams: { [id: number]: Tribe };
            endsWhen: string;
        };
    };
    id: number;
}

let _teams: { [id: number]: TeamAdderProps } = {};
let lastState: DumpedState = { items: {}, id: 1 };

export function getTeamsListContents(): { [id: number]: TeamAdderProps } {
    return { ..._teams };
}

export class TeamsAdderList extends React.Component<{ loadLast: boolean }, TeamsAdderListState> {
    public constructor(props: Readonly<{ loadLast: boolean }>) {
        super(props);
        !props.loadLast && (_teams = {});
        this.state = props.loadLast ? this.loadDumpedState() : { items: {}, id: 1 };
    }

    public componentDidUpdate(): void {
        _teams = { ...this.state.items };
    }

    private loadDumpedState(): TeamsAdderListState {
        const newState: TeamsAdderListState = { id: lastState.id, items: {} };
        // now for the items
        for (const itemsKey in lastState.items) {
            const item = lastState.items[itemsKey];
            const Teams: { [id: number]: ChangableTeam } = {};
            for (const teamsKey in item.Teams) {
                const id = parseInt(itemsKey);
                const tribeId = parseInt(teamsKey);
                Teams[teamsKey] = {
                    ...item.Teams[teamsKey],
                    onChangeColor: this.getOnChangeColor(id, tribeId),
                    onChangeName: this.getOnChangeName(id, tribeId),
                    removeTeam: this.getOnDelete(id, tribeId),
                };
            }
            const id = parseInt(itemsKey);
            const newItem = {
                id: item.id,
                Teams,
                endsWhen: item.endsWhen,
                onChangeNumber: (n: string) => {
                    const newState = { ...this.state };
                    newState.items[id].endsWhen = n;
                    this.setState(newState);
                },
                deleteSelf: this.getOnDeleteSelf(id),
                addTeam: () => {
                    const newState = { ...this.state };
                    const newTeam = getTribe("", getRandomColor().toHex());
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
            newState.items[itemsKey] = newItem;
        }
        return newState;
    }

    public componentWillUnmount(): void {
        const newLastState: DumpedState = { items: {}, id: this.state.id };
        for (const itemsKey in this.state.items) {
            const item = this.state.items[itemsKey];
            const Teams: { [id: number]: Tribe } = {};
            for (const teamsKey in item.Teams) {
                const newTeam: Tribe = {
                    color: item.Teams[teamsKey].color,
                    tribeId: item.Teams[teamsKey].tribeId,
                    name: item.Teams[teamsKey].name,
                };
                Teams[teamsKey] = newTeam;
            }

            newLastState.items[itemsKey] = {
                id: item.id,
                Teams,
                endsWhen: item.endsWhen,
            };
        }
        lastState = newLastState;
    }

    private getOnChangeName(id: number, tribeId: number): (name: string) => void {
        return (name: string) => {
            const newState = this.state;
            newState.items[id].Teams[tribeId].name = name;
            this.setState(newState);
        };
    }
    private getOnChangeColor(id: number, tribeId: number): (name: string) => void {
        return (color: string) => {
            const newState = this.state;
            newState.items[id].Teams[tribeId].color = color;
            this.setState(newState);
        };
    }
    private getOnDelete(id: number, tribeId: number): () => void {
        return () => {
            const newState = this.state;
            delete newState.items[id].Teams[tribeId];
            this.setState(newState);
        };
    }

    private getTwist(id: number): EpisodeType {
        return {
            canPlayWith: (n: number) => n > 3,
            eliminates: 0,
            pseudo: true,
            teamsLookupId: id,
            name: `Team Phase ${id}`,
            emoji: "🎌",
            generate: (_) => {
                throw "UNREACHABLE";
            },
        };
    }

    private getOnDeleteSelf(id: number): () => void {
        return () => {
            const newState = this.state;
            twist$.next({ type: this.getTwist(id), add: false });
            delete newState.items[id];
            this.setState(newState);
        };
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
                        const color = getRandomColor();
                        const tribe1: Tribe = getTribe("", color.toHex());
                        const tribe2: Tribe = getTribe("", invertColor(color).toHex());
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
                            onChangeNumber: (n: string) => {
                                const newState = { ...this.state };
                                newState.items[id].endsWhen = n;
                                this.setState(newState);
                            },
                            Teams,
                            deleteSelf: this.getOnDeleteSelf(id),
                            addTeam: () => {
                                const newState = { ...this.state };
                                const newTeam = getTribe("", getRandomColor().toHex());
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
                            type: this.getTwist(id),
                        });
                        this.setState({
                            items: newItems,
                            id: id + 1,
                        });
                    }}
                >
                    🎌 Add Teams Twist
                </button>
            </div>
        );
    }
}
