import React from "react";
import { firstImpressionsMap, GameState, PlayerProfile } from "../../model";
import { MemoryWall } from "../memoryWall";
import { HasText } from "../layout/text";
import { Centered, CenteredBold } from "../layout/centered";
import { Tribe } from "../../model/tribe";
import { classifyRelationship, RelationshipType } from "../../utils/ai/classifyRelationship";
import {
    getCast,
    newEpisode,
    overwriteCast,
    pushToMainContentStream,
    selectedPlayer$,
} from "../../subjects/subjects";
import { PregameScreen } from "../pregameScreen/pregameScreen";
import { Screens } from "../topbar/topBar";
import { PregameEpisode } from "../episode/pregameEpisode";
import { selectPlayer } from "../playerPortrait/selectedPortrait";
import { getLastJurySize } from "../seasonEditor/seasonEditorPage";
import { Subscription } from "rxjs";
import { isWellDefined } from "../../utils";

interface RelationshipScreenProps {
    profiles: PlayerProfile[];
    initialTribes?: Tribe[];
    currentTribes?: { [id: number]: Tribe };
    relationships?: { [id: number]: { [id: number]: number } }; // hero -> villain -> relationship
}

interface RelationshipScreenState {
    cast: PlayerProfile[];
    relationships: { [id: number]: { [id: number]: number } }; // hero -> villain -> relationship
    currentTribes: { [id: number]: Tribe };
    selectedPlayer: number | undefined;
    swapButtonActive: boolean;
}

export class EditRelationshipsScreen extends React.Component<
    RelationshipScreenProps,
    RelationshipScreenState
> {
    private subs: Subscription[] = [];
    public constructor(props: RelationshipScreenProps) {
        super(props);
        this.state = {
            cast: props.profiles,
            relationships: props.relationships || firstImpressionsMap(props.profiles.length),
            currentTribes: {}, // TODO: randomly assign tribes if there are no preset tribes
            selectedPlayer: undefined,
            swapButtonActive: false,
        };
    }

    public componentDidMount() {
        this.subs.push(
            selectedPlayer$.subscribe({
                next: (player) => {
                    if (
                        this.state.swapButtonActive &&
                        isWellDefined(player) &&
                        isWellDefined(this.state.selectedPlayer) // probably redundant but it's only one boolean
                    ) {
                        const state = { ...this.state };
                        const hero = state.cast[this.state.selectedPlayer || 0]; // its never 0
                        const villain = state.cast[player!.id];
                        const tempImage = hero.imageURL;
                        const tempName = hero.name;
                        hero.imageURL = villain.imageURL;
                        hero.name = villain.name;
                        villain.imageURL = tempImage;
                        villain.name = tempName;
                        selectPlayer(null);
                        return;
                    }

                    const swapButtonActive = false;
                    this.setState({ selectedPlayer: player?.id, swapButtonActive });
                },
            })
        );
    }

    public componentWillUnmount() {
        this.subs.forEach((sub) => sub.unsubscribe());
    }

    public render() {
        const props = this.props;
        const profiles = getProfiles(
            this.state.cast,
            this.state.relationships,
            true,
            this.state.swapButtonActive
        );
        return (
            <HasText>
                <MemoryWall houseguests={profiles} />
                <Centered>
                    <button
                        className={`button is-primary ${this.state.swapButtonActive ? `is-light` : ``}`}
                        disabled={!isWellDefined(this.state.selectedPlayer)}
                        onClick={() => {
                            this.setState({ swapButtonActive: !this.state.swapButtonActive });
                        }}
                    >
                        {this.state.swapButtonActive ? "Cancel" : "Swap"}
                    </button>
                </Centered>
                <CenteredBold>
                    {this.state.swapButtonActive
                        ? "Select a houseguest to swap with."
                        : "Select a houseguest to edit their relationships."}
                </CenteredBold>
                {props.profiles.length === 0 ? (
                    ""
                ) : (
                    <button
                        className="button is-success"
                        onClick={async () => {
                            overwriteCast(this.state.cast, {
                                relationships: this.state.relationships,
                                initialTribes: this.props.initialTribes,
                                currentTribes: this.state.currentTribes,
                            });
                            selectPlayer(null);
                            // vscode says the awaits are unnessecary here,
                            // but if you remove them then bad things happen
                            await newEpisode(null);
                            await newEpisode(
                                new PregameEpisode(
                                    new GameState({ players: getCast(), jury: getLastJurySize() })
                                )
                            );
                            pushToMainContentStream(
                                <PregameScreen cast={this.state.cast} options={this.state} />,
                                Screens.Ingame
                            );
                        }}
                    >
                        Submit
                    </button>
                )}
            </HasText>
        );
    }
}
export function getProfiles(
    cast: PlayerProfile[],
    relationships: { [id: number]: { [id: number]: number } },
    editable: boolean,
    ignoreSelected: boolean
) {
    const _profiles = cast.map((profile, i) => {
        const myRelationships = Object.values(relationships[i]);
        const popularity = myRelationships.reduce((a, b) => a + b, 0) / myRelationships.length;
        return {
            ...profile,
            popularity,
            editable,
            id: i,
        };
    });
    const profiles = _profiles.map((hero, i) => {
        const myRelationships = relationships[i];
        let friends = 0;
        let enemies = 0;
        Object.entries(myRelationships).forEach(([villain, relationship]) => {
            const type = classifyRelationship(
                hero.popularity,
                _profiles[parseInt(villain)].popularity,
                relationship
            );
            if (type === RelationshipType.Friend) {
                friends++;
            } else if (type === RelationshipType.Enemy) {
                enemies++;
            }
        });
        return {
            ...hero,
            friends,
            enemies,
            ignoreSelected,
            relationships: myRelationships,
        };
    });
    return profiles;
}
