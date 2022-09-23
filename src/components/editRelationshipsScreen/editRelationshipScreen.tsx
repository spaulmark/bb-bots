import React from "react";
import { firstImpressionsMap, PlayerProfile } from "../../model";
import { MemoryWall } from "../memoryWall";
import { HasText } from "../layout/text";
import { CenteredBold } from "../layout/centered";
import { Tribe } from "../../model/tribe";
import { classifyRelationship, RelationshipType } from "../../utils/ai/classifyRelationship";
import { overwriteCast, pushToMainContentStream } from "../../subjects/subjects";
import { PregameScreen } from "../pregameScreen/pregameScreen";
import { Screens } from "../topbar/topBar";

interface RelationshipScreenProps {
    profiles: PlayerProfile[];
    initialTribes?: Tribe[];
    relationships?: { [id: number]: { [id: number]: number } }; // hero -> villain -> relationship
}

interface RelationshipScreenState {
    cast: PlayerProfile[];
    relationships: { [id: number]: { [id: number]: number } }; // hero -> villain -> relationship
    currentTribes: { [id: number]: Tribe };
}

// TODO: a state with houseguests and relationships
// oh wow and we also have to update all the popularities and stuff hahaha

export class EditRelationshipsScreen extends React.Component<
    RelationshipScreenProps,
    RelationshipScreenState
> {
    public constructor(props: RelationshipScreenProps) {
        super(props);
        this.state = {
            cast: props.profiles,
            relationships: props.relationships || firstImpressionsMap(props.profiles.length),
            currentTribes: {}, // TODO: randomly assign tribes if there are no preset tribes
        };
    }

    public render() {
        const props = this.props;
        const _profiles = this.state.cast.map((profile, i) => {
            const myRelationships = Object.values(this.state.relationships[i]);
            const popularity = myRelationships.reduce((a, b) => a + b, 0) / myRelationships.length;
            return {
                ...profile,
                popularity,
                id: i,
            };
        });
        const profiles = _profiles.map((hero, i) => {
            const myRelationships = this.state.relationships[i];
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
            };
        });
        // TODO: selecting HGs, and then selecting their relationships
        return (
            <HasText>
                <MemoryWall houseguests={profiles} />
                <CenteredBold> {"Select a houseguest to edit their relationships."}</CenteredBold>
                {props.profiles.length === 0 ? (
                    ""
                ) : (
                    <button
                        className="button is-success"
                        onClick={() => {
                            overwriteCast(this.state.cast, {
                                relationships: this.state.relationships,
                                initialTribes: this.props.initialTribes,
                                currentTribes: this.state.currentTribes,
                            });
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
