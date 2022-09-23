import React from "react";
import { PlayerProfile } from "../../model";
import { MemoryWall } from "../memoryWall";
import { HasText } from "../layout/text";
import { CenteredBold } from "../layout/centered";
import { Tribe } from "../../model/tribe";

interface RelationshipScreenProps {
    profiles: PlayerProfile[];
    tribes?: Tribe[];
    relationships?: { [id: number]: { [id: number]: number } }; // hero -> villain -> relationship
}

interface RelationshipScreenState {
    cast: PlayerProfile[];
}

// TODO: a state with houseguests and relationships
// oh wow and we also have to update all the popularities and stuff hahaha

export class EditRelationshipsScreen extends React.Component<
    RelationshipScreenProps,
    RelationshipScreenState
> {
    public constructor(props: RelationshipScreenProps) {
        super(props);
    }

    public componentDidMount() {
        // TODO: generate initial relationships if none exist
    }

    public render() {
        const props = this.props;
        return (
            <HasText>
                <MemoryWall houseguests={props.profiles} />
                <CenteredBold> {"Select a houseguest to edit their relationships."}</CenteredBold>
                {props.profiles.length === 0 ? (
                    ""
                ) : (
                    <button className="button is-success" onClick={() => console.log("TODO:")}>
                        Submit
                    </button>
                )}
            </HasText>
        );
    }
}
