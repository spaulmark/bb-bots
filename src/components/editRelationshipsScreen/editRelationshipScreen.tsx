import React from "react";
import { PlayerProfile } from "../../model";
import { MemoryWall } from "../memoryWall";
import { HasText } from "../layout/text";
import { CenteredBold } from "../layout/centered";

interface RelationshipScreenProps {
    cast: PlayerProfile[];
}

// TODO: a state with houseguests and relationships
// oh wow and we also have to update all the popularities and stuff hahaha

export class EditRelationshipsScreen extends React.Component<RelationshipScreenProps, {}> {
    public constructor(props: RelationshipScreenProps) {
        super(props);
    }

    public componentDidMount() {
        // TODO: generate initial relationships if none exist
        // TODO: arrows disabled
    }

    public render() {
        const props = this.props;
        return (
            <HasText>
                <MemoryWall houseguests={props.cast} />
                <CenteredBold> {"Select a houseguest to edit their relationships."}</CenteredBold>
                {props.cast.length === 0 ? (
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
