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
        return (() => {
            const newState = this.state;
            twist$.next({ type: this.getTwist(id), add: false });
            delete newState.items[id];
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
                            onChangeNumber: ((n: string) => {
                                const newState = { ...this.state };
                                newState.items[id].endsWhen = n;
                                this.setState(newState);
                            }).bind(this),
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
