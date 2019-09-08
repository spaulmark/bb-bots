import React from "react";
import { selectPlayer } from "./selectedPortrait";
import { isNullOrUndefined } from "util";
import { RelationshipMap } from "../../utils";
import _ from "lodash";
import { HouseguestPortraitController } from "./houseguestPortraitController";
import { PortraitDisplayMode } from "../../model/portraitDisplayMode";

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
    displayMode: PortraitDisplayMode;
}
export class HouseguestPortrait extends React.Component<PortraitProps, PortraitState> {
    private controller: HouseguestPortraitController;

    public constructor(props: PortraitProps) {
        super(props);
        this.controller = new HouseguestPortraitController(this);
        this.state = this.controller.defaultState;
    }

    public componentDidMount() {
        if (isNullOrUndefined(this.props.id)) {
            return;
        }
        this.controller.subscribe();
    }

    public componentWillUnmount() {
        this.controller.unsubscribe();
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
                    backgroundColor: this.controller.backgroundColor(props)
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
