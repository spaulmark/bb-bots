import React from "react";
import { PlayerProfile } from "../../model";
import { MemoryWall } from "../memoryWall";
import { HasText } from "../layout/text";
import { popularityMode } from "../../model/portraitDisplayMode";
import { displayMode$, pushToMainContentStream, switchSceneRelative } from "../../subjects/subjects";
import { selectedColor } from "../playerPortrait/houseguestPortraitController";
import { Screens, TopbarLink } from "../topbar/topBar";
import { SeasonEditorPage } from "../seasonEditor/seasonEditorPage";
import { Centered, CenteredBold } from "../layout/centered";
import { CastingScreen } from "../castingScreen/castingScreen";
import { DeckScreen } from "../deckScreen/deckScreen";
import { EditRelationshipsScreen } from "../editRelationshipsScreen/editRelationshipScreen";
import { Tribe } from "../../model/tribe";

interface PregameScreenOptions {
    tribes?: Tribe[];
    relationships?: { [id: number]: { [id: number]: number } }; // hero -> villain -> relationship
}

export interface PregameScreenProps {
    cast: PlayerProfile[];
    options?: PregameScreenOptions;
}

export class PregameScreen extends React.Component<PregameScreenProps, {}> {
    public componentDidMount() {
        displayMode$.next(popularityMode);
    }

    public render() {
        const props = this.props;
        return (
            <HasText>
                <h2
                    style={{
                        color: selectedColor.toHex(),
                        textShadow: "rgb(114, 46, 123) 2px 2px 0px",
                        textAlign: "center",
                    }}
                >
                    Big Brother Bots
                </h2>
                <CenteredBold>Big Brother Bots is a simulator for the reality show Big Brother.</CenteredBold>
                <Centered>
                    <TopbarLink
                        onClick={() => {
                            pushToMainContentStream(<DeckScreen />, Screens.Deck);
                        }}
                    >
                        Choose characters
                    </TopbarLink>{" "}
                    from 300+ collections, or{" "}
                    <TopbarLink
                        onClick={() => {
                            pushToMainContentStream(<CastingScreen cast={[]} />, Screens.Casting);
                        }}
                    >
                        upload your own
                    </TopbarLink>
                    , then{" "}
                    <TopbarLink
                        onClick={() => {
                            pushToMainContentStream(<SeasonEditorPage />, Screens.Season);
                        }}
                    >
                        add twists
                    </TopbarLink>{" "}
                    and watch as everyone votes each other out until one winner remains!
                </Centered>
                {props.cast.length === 0 ? "" : <MemoryWall houseguests={props.cast} />}
                {props.cast.length === 0 ? (
                    ""
                ) : (
                    <p>
                        <b> {"You can use the ⬅️ and ➡️ arrow keys to move forwards and backwards."}</b>
                    </p>
                )}
                <div style={{ justifyContent: "space-between", display: "flex" }}>
                    {props.cast.length === 0 ? (
                        ""
                    ) : (
                        <button className="button is-success" onClick={() => switchSceneRelative(1)}>
                            Start Game
                        </button>
                    )}
                    {props.cast.length === 0 ? (
                        ""
                    ) : (
                        <button
                            className="button is-primary"
                            onClick={() =>
                                pushToMainContentStream(
                                    <EditRelationshipsScreen
                                        profiles={props.cast}
                                        tribes={props.options?.tribes}
                                        relationships={props.options?.relationships}
                                    />,
                                    Screens.EditRelationships
                                )
                            }
                        >
                            Edit Relationships
                        </button>
                    )}
                </div>
            </HasText>
        );
    }
}
