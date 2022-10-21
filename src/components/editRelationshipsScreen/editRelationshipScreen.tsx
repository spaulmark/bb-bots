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
import { Subject, Subscription } from "rxjs";
import { isWellDefined } from "../../utils";
import { shuffle } from "lodash";

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

// subject for updating relationships
export const relationshipUpdate$ = new Subject<{ hero: number; villain: number; relationship: number }>();

export class EditRelationshipsScreen extends React.Component<
    RelationshipScreenProps,
    RelationshipScreenState
> {
    private subs: Subscription[] = [];
    public constructor(props: RelationshipScreenProps) {
        super(props);
        const currentTribes =
            props.currentTribes ||
            (props.initialTribes ? this.initalizeTribes(props.profiles, props.initialTribes) : {});
        this.state = {
            cast: props.profiles,
            relationships: props.relationships || firstImpressionsMap(props.profiles.length),
            currentTribes,
            selectedPlayer: undefined,
            swapButtonActive: false,
        };
    }

    private initalizeTribes(profiles: PlayerProfile[], initialTribes: Tribe[]): { [id: number]: Tribe } {
        const ids: number[] = [...profiles.keys()];
        const shuffledIds = shuffle(ids);
        const result: { [id: number]: Tribe } = {};
        shuffledIds.forEach((id, i) => {
            const tribe = initialTribes[i % initialTribes.length];
            result[id] = tribe;
        });
        return result;
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
            }),
            relationshipUpdate$.subscribe({
                next: (update) => {
                    const newState = { ...this.state };
                    newState.relationships[update.hero][update.villain] = update.relationship;
                    newState.relationships[update.villain][update.hero] = update.relationship;
                    this.setState(newState);
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
            this.state.currentTribes,
            true,
            this.state.swapButtonActive
        );
        const someoneSelected = isWellDefined(this.state.selectedPlayer);

        // no one selected: Select a houseguest to edit their relationships
        // someone selected but swap button not active: Select a houseguest to edit their relationships
        // swap button active: Select a houseguest to swap with
        const helpText = someoneSelected
            ? this.state.swapButtonActive
                ? "Select a houseguest to swap with."
                : `Select another houseguest to edit their relationship with ${
                      this.state.cast[this.state.selectedPlayer!].name
                  }.`
            : `Select a houseguest to edit their relationships${
                  props.initialTribes?.length ? " and change their team" : ""
              }.`;

        return (
            <HasText>
                <MemoryWall houseguests={profiles} />
                <Centered>
                    <button
                        className={`button is-primary ${this.state.swapButtonActive ? `is-light` : ``}`}
                        disabled={!someoneSelected}
                        onClick={() => {
                            this.setState({ swapButtonActive: !this.state.swapButtonActive });
                        }}
                    >
                        {this.state.swapButtonActive ? "Cancel" : "Swap"}
                    </button>
                </Centered>
                <CenteredBold>{helpText}</CenteredBold>
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
    currentTribes: { [id: number]: Tribe },
    editable: boolean,
    ignoreSelected: boolean
) {
    const _profiles = cast.map((profile, i) => {
        const myRelationships = Object.values(relationships[i]);
        const popularity = myRelationships.reduce((a, b) => a + b, 0) / myRelationships.length;
        return {
            ...profile,
            popularity,
            tribe: currentTribes[i],
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
