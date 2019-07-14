import React from "react";
import { backgroundColor } from "./houseguestPortraitController";
import { Subscription } from "rxjs";
import { selectedPlayer$, SelectedPlayerData, selectPlayer } from "./selectedPortrait";
import { isNullOrUndefined } from "util";
import { RelationshipMap } from "../../utils";
import {
    classifyRelationship,
    RelationshipTypeToSymbol,
    RelationshipType as Relationship
} from "../../utils/ai/classifyRelationship";
import _ from "lodash";

export interface PortraitProps {
    imageURL: string;
    name: string;
    id?: number;
    relationships?: RelationshipMap;
    isEvicted?: boolean;
    isJury?: boolean;
    popularity?: number;
    deltaPopularity?: number;
    generateSubtitle?: (props: PortraitProps, state: PortraitState) => string[];
    tags?: string[];
    superiors?: Set<number>;
    getFriendEnemyCount?: () => { friends: number; enemies: number };
}

export interface PortraitState {
    popularity?: number;
    titles: string[];
}
export class HouseguestPortrait extends React.Component<PortraitProps, PortraitState> {
    private sub: Subscription | null = null;
    private readonly defaultState = { popularity: this.props.popularity, titles: [] };

    public constructor(props: PortraitProps) {
        super(props);
        this.state = this.defaultState;
    }

    public componentDidMount() {
        if (isNullOrUndefined(this.props.id)) {
            return;
        }
        this.sub = selectedPlayer$.subscribe({
            next: (data: SelectedPlayerData | null) => {
                if (!data) {
                    this.setState(this.defaultState);
                } else {
                    data = data as SelectedPlayerData;
                    if (data.id !== this.props.id) {
                        this.setState({ popularity: data.relationships[this.props.id!] });
                        const titles = this.generateTitles(data);
                        this.setState({ titles });
                    } else {
                        const titles = this.friendEnemyCountTitle();
                        this.setState({ popularity: 2, titles });
                    }
                }
            }
        });
    }

    private friendEnemyCountTitle(): string[] {
        const titles: string[] = [];
        const count = this.props.getFriendEnemyCount
            ? this.props.getFriendEnemyCount()
            : { friends: 0, enemies: 0 };
        titles.push(
            `${count.friends} ${RelationshipTypeToSymbol[Relationship.Friend]} | ${count.enemies} ${
                RelationshipTypeToSymbol[Relationship.Enemy]
            }`
        );
        return titles;
    }

    private generateTitles(villain: SelectedPlayerData): string[] {
        const hero = this.props;
        const titles: string[] = [];
        titles.push(
            RelationshipTypeToSymbol[
                classifyRelationship(
                    hero.popularity || 0,
                    villain.popularity,
                    hero.relationships![villain.id]
                )
            ]
        );
        const id = hero.id || -1;
        return titles;
    }

    public componentWillUnmount() {
        if (this.sub) {
            this.sub.unsubscribe();
            this.sub = null;
        }
    }

    private onClick(): void {
        if (isNullOrUndefined(this.props.id) || !this.props.relationships) {
            return;
        }
        const data = {
            id: this.props.id,
            relationships: this.props.relationships,
            isEvicted: !!this.props.isEvicted,
            popularity: this.props.popularity || 0,
            superiors: this.props.superiors
        };
        selectPlayer(data);
    }

    public render() {
        const props = this.props;
        const imageClass = getImageClass(props);
        let subtitle: any[] = [];
        if (props.generateSubtitle) {
            subtitle = props.generateSubtitle(this.props, this.state);
        }
        let className = "";
        if (props.isJury) {
            className = "jury";
        } else if (props.isEvicted) {
            className = "evicted";
        }
        return (
            <div
                onClick={() => this.onClick()}
                style={{
                    backgroundColor: backgroundColor(props, this.state.popularity)
                }}
                className={`memory-wall-portrait ${className}`}
            >
                <img className={imageClass} src={props.imageURL} style={{ width: 100, height: 100 }} />
                <br />
                {props.name}
                <br />
                {!!props.generateSubtitle && <small className="portrait-history">{subtitle}</small>}
            </div>
        );
    }
}

function getImageClass(props: PortraitProps) {
    let imageClass = props.isEvicted ? "grayscale" : "";
    imageClass = props.isJury ? "sepia" : imageClass;
    return imageClass;
}
