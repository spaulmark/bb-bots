import React from "react";
import { selectPlayer } from "./selectedPortrait";
import { isNotWellDefined, RelationshipMap, rng } from "../../utils";
import _ from "lodash";
import { HouseguestPortraitController } from "./houseguestPortraitController";
import { PortraitDisplayMode } from "../../model/portraitDisplayMode";
import styled from "styled-components";
import { ColorTheme } from "../../theme/theme";
import { Tribe } from "../../model/tribe";
import { textColor } from "../../model/color";
import { heroIsPregame } from "./subtitle";

const Subtitle = styled.small`
    font-weight: 100;
    font-size: small;
`;

const MemoryWallPortrait = styled.div`
    margin: 5px;
    border: 1px solid ${({ theme }: { theme: ColorTheme }) => theme.portraitBorder};
    color: black;
    border-radius: 5px;
    text-align: center;
    font-weight: 600;
    width: 7rem;
    word-wrap: break-word;
    -webkit-transition-property: none;
    -moz-transition-property: none;
    -o-transition-property: none;
    transition-property: none;
`;

const Evicted = styled(MemoryWallPortrait)`
    font-weight: 100;
    color: grey;
    background-color: #111111;
`;

const Jury = styled(MemoryWallPortrait)`
    font-weight: 100;
    color: #c3ae88;
    background-color: #5d5340;
    filter: brightness(0.6);
`;

const Normal = styled.img`
    min-width: 100px;
    width: 100%;
    width: -moz-available;
    width: -webkit-fill-available;
    width: stretch;
    -webkit-transition-property: none;
    -moz-transition-property: none;
    -o-transition-property: none;
    transition-property: none;
`;

const Grayscale = styled(Normal)`
    filter: grayscale(100%);
`;

const Sepia = styled(Normal)`
    filter: sepia(100%);
`;

export interface PortraitProps {
    imageURL: string;
    name: string;
    id?: number;
    relationships?: RelationshipMap;
    isEvicted?: boolean;
    isJury?: boolean;
    popularity?: number;
    powerRanking?: number;
    deltaPopularity?: number;
    detailed?: boolean;
    superiors?: { [id: number]: number };
    friends?: number;
    enemies?: number;
    targetingMe?: number;
    targets?: number[];
    tribe?: Tribe;
}

export interface PortraitState {
    popularity?: number;
    powerRanking?: number;
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
        if (isNotWellDefined(this.props.id)) {
            return;
        }
        this.controller.subscribe();
    }

    public componentWillUnmount() {
        this.controller.unsubscribe();
    }

    private onClick(): void {
        if (
            (this.props.targets && this.props.targets[0] === 0 && this.props.targets[1] == 0) ||
            isNotWellDefined(this.props.id) ||
            !this.props.relationships
        ) {
            return;
        }
        const data = {
            id: this.props.id,
            relationships: this.props.relationships,
            isEvicted: !!this.props.isEvicted,
            popularity: this.props.popularity || 0,
            superiors: this.props.superiors,
        };
        selectPlayer(data);
    }

    public render() {
        const props = this.props;
        const Img = getImageClass(props);
        let subtitle: any[] = [];
        subtitle = this.state.displayMode.generateSubtitle(this.props, this.state, !!props.detailed);
        let tribeStyle: any = props.tribe
            ? { backgroundColor: props.tribe.color, color: textColor(props.tribe.color) }
            : {};
        let Portrait = MemoryWallPortrait;
        if (props.isJury) {
            Portrait = Jury;
            tribeStyle = {
                backgroundColor: "#5d5340",
                color: "#c3ae88",
                borderTop: "1px solid #5d5340",
                borderBottom: "1px solid #5d5340",
            };
        } else if (props.isEvicted) {
            Portrait = Evicted;
            tribeStyle = { backgroundColor: "#111111", color: "grey" };
        }

        const tribe = props.tribe ? (
            <TribeStyle style={tribeStyle}>
                <small>{props.tribe.name}</small>
            </TribeStyle>
        ) : undefined;
        const imageStyle: any = { height: 100, width: "-moz-available" };
        if (props.tribe) imageStyle["display"] = "block";
        return (
            <Portrait
                onClick={() => this.onClick()}
                className={heroIsPregame(props) ? "rainbow" : ""}
                style={{
                    animationDelay: `${-(rng().randomFloat() * 3)}s`,
                    animationDirection: `${rng().flipCoin() ? "normal" : "reverse"}`,

                    backgroundColor: this.controller.backgroundColor(props),
                }}
            >
                <Img src={props.imageURL} style={imageStyle} />
                {tribe}
                {props.name}
                <br />
                {<Subtitle>{subtitle}</Subtitle>}
            </Portrait>
        );
    }
}

const TribeStyle = styled.div`
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    overflow: clip;
    display: block;
    min-height: 21px;
    font-weight: normal;
`;

function getImageClass(props: PortraitProps) {
    let imageClass = props.isEvicted ? Grayscale : Normal;
    imageClass = props.isJury ? Sepia : imageClass;
    return imageClass;
}
